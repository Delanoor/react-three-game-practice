import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export default create(
    subscribeWithSelector((set) => {
        return {
            blocksCount: 3,
            blocksSeed: 0, // to change [seed] in useMemo

            /**
             * Time
             */
            startTime: 0,
            endTime: 0,

            /**
             * Phases
             */
            phase: "ready",

            start: () => {
                set((state) => {
                    if (state.phase === "ready")
                        return { phase: "playing", startTime: Date.now() };

                    return {}; // set has to return something
                });
            },

            restart: () => {
                set((state) => {
                    if (state.phase === "playing" || state.phase === "ended")
                        return { phase: "ready", blocksSeed: Math.random() };

                    return {};
                });
            },

            end: () => {
                set((state) => {
                    if (state.phase === "playing")
                        return { phase: "ended", endTime: Date.now() };

                    return {};
                });
            },
        };
    })
);
