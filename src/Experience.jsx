import { OrbitControls } from "@react-three/drei";
import { Physics, Debug } from "@react-three/rapier";
import { Level } from "./Level.jsx";
import Lights from "./Lights.jsx";
import Player from "./Player.jsx";
import Effects from "./Effects";

import useGame from "./stores/useGame.js";

export default function Experience() {
    const blocksCount = useGame((state) => state.blocksCount);
    const blocksSeed = useGame((state) => state.blocksSeed);

    return (
        <>
            {/* <OrbitControls makeDefault /> */}
            <color args={["#bdedfc"]} attach="background" />

            <Physics>
                {/* <Debug /> */}
                <Lights />
                <Level count={blocksCount} seed={blocksSeed} />
                <Player />
            </Physics>

            <Effects />
        </>
    );
}
