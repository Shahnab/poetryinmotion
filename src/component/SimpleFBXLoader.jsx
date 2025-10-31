import { useFBX } from '@react-three/drei'
import * as THREE from 'three'

export default function SimpleFBXLoader({ path, scale = 1, position = [0, 0, 0] }) {
    const fbx = useFBX(path)
    
    // Apply simple material to all meshes
    if (fbx) {
        fbx.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 'white',
                    metalness: 0,
                    roughness: 0.5
                })
            }
        })
    }
    
    return (
        <primitive 
            object={fbx}
            scale={scale}
            position={position}
        />
    )
}