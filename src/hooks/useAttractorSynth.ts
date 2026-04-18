import { useEffect, useMemo, useRef, useState } from 'react';
import { AttractorSynth } from '../audio/AttractorSynth';

export const useAttractorSynth = (voiceCount: number) => {
    const synth = useMemo(() => new AttractorSynth(), []);
    const readyRef = useRef(false);
    const [muted, setMuted] = useState(true);
    const [volume, setVolumeState] = useState(0.1);

    useEffect(() => {
        return () => {
            synth.stop();
        };
    }, [synth]);

    const start = () => {
        if (readyRef.current) return;
        synth.start(voiceCount);
        synth.setVolume(volume);
        synth.setMuted(muted);
        readyRef.current = synth.isStarted;
    };

    const toggleMute = () => {
        setMuted((m) => {
            const next = !m;
            if (readyRef.current) synth.setMuted(next);
            return next;
        });
    };

    const setVolume = (v: number) => {
        setVolumeState(v);
        if (readyRef.current) synth.setVolume(v);
    };

    const duck = (on: boolean) => {
        if (readyRef.current) synth.duck(on);
    };

    return {
        synth,
        muted,
        volume,
        start,
        toggleMute,
        setVolume,
        duck,
    };
};
