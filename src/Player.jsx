import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import * as THREE from "three";

import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import useGame from "./stores/useGame";

export default function Player() {
    const model = useGLTF("./Sparrow/scene.gltf");
    const body = useRef();
    const [subscribeKeys, getKeys] = useKeyboardControls();

    const rapier = useRapier();

    const [smoothedCameraPosition] = useState(() => new THREE.Vector3(0, 0, 0));
    const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

    const start = useGame((state) => state.start);
    const restart = useGame((state) => state.restart);

    const animations = useAnimations(model.animations);

    if (model) {
        model.scene.traverse((children) => {
            if (children instanceof THREE.Mesh) {
                children.castShadow = true;
            }
        });
    }

    const jump = () => {
        const world = rapier.world.raw();
        const origin = body.current.translation();

        origin.y -= 0.31;

        const direction = { x: 0, y: -1, z: 0 };
        const ray = new rapier.rapier.Ray(origin, direction);
        const hit = world.castRay(ray, 10, true); //(ray, maxDistance, true)

        // console.log(hit.toi);
        // 0.15
        if (hit.toi < 1.75) {
            body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
        }
    };

    const reset = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 }); // reset position
        body.current.setLinvel({ x: 0, y: 0, z: 0 }); // reset linear velocity
        body.current.setAngvel({ x: 0, y: 0, z: 0 }); // reset angular velocity
        restart();
    };

    useEffect(() => {
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === "ready") {
                    reset();
                }
            }
        );
        const unsubscribeJump = subscribeKeys(
            (state) => state.jump, // selector
            (value) => {
                if (value) {
                    jump();
                }
            }
        );

        const unsubscribeAnyKey = subscribeKeys(
            ({ forward, backward, leftward, rightward }) => {
                if (forward || backward || leftward || rightward) {
                    start();
                }
            }
        );

        return () => {
            unsubscribeJump();
            unsubscribeAnyKey();
            unsubscribeReset();
        };
    }, []);

    useFrame((state, delta) => {
        // Controls
        const { forward, backward, leftward, rightward, resetting } = getKeys();
        if (resetting) {
            restart();
        }
        const impulse = { x: 0, y: 0, z: 0 };
        const torque = { x: 0, y: 0, z: 0 };

        const impulseStrength = 0.6 * delta;
        const torqueStrength = 0.2 * delta;

        if (forward) {
            impulse.z -= impulseStrength;
            torque.x -= torqueStrength;
        }
        if (rightward) {
            impulse.x += impulseStrength;
            torque.z -= torqueStrength;
        }
        if (backward) {
            impulse.z += impulseStrength;
            torque.x += torqueStrength;
        }
        if (leftward) {
            impulse.x -= impulseStrength;
            torque.z += torqueStrength;
        }

        const velocity = body.current.linvel();

        body.current.applyImpulse(impulse);

        body.current.applyTorqueImpulse(torque);

        // Camera
        const bodyPosition = body.current.translation();

        const cameraPosition = new THREE.Vector3();
        cameraPosition.copy(bodyPosition);
        cameraPosition.x += 5.0;
        cameraPosition.z += 8.25;
        cameraPosition.y += 8.65;

        const cameraTarget = new THREE.Vector3();
        cameraTarget.copy(bodyPosition);
        cameraTarget.y += 0.25;

        const LERP_STEP = delta * 5;

        smoothedCameraPosition.lerp(cameraPosition, LERP_STEP);
        smoothedCameraTarget.lerp(cameraTarget, LERP_STEP);

        state.camera.position.copy(smoothedCameraPosition);
        state.camera.lookAt(smoothedCameraTarget);

        /*
         * Phase
         */
        if (bodyPosition.y < -4) {
            reset();
        }
    });

    return (
        <RigidBody
            ref={body}
            position={[0, 1, 0]}
            colliders="ball"
            restitution={0.4}
            friction={1}
            linearDamping={0.5}
            angularDamping={0.5}
            rotation-y={Math.PI}
        >
            {/* <primitive object={model.scene} /> */}
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial
                    // flatShading
                    color="red"
                    roughness={0.1}
                    envMapIntensity={0.2}
                    emissive="#370037"
                />
            </mesh>
        </RigidBody>
    );
}
