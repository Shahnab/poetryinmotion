import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useState, useRef } from "react";
import { CameraControls, useAnimations } from "@react-three/drei";
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Lighting from "../component/Lighting.jsx";
import { AnimatedGhostTrail } from "../component/AnimatedGhostTrail.jsx";
import MusicPlayer from "../component/MusicPlayer.jsx";
import { useCustomFBX } from "../component/useCustomFBX.js";
import { Leva } from 'leva';
import { customTheme } from "../r3f-gist/theme/levaTheme.js";
import * as THREE from 'three';

// Simple FBX test component with animation
function SimpleFBXTest({ isPaused, shouldRestart }) {
    const fbx = useCustomFBX('ballerina_dance_smooth.fbx');
    const { actions, names, mixer } = useAnimations(fbx.animations, fbx);
    const lastRestartKey = useRef(0);
    
    useEffect(() => {
        if (actions && names.length > 0) {
            const action = actions[names[0]];
            if (action) {
                action.play();
            }
        }
    }, [actions, names]);
    
    // Restart animation when shouldRestart changes
    useEffect(() => {
        if (shouldRestart > 0 && shouldRestart !== lastRestartKey.current && mixer && actions && names.length > 0) {
            lastRestartKey.current = shouldRestart;
            
            // Reset animation to beginning
            mixer.setTime(0);
            
            // Make sure animation is playing
            const action = actions[names[0]];
            if (action) {
                action.paused = false;
                action.play();
            }
            
            console.log('Ballerina restarted');
        }
    }, [shouldRestart, mixer, actions, names]);
    
    // Handle pause state (but don't apply if we just restarted)
    useEffect(() => {
        if (actions && names.length > 0 && shouldRestart === lastRestartKey.current) {
            const action = actions[names[0]];
            if (action) {
                action.paused = isPaused;
            }
        }
    }, [isPaused, actions, names, shouldRestart]);
    
    if (fbx) {
        fbx.scale.setScalar(0.01);
        fbx.position.set(0, -1, 0);
        fbx.rotation.set(0, Math.PI * -0.25, 0);
        fbx.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 'white',
                    metalness: 0.1,
                    roughness: 0.8
                });
            }
        });
    }
    
    return <primitive object={fbx} />;
}

export default function App() { 
    const [hidden, setHidden] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [restartKey, setRestartKey] = useState(0);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.code === 'KeyH') {
                setHidden(prev => !prev);
            } else if (event.code === 'Space') {
                event.preventDefault(); // Prevent page scroll
                // Save pause flag to localStorage before refresh
                localStorage.setItem('waspaused', 'true');
                // Refresh the page to go back to "Click to Start" screen
                window.location.reload();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isPaused]);
 
    return <>
        <Leva theme={customTheme} hidden={hidden} collapsed={true} />
        <MusicPlayer isPaused={isPaused} restartKey={restartKey} />
        
        <Canvas
            shadows
            camera={{
                fov: 30,
                near: 0.1,
                far: 200,
                position: [0, 1, 5.5]
            }}
        >
            <color attach="background" args={['#000000']} />
            <CameraControls makeDefault />
            <Lighting helper={false} />

            <Suspense fallback={null}>
                <SimpleFBXTest isPaused={isPaused} shouldRestart={restartKey} />
                <AnimatedGhostTrail 
                    numberOfGhosts={4}
                    spacing={0.15}
                    minOpacity={0.03}
                    maxOpacity={0.25}
                    isPaused={isPaused}
                    shouldRestart={restartKey}
                />
            </Suspense>
            
            <EffectComposer>
                <Bloom
                    intensity={2.0}
                    luminanceThreshold={0.1}
                    luminanceSmoothing={0.9}
                />
            </EffectComposer>
        </Canvas>
    </>
}