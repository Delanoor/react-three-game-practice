import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import * as THREE from "three";

import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import useGame from "./stores/useGame";
import { BallCollider } from "@react-three/rapier";
export default function Player() {
    const model = useGLTF("./Sparrow/scene.gltf");
    const body = useRef();
    // body?.current?.setEnabledRotations({
    //     enableX: false,
    //     enableY: false,
    //     enableZ: false,
    // });
    const [subscribeKeys, getKeys] = useKeyboardControls();

    const rapier = useRapier();

    const [smoothedCameraPosition] = useState(() => new THREE.Vector3(0, 0, 0));
    const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

    const start = useGame((state) => state.start);
    const restart = useGame((state) => state.restart);

    const animations = useAnimations(model.animations, model.scene);

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

        // 0.15
        // if (hit.toi < 0.15) {
        //     body.current.applyImpulse({ x: 0, y: 0.5, z: 0 });
        // }
        const mass = body.current.mass();
        body.current.applyImpulse({ x: 0, y: 4 * mass, z: 0 });
    };

    const resetPosition = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 }); // reset position
        body.current.setLinvel({ x: 0, y: 0, z: 0 }); // reset linear velocity
        body.current.setAngvel({ x: 0, y: 0, z: 0 }); // reset angular velocity

        restart();
    };

    const [sparrowAnimation, setSparrowAnimation] = useState("Idle_A");

    useEffect(() => {
        const action = animations.actions[sparrowAnimation];
        action.reset().fadeIn(0.5).play();
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === "ready") {
                    resetPosition();
                    setSparrowAnimation("Idle_A");
                }
            }
        );
        const unsubscribeJump = subscribeKeys(
            (state) => state.jump, // selector
            (value) => {
                if (value) {
                    jump();
                    setSparrowAnimation("Fly");
                }
            }
        );

        const unsubscribeAnyKey = subscribeKeys(
            ({ forward, backward, leftward, rightward }) => {
                if (forward || backward || leftward || rightward) {
                    start();
                    setSparrowAnimation("Run");
                }
            }
        );

        return () => {
            unsubscribeJump();
            unsubscribeAnyKey();
            unsubscribeReset();
            action.fadeOut(0.5);
        };
    }, [sparrowAnimation]);

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

        // original camera position
        // cameraPosition.y += 0.65;
        // cameraPosition.z += 2.25;

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
        if (bodyPosition.y < -0.5) {
            setSparrowAnimation("Fly");
        }
        if (bodyPosition.y < -8) {
            resetPosition();
        }
    });

    return (
        <RigidBody
            ref={body}
            position={[0, 1, 0]}
            colliders="ball"
            // colliders={false}
            restitution={0.4}
            friction={1}
            linearDamping={0.5}
            angularDamping={0.5}
            rotation-y={Math.PI}
            mass={0.09}
            // gravityScale={0.5}
        >
            <primitive object={model.scene} position={[0, 0, 0]} />

            <BallCollider args={[0.4]} position={[0, 0.41, 0]} mass={0.09} />
            {/* <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial
                    color="red"
                    roughness={0.1}
                    envMapIntensity={0.2}
                    emissive="#370037"
                />
            </mesh> */}
        </RigidBody>
    );
}
