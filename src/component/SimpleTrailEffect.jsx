import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import * as THREE from 'three'

/**
 * SimpleTrailEffect - Creates motion blur/trail using frame blending
 * This uses a much simpler approach than skeleton cloning
 */
export function SimpleTrailEffect({ decay = 0.95 }) {
  const { gl, scene, camera, size } = useThree()
  const renderTargetA = useFBO(size.width, size.height)
  const renderTargetB = useFBO(size.width, size.height)
  const currentTarget = useRef(0)
  
  const blendMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tPrevious: { value: null },
        decay: { value: decay }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tPrevious;
        uniform float decay;
        varying vec2 vUv;
        
        void main() {
          vec4 current = texture2D(tDiffuse, vUv);
          vec4 previous = texture2D(tPrevious, vUv);
          
          // Blend current frame with decayed previous frame
          gl_FragColor = mix(current, previous, decay);
        }
      `,
      depthTest: false,
      depthWrite: false
    })
  ).current
  
  const quadCamera = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)).current
  const quadScene = useRef(new THREE.Scene()).current
  const quadMesh = useRef(
    new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      blendMaterial
    )
  ).current
  
  useRef(() => {
    quadScene.add(quadMesh)
  }, [])
  
  useFrame(() => {
    const readTarget = currentTarget.current === 0 ? renderTargetA : renderTargetB
    const writeTarget = currentTarget.current === 0 ? renderTargetB : renderTargetA
    
    // Render scene to temporary target
    gl.setRenderTarget(writeTarget)
    gl.render(scene, camera)
    
    // Blend with previous frame
    blendMaterial.uniforms.tDiffuse.value = writeTarget.texture
    blendMaterial.uniforms.tPrevious.value = readTarget.texture
    
    // Render to screen
    gl.setRenderTarget(null)
    gl.render(quadScene, quadCamera)
    
    // Swap targets
    currentTarget.current = 1 - currentTarget.current
  }, 1) // Priority 1 to render after normal scene
  
  return null
}
