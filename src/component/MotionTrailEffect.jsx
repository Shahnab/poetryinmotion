import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { useRef, useMemo, useEffect } from 'react'
import { folder, useControls } from 'leva'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function MotionTrailEffect({ isPaused = false }) {
  const controls = useControls('Motion Trail Effect', {
    Trail: folder({
      enabled: { value: true, label: "Trail Enabled" },
      decay: { value: 0.92, min: 0.5, max: 0.99, step: 0.01, label: "Trail Decay" },
      intensity: { value: 1.0, min: 0, max: 2, step: 0.1, label: "Trail Intensity" },
    }),
    Bloom: folder({
      bloomEnabled: { value: true, label: "Bloom Enabled" },
      bloomIntensity: { value: 2.0, min: 0, max: 5, step: 0.1 },
      bloomThreshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
      bloomSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 },
    }),
  }, { collapsed: true })

  const { gl, scene, camera, size } = useThree()
  
  // Create render targets for trail effect
  const renderTargetA = useFBO(size.width, size.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  })
  
  const renderTargetB = useFBO(size.width, size.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  })

  const currentBuffer = useRef(renderTargetA)
  const previousBuffer = useRef(renderTargetB)

  // Fullscreen quad for compositing
  const quadCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const quadGeometry = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  // Trail shader material
  const trailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        tCurrent: { value: null },
        tPrevious: { value: null },
        decay: { value: controls.decay },
        intensity: { value: controls.intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tCurrent;
        uniform sampler2D tPrevious;
        uniform float decay;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          vec4 current = texture2D(tCurrent, vUv);
          vec4 previous = texture2D(tPrevious, vUv);
          
          // Accumulate trails by blending with decayed previous frame
          // The decay value controls how long trails persist
          vec3 accumulated = previous.rgb * decay + current.rgb;
          
          gl_FragColor = vec4(accumulated, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    })
  }, [])

  const trailScene = useMemo(() => {
    const scene = new THREE.Scene()
    scene.add(new THREE.Mesh(quadGeometry, trailMaterial))
    return scene
  }, [quadGeometry, trailMaterial])

  // Update uniforms when controls change
  useEffect(() => {
    trailMaterial.uniforms.decay.value = controls.decay
    trailMaterial.uniforms.intensity.value = controls.intensity
  }, [controls.decay, controls.intensity, trailMaterial])

  useFrame(() => {
    if (!controls.enabled) {
      // Just render normally without trail
      gl.setRenderTarget(null)
      gl.render(scene, camera)
      return
    }

    // Render current scene to a temporary buffer
    gl.setRenderTarget(currentBuffer.current)
    gl.clear()
    gl.render(scene, camera)

    // Now blend current frame with previous accumulated trails
    trailMaterial.uniforms.tCurrent.value = currentBuffer.current.texture
    trailMaterial.uniforms.tPrevious.value = previousBuffer.current.texture

    // Render the blended result to the other buffer
    const tempBuffer = currentBuffer.current
    currentBuffer.current = previousBuffer.current
    previousBuffer.current = tempBuffer

    gl.setRenderTarget(previousBuffer.current)
    gl.clear()
    gl.render(trailScene, quadCamera)

    // Finally, render the accumulated trails to screen
    gl.setRenderTarget(null)
    gl.clear()
    
    // Use a simple copy to screen
    const copyMaterial = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: previousBuffer.current.texture } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main() { gl_FragColor = texture2D(tDiffuse, vUv); }`,
    })
    
    const copyScene = new THREE.Scene()
    copyScene.add(new THREE.Mesh(quadGeometry, copyMaterial))
    gl.render(copyScene, quadCamera)
  }, 1)

  // Add bloom effect
  if (!controls.bloomEnabled) return null

  return (
    <EffectComposer>
      <Bloom
        intensity={controls.bloomIntensity}
        luminanceThreshold={controls.bloomThreshold}
        luminanceSmoothing={controls.bloomSmoothing}
      />
    </EffectComposer>
  )
}
