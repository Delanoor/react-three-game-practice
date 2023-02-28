import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import * as THREE from "three";

import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef } from "react";

export default function Player() {
  const model = useGLTF("./Sparrow/scene.gltf");
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();
  // console.log("🚀 ~ file: Player.jsx:14 ~ Player ~ world", world.raw());

  const rapierWorld = world.raw();

  const animations = useAnimations(model.animations);

  if (model) {
    model.scene.traverse((children) => {
      if (children instanceof THREE.Mesh) {
        children.castShadow = true;
      }
    });
  }

  const jump = () => {
    const origin = body.current.translation();

    origin.y -= 0.1;

    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = rapierWorld.castRay(ray, 10, true); //(ray, maxDistance, true)

    if (hit.toi < 0.04) {
      body.current.applyImpulse({ x: 0, y: 0.9, z: 0 });
    }
  };

  useEffect(() => {
    const unsubscribeJump = subscribeKeys(
      (state) => state.jump, // selector
      (value) => {
        if (value) {
          console.log(value);
          jump();
        }
      }
    );

    return () => {
      unsubscribeJump();
    };
  }, []);

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys();

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

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);
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
      <primitive object={model.scene} />
    </RigidBody>
  );
}
