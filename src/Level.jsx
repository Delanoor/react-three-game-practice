import { Float, Text, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useState, useRef, useMemo } from "react";
import * as THREE from "three";
import useGame from "./stores/useGame";
THREE.ColorManagement.legacyMode = false;

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const floor1Material = new THREE.MeshStandardMaterial({
    color: "#111111",
    metalness: 0,
    roughness: 0,
});
const floor2Material = new THREE.MeshStandardMaterial({
    color: "#222222",
    metalness: 0,
    roughness: 0,
});
const obstacleMaterial = new THREE.MeshStandardMaterial({
    color: "#ff0000",
    metalness: 0,
    roughness: 1,
});
const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#887777",
    metalness: 0,
    roughness: 0,
});
const wallFinalMaterial = new THREE.MeshStandardMaterial({
    color: "#049ef4",
    metalness: 0,
    roughness: 0,
});

export function BlockStart({ position = [0, 0, 0] }) {
    return (
        <group position={position}>
            <Float>
                <Text
                    font="bebas-neue-v9-latin-regular.woff"
                    scale={0.8}
                    maxWidth={4}
                    textAlign="right"
                    position={[-1, 0.9, 0]}
                    rotation={[0, Math.PI / 2, 0]}
                >
                    Rolling Bird
                    <meshBasicMaterial toneMapped={false} />
                </Text>
            </Float>
            <mesh
                geometry={boxGeometry}
                material={floor1Material}
                receiveShadow
                position={[0, -0.1, 0]}
                scale={[4, 0.2, 4]}
            />
        </group>
    );
}
function BlockEnd({ position = [0, 0, 0] }) {
    const hamburger = useGLTF("./hamburger.glb");
    const end = useGame((state) => state.end);

    hamburger.scene.children.forEach((mesh) => {
        mesh.castShadow = true;
    });

    const collisionEnter = () => {
        end();
    };

    return (
        <group position={position}>
            <Text
                font="bebas-neue-v9-latin-regular.woff"
                scale={0.8}
                maxWidth={4}
                textAlign="right"
                position={[0, 2.25, 0]}
                rotation={[0, 0, 0]}
            >
                Finish
                <meshBasicMaterial toneMapped={false} />
            </Text>
            <mesh
                geometry={boxGeometry}
                material={floor1Material}
                receiveShadow
                position={[0, -0.1, 0]}
                scale={[4, 0.2, 4]}
            />

            {/* hamburger */}
            <RigidBody
                type="fixed"
                position={[0, 0.25, 0]}
                colliders="hull"
                restitution={0.2}
                friction={0}
                onCollisionEnter={collisionEnter}
            >
                <primitive object={hamburger.scene} scale={0.2} />
            </RigidBody>
        </group>
    );
}

export function BlockSpinner({ position = [0, 0, 0] }) {
    const obstacle = useRef();
    const [speed] = useState(
        () => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
    );

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const rotation = new THREE.Quaternion();

        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
        obstacle.current.setNextKinematicRotation(rotation);
    });
    return (
        <>
            <group position={position}>
                <mesh
                    geometry={boxGeometry}
                    material={floor2Material}
                    receiveShadow
                    position={[0, -0.1, 0]}
                    scale={[4, 0.2, 4]}
                />

                <RigidBody
                    ref={obstacle}
                    type="kinematicPosition"
                    position={[0, 0.3, 0]}
                    restitution={0.2}
                    friction={0}
                >
                    <mesh
                        geometry={boxGeometry}
                        material={obstacleMaterial}
                        scale={[3.5, 0.3, 0.3]}
                        castShadow
                        receiveShadow
                    />
                </RigidBody>
            </group>
        </>
    );
}
export function BlockLimbo({ position = [0, 0, 0] }) {
    const obstacle = useRef();
    const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        const y = Math.sin(time + timeOffset) + 1.15;
        obstacle.current.setNextKinematicTranslation({
            x: position[0],
            y: position[1] + y,
            z: position[2],
        });

        // obstacle.current.setKinematicTranslation({ x: x, y: 0, z: z });
    });
    return (
        <>
            <group position={position}>
                <mesh
                    geometry={boxGeometry}
                    material={floor2Material}
                    receiveShadow
                    position={[0, -0.1, 0]}
                    scale={[4, 0.2, 4]}
                />

                <RigidBody
                    ref={obstacle}
                    type="kinematicPosition"
                    position={[0, 0.3, 0]}
                    restitution={0.2}
                    friction={0}
                >
                    <mesh
                        geometry={boxGeometry}
                        material={obstacleMaterial}
                        scale={[3.5, 0.3, 0.3]}
                        castShadow
                        receiveShadow
                    />
                </RigidBody>
            </group>
        </>
    );
}
export function BlockAxe({ position = [0, 0, 0] }) {
    const obstacle = useRef();
    const [timeOffset] = useState(() => Math.random() * Math.PI * 2);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        const x = Math.cos(time + timeOffset) * 1.25;

        obstacle.current.setNextKinematicTranslation({
            x: position[0] + x,
            y: position[1] + 0.75,
            z: position[2],
        });

        // obstacle.current.setKinematicTranslation({ x: x, y: 0, z: z });
    });
    return (
        <>
            <group position={position}>
                <mesh
                    geometry={boxGeometry}
                    material={floor2Material}
                    receiveShadow
                    position={[0, -0.1, 0]}
                    scale={[4, 0.2, 4]}
                />

                <RigidBody
                    ref={obstacle}
                    type="kinematicPosition"
                    position={[0, 0.3, 0]}
                    restitution={0.2}
                    friction={0}
                >
                    <mesh
                        geometry={boxGeometry}
                        material={obstacleMaterial}
                        scale={[1.5, 1.5, 0.3]}
                        castShadow
                        receiveShadow
                    />
                </RigidBody>
            </group>
        </>
    );
}

function Walls({ length = 1 }) {
    return (
        <>
            <RigidBody type="fixed" restitution={0.2} friction={0}>
                <mesh
                    position={[2.15, 0.75, -(length * 2) + 2]}
                    geometry={boxGeometry}
                    material={wallMaterial}
                    scale={[0.3, 1.5, length * 4]}
                    castShadow
                />
                <mesh
                    position={[-2.15, 0.75, -(length * 2) + 2]}
                    geometry={boxGeometry}
                    material={wallMaterial}
                    scale={[0.3, 1.5, length * 4]}
                    receiveShadow
                />
                <mesh
                    position={[0, 0.75, -(length * 4) + 2]}
                    geometry={boxGeometry}
                    material={wallFinalMaterial}
                    scale={[4, 1.5, 0.3]}
                    receiveShadow
                />
                <CuboidCollider
                    args={[2, 0.1, 2 * length]}
                    position={[0, -0.1, -(length * 2) + 2]}
                    restitution={0.2}
                    friction={1}
                />
            </RigidBody>
        </>
    );
}

export function Level({
    count = 5,
    types = [BlockSpinner, BlockAxe, BlockLimbo],
    seed = 0,
}) {
    const blocks = useMemo(() => {
        const blocks = [];

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            blocks.push(type);
        }

        return blocks;
    }, [count, types, seed]);
    return (
        <>
            <BlockStart position={[0, 0, 0]} />
            {blocks.map((Block, index) => {
                return (
                    <Block key={index} position={[0, 0, -(index + 1) * 4]} />
                );
            })}
            <Walls length={count + 2} />
            <BlockEnd position={[0, 0, -(count + 1) * 4]} />
        </>
    );
}
