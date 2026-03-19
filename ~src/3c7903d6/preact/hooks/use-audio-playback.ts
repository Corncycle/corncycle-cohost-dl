import { noop } from "lodash";
import {
    RefObject,
    useCallback,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";

export function useAudioPlayback(
    audio: RefObject<HTMLAudioElement>,
    onPlaybackError?: (e: Error) => void
) {
    const [snapshot, setSnapshot] = useState({
        currentTime: 0,
        totalDuration: 0,
        isPlaying: false,
    });
    const updateSnapshot = useMemo(() => {
        return (callback: () => void) => () => {
            if (!audio.current) return;

            setSnapshot({
                currentTime: audio.current.currentTime,
                totalDuration: audio.current.duration,
                isPlaying: !audio.current.paused,
            });

            callback();
        };
    }, [audio]);

    const subscribe = useCallback(
        (callback: () => void) => {
            if (!audio.current) return noop;
            const newCb = updateSnapshot(callback);

            audio.current.addEventListener("loadedmetadata", newCb);
            audio.current.addEventListener("timeupdate", newCb);
            audio.current.addEventListener("play", newCb);
            audio.current.addEventListener("pause", newCb);
            return () => {
                audio.current?.removeEventListener("loadedmetadata", newCb);
                audio.current?.removeEventListener("timeupdate", newCb);
                audio.current?.removeEventListener("play", newCb);
                audio.current?.removeEventListener("pause", newCb);
            };
        },
        [audio, updateSnapshot]
    );

    const getSnapshot = useCallback(() => {
        return snapshot;
    }, [snapshot]);

    const getServerSnapshot = () => {
        // this is required for SSR but audio elements obvs don't exist on the
        // server.
        return {
            currentTime: 0,
            totalDuration: 0,
            isPlaying: false,
        };
    };

    const metadataStore = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );
    const togglePlayback = useCallback(async () => {
        if (!audio.current) return;

        if (audio.current.paused) {
            try {
                await audio.current.play();
            } catch (e) {
                console.error(e);

                if (onPlaybackError) {
                    onPlaybackError(e as Error);
                }
            }
        } else {
            audio.current.pause();
        }
    }, [audio, onPlaybackError]);

    const seek = useCallback(
        (time: number) => {
            if (!audio.current) return;

            audio.current.currentTime = time;
        },
        [audio]
    );

    return {
        togglePlayback,
        seek,
        ...metadataStore,
    };
}
