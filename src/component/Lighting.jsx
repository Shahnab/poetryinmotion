import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function Lighting({ helper = false }) {
  const keyLightRef = useRef()
  const fillLightRef = useRef()
  const backLightRef = useRef()
  const upLightRef = useRef()
  const { scene } = useThree()

  // Fixed lighting values (no Leva controls)
  const keyLightEnabled = true
  const fillLightEnabled = true
  const backLightEnabled = true
  const upLightEnabled = true
  const ambientLightEnabled = true
  const keyLightIntensity = 0
  const fillLightIntensity = 0.53
  const backLightIntensity = 2.5
  const upLightIntensity = 1.5
  const ambientLightIntensity = 0.2

  useEffect(() => {
    const helpers = []
    if (helper) {
      if (keyLightRef.current) {
        const h = new THREE.DirectionalLightHelper(keyLightRef.current, 1, 'red')
        scene.add(h)
        helpers.push(h)
      }
      if (fillLightRef.current) {
        const h = new THREE.DirectionalLightHelper(fillLightRef.current, 1, 'blue')
        scene.add(h)
        helpers.push(h)
      }
      if (backLightRef.current) {
        const h = new THREE.DirectionalLightHelper(backLightRef.current, 1, 'green')
        scene.add(h)
        helpers.push(h)
      }
      if (upLightRef.current) {
        const h = new THREE.DirectionalLightHelper(upLightRef.current, 1, 'yellow')
        scene.add(h)
        helpers.push(h)
      }
    }
    return () => {
      helpers.forEach(h => {
        scene.remove(h)
        h.dispose && h.dispose()
      })
    }
  }, [helper, scene])

  // Calculate actual intensities based on enabled state and individual light toggles
  const actualKeyIntensity = keyLightEnabled ? keyLightIntensity : 0
  const actualFillIntensity = fillLightEnabled ? fillLightIntensity : 0
  const actualBackIntensity = backLightEnabled ? backLightIntensity : 0
  const actualUpIntensity = upLightEnabled ? upLightIntensity : 0
  const actualAmbientIntensity = ambientLightEnabled ? ambientLightIntensity : 0
  return (
    <>
      {/* === Key Light ===
          Main directional light from the front-side/top-right.
          Provides main lighting and casts shadows.
      */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 10, 5]}
        intensity={actualKeyIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* === Fill Light ===
          Soft light to reduce harsh shadows.
          Positioned on the opposite side of the key light.
      */}
      <directionalLight
        ref={fillLightRef}
        position={[-3, 5, 2]}
        intensity={actualFillIntensity}
      />

      {/* === Back Light (Rim Light) ===
          Positioned behind and above the object.
          Creates edge highlights and adds depth.
      */}
      <directionalLight
        ref={backLightRef}
        position={[-5, 10, -5]}
        intensity={actualBackIntensity}
      />
      {/* === Up Light ===
          Light from above the object.
          Creates subtle highlights on the top surface.
      */}

      <directionalLight ref={upLightRef} position={[5, -10, 5]} intensity={actualUpIntensity} />
      {/* === Ambient Light ===
          Uniform ambient light for subtle base illumination.
      */}
      <ambientLight intensity={actualAmbientIntensity} />
    </>
  )
}
