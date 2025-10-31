import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX, useAnimations, Clone } from '@react-three/drei'
import * as THREE from 'three'

/**
 * AnimatedGhostTrail - Creates ghost trail by rendering delayed animation clones
 * This approach works within R3F's rendering pipeline
 */
function GhostInstance({ delay, opacity, animationName, isPaused, shouldRestart }) {
    const fbx = useFBX('ballerina_dance_smooth.fbx')
    const group = useRef()
    const { actions, mixer } = useAnimations(fbx.animations, group)
    const materialRef = useRef()
    const lastRestartKey = useRef(0)
    
    useEffect(() => {
        if (!materialRef.current) {
            materialRef.current = new THREE.MeshStandardMaterial({
                color: 'white',
                transparent: true,
                opacity: opacity,
                depthWrite: false,
                metalness: 0.1,
                roughness: 0.8
            })
        }
    }, [opacity])
    
    useEffect(() => {
        if (actions && animationName) {
            const action = actions[animationName]
            if (action) {
                action.play()
                // Set initial time offset for delay
                if (mixer) {
                    mixer.setTime(mixer.time - delay)
                }
            }
        }
    }, [actions, animationName, mixer, delay])
    
    // Restart animation when shouldRestart changes
    useEffect(() => {
        if (shouldRestart > 0 && shouldRestart !== lastRestartKey.current && mixer && actions && animationName) {
            lastRestartKey.current = shouldRestart;
            
            // Reset time with delay offset
            mixer.setTime(Math.max(0, -delay));
            
            // Make sure animation is playing (unpause)
            const action = actions[animationName]
            if (action) {
                action.paused = false;
                action.play();
            }
            
            console.log(`Ghost ${delay}s restarted`);
        }
    }, [shouldRestart, mixer, delay, actions, animationName])
    
    // Handle pause state (but don't apply if we just restarted)
    useEffect(() => {
        if (actions && animationName && shouldRestart === lastRestartKey.current) {
            const action = actions[animationName]
            if (action) {
                action.paused = isPaused
            }
        }
    }, [isPaused, actions, animationName, shouldRestart])
    
    useEffect(() => {
        if (group.current && materialRef.current) {
            group.current.traverse((child) => {
                if (child.isMesh) {
                    child.material = materialRef.current
                    child.renderOrder = -Math.floor(delay * 100) // Render older ghosts first
                }
            })
        }
    })
    
    return (
        <Clone 
            ref={group}
            object={fbx} 
            scale={0.01} 
            position={[0, -1, 0]} 
            rotation={[0, Math.PI * -0.25, 0]}
        />
    )
}

export function AnimatedGhostTrail({ numberOfGhosts = 5, spacing = 0.1, minOpacity = 0.05, maxOpacity = 0.3, isPaused = false, shouldRestart }) {
    const fbx = useFBX('ballerina_dance_smooth.fbx')
    const animationName = fbx.animations[0]?.name || null
    
    if (!animationName) return null
    
    const ghosts = []
    for (let i = 1; i <= numberOfGhosts; i++) {
        const t = (i - 1) / (numberOfGhosts - 1)
        const opacity = THREE.MathUtils.lerp(maxOpacity, minOpacity, t)
        const delay = i * spacing
        
        ghosts.push(
            <GhostInstance
                key={`ghost-${i}`}
                delay={delay}
                opacity={opacity}
                animationName={animationName}
                isPaused={isPaused}
                shouldRestart={shouldRestart}
            />
        )
    }
    
    return <group>{ghosts}</group>
}
