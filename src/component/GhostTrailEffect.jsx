import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils'

/**
 * GhostTrailEffect - Creates motion trail by storing and rendering previous poses
 * @param {object} props
 * @param {THREE.Object3D} props.targetObject - The object to create trails for
 * @param {number} props.trailLength - Number of ghost frames (default: 5)
 * @param {number} props.trailSpacing - Frames between each ghost (default: 3)
 * @param {number} props.minOpacity - Minimum opacity for oldest ghost (default: 0.1)
 * @param {number} props.maxOpacity - Maximum opacity for newest ghost (default: 0.5)
 */
export function GhostTrailEffect({ 
  targetObject, 
  trailLength = 5, 
  trailSpacing = 3,
  minOpacity = 0.1,
  maxOpacity = 0.5
}) {
  const frameCountRef = useRef(0)
  const [ghostClones, setGhostClones] = useState([])
  const poseHistoryRef = useRef([])
  const initializedRef = useRef(false)

  // Create ghost materials with varying opacity
  const ghostMaterials = useMemo(() => {
    return Array.from({ length: trailLength }, (_, i) => {
      const t = i / (trailLength - 1)
      const opacity = THREE.MathUtils.lerp(maxOpacity, minOpacity, t)
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity,
        depthWrite: false,
        metalness: 0.1,
        roughness: 0.8
      })
    })
  }, [trailLength, minOpacity, maxOpacity])

  // Initialize ghost clones once
  useMemo(() => {
    if (targetObject && !initializedRef.current) {
      const clones = []
      for (let i = 0; i < trailLength; i++) {
        try {
          // Use SkeletonUtils to properly clone skinned meshes
          const clone = SkeletonUtils.clone(targetObject)
          clone.visible = false // Hide initially
          
          // Apply ghost material
          clone.traverse((child) => {
            if (child.isMesh) {
              child.material = ghostMaterials[i].clone()
              child.renderOrder = -i - 1
            }
          })
          
          clones.push(clone)
        } catch (error) {
          console.warn('Failed to clone model for ghost trail:', error)
        }
      }
      setGhostClones(clones)
      initializedRef.current = true
    }
  }, [targetObject, trailLength, ghostMaterials])

  useFrame(() => {
    if (!targetObject || ghostClones.length === 0) return

    frameCountRef.current++

    // Capture pose every trailSpacing frames
    if (frameCountRef.current % trailSpacing === 0) {
      const poseData = {
        position: targetObject.position.clone(),
        rotation: targetObject.rotation.clone(),
        scale: targetObject.scale.clone(),
        bones: []
      }

      // Store bone matrices
      targetObject.traverse((child) => {
        if (child.isSkinnedMesh && child.skeleton) {
          poseData.bones = child.skeleton.bones.map(bone => {
            const boneData = {
              position: bone.position.clone(),
              quaternion: bone.quaternion.clone(),
              scale: bone.scale.clone()
            }
            return boneData
          })
        }
      })

      poseHistoryRef.current.unshift(poseData)
      
      // Keep only the required number of poses
      if (poseHistoryRef.current.length > trailLength) {
        poseHistoryRef.current.pop()
      }
    }

    // Update ghost positions and poses
    ghostClones.forEach((ghost, index) => {
      const pose = poseHistoryRef.current[index]
      
      if (pose) {
        ghost.visible = true
        
        // Copy transform
        ghost.position.copy(pose.position)
        ghost.rotation.copy(pose.rotation)
        ghost.scale.copy(pose.scale)
        
        // Update skeleton bones
        if (pose.bones && pose.bones.length > 0) {
          ghost.traverse((child) => {
            if (child.isSkinnedMesh && child.skeleton) {
              child.skeleton.bones.forEach((bone, boneIndex) => {
                if (pose.bones[boneIndex]) {
                  bone.position.copy(pose.bones[boneIndex].position)
                  bone.quaternion.copy(pose.bones[boneIndex].quaternion)
                  bone.scale.copy(pose.bones[boneIndex].scale)
                }
              })
            }
          })
        }
      } else {
        ghost.visible = false
      }
    })
  })

  return (
    <group>
      {ghostClones.map((ghost, index) => (
        <primitive key={`ghost-${index}`} object={ghost} />
      ))}
    </group>
  )
}
