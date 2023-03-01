import { OrbitControls } from "@react-three/drei";
import { Physics, Debug } from "@react-three/rapier";
import { Level } from "./Level.jsx";
import Lights from "./Lights.jsx";
import Player from "./Player.jsx";

export default function Experience() {
    return (
        <>
            {/* <OrbitControls makeDefault /> */}

            <Physics>
                {/* <Debug /> */}
                <Lights />
                <Level />
                <Player />
            </Physics>
        </>
    );
}
