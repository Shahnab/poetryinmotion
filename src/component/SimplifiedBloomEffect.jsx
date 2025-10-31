import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import { folder, useControls } from 'leva'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function SimplifiedBloomEffect({ isPaused = false }) {
  const controls = useControls('Bloom Effect', {
    enabled: { value: true, label: "Bloom Enabled" },
    intensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
    luminanceThreshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
    luminanceSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 },
  }, { collapsed: true })

  if (!controls.enabled) return null

  return (
    <EffectComposer>
      <Bloom
        intensity={controls.intensity}
        luminanceThreshold={controls.luminanceThreshold}
        luminanceSmoothing={controls.luminanceSmoothing}
      />
    </EffectComposer>
  )
}
