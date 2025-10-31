// hooks/useCustomFBX.js
import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

export function useCustomFBX(path) {
  const loader = useMemo(() => {
    const manager = new THREE.LoadingManager()
    
    // Suppress error messages for missing textures
    manager.onError = (url) => {
      // Silently ignore texture loading errors
      if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
        return
      }
      console.error('Loading error:', url)
    }
    
    manager.setURLModifier((url) => {
      if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
        // Return a data URL for a 1x1 transparent pixel to avoid 404s
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }
      return url
    })
    return new FBXLoader(manager)
  }, [])

  return useLoader(FBXLoader, path, (loaderInstance) => {
    loaderInstance.manager = loader.manager
  })
}
