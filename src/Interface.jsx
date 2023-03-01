import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { addEffect } from "@react-three/fiber";

import useGame from "./stores/useGame";

export default function Interface() {
    const forward = useKeyboardControls((state) => state.forward);
    const backward = useKeyboardControls((state) => state.backward);
    const rightward = useKeyboardControls((state) => state.rightward);
    const leftward = useKeyboardControls((state) => state.leftward);
    const jump = useKeyboardControls((state) => state.jump);
    const resetting = useKeyboardControls((state) => state.resetting);
    const restart = useGame((state) => state.restart);

    const phase = useGame((state) => state.phase);

    const timeRef = useRef();

    useEffect(() => {
        const unsubscribeEffect = addEffect(() => {
            const state = useGame.getState();

            let elapsedTime = 0;

            if (state.phase === "playing") {
                elapsedTime = Date.now() - state.startTime;
            } else if (state.phase === "ended") {
                elapsedTime = state.endTime - state.startTime;
            }

            elapsedTime /= 1000;
            elapsedTime = elapsedTime.toFixed(2);

            if (timeRef.current) {
                timeRef.current.textContent = elapsedTime;
            }
        });

        return () => {
            unsubscribeEffect();
        };
    }, []);

    return (
        <div className="interface">
            {/* Timer  */}
            <div ref={timeRef} className="time">
                0.00
            </div>

            {/* Restart Button */}
            {phase === "ended" && (
                <div className="restart" onClick={restart}>
                    Restart
                </div>
            )}

            {/* Controls */}
            <div className="controls">
                <div className="control-container">
                    <div>
                        <div className="raw">
                            <div
                                className={`${forward ? "active" : ""} key`}
                            ></div>
                        </div>
                        <div className="raw">
                            <div
                                className={`${leftward ? "active" : ""} key`}
                            ></div>
                            <div
                                className={`${backward ? "active" : ""} key`}
                            ></div>
                            <div
                                className={`${rightward ? "active" : ""} key`}
                            ></div>
                        </div>
                    </div>
                    <div className="side-keys">
                        <div className="raw">
                            <div className={`${resetting ? "active" : ""} key`}>
                                R
                            </div>
                        </div>
                        <div className="raw">
                            <div
                                className={`${jump ? "active" : ""} key large`}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
