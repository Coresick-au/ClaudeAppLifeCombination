import { useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const getStoredMutePreference = (): boolean | null => {
  const stored = localStorage.getItem('life-os-sound');
  if (stored === null) return null;
  return stored === 'muted';
};

export const useSound = () => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const stored = getStoredMutePreference();
    if (stored !== null) return stored;
    return isMobileDevice();
  });

  const audioStartedRef = useRef(false);
  const synthRef = useRef<Tone.Synth | null>(null);
  const membraneSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const metalSynthRef = useRef<Tone.MetalSynth | null>(null);

  const ensureAudioStarted = useCallback(async (): Promise<boolean> => {
    if (audioStartedRef.current) return true;
    try {
      await Tone.start();
      audioStartedRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  const getSynth = useCallback((): Tone.Synth => {
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0,
          release: 0.05,
        },
        volume: -12,
      }).toDestination();
    }
    return synthRef.current;
  }, []);

  const getMembraneSynth = useCallback((): Tone.MembraneSynth => {
    if (!membraneSynthRef.current) {
      membraneSynthRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0,
          release: 0.1,
        },
        volume: -10,
      }).toDestination();
    }
    return membraneSynthRef.current;
  }, []);

  const getMetalSynth = useCallback((): Tone.MetalSynth => {
    if (!metalSynthRef.current) {
      metalSynthRef.current = new Tone.MetalSynth({
        envelope: {
          attack: 0.001,
          decay: 0.1,
          release: 0.05,
        },
        harmonicity: 5.1,
        modulationIndex: 16,
        resonance: 4000,
        octaves: 1.5,
        volume: -20,
      }).toDestination();
    }
    return metalSynthRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('life-os-sound', next ? 'muted' : 'unmuted');
      return next;
    });
  }, []);

  const playBleep = useCallback(async () => {
    if (isMuted) return;
    const started = await ensureAudioStarted();
    if (!started) return;
    const synth = getSynth();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '32n', now);
  }, [isMuted, ensureAudioStarted, getSynth]);

  const playSuccess = useCallback(async () => {
    if (isMuted) return;
    const started = await ensureAudioStarted();
    if (!started) return;
    const synth = getSynth();
    const now = Tone.now();
    synth.triggerAttackRelease('E5', '32n', now);
    synth.triggerAttackRelease('G5', '32n', now + 0.08);
    synth.triggerAttackRelease('C6', '16n', now + 0.16);
  }, [isMuted, ensureAudioStarted, getSynth]);

  const playChapterFanfare = useCallback(async () => {
    if (isMuted) return;
    const started = await ensureAudioStarted();
    if (!started) return;
    const synth = getSynth();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '32n', now);
    synth.triggerAttackRelease('E5', '32n', now + 0.07);
    synth.triggerAttackRelease('G5', '32n', now + 0.14);
    synth.triggerAttackRelease('C6', '8n', now + 0.21);
  }, [isMuted, ensureAudioStarted, getSynth]);

  const playLevelUp = useCallback(async () => {
    if (isMuted) return;
    const started = await ensureAudioStarted();
    if (!started) return;
    const synth = getSynth();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '32n', now);
    synth.triggerAttackRelease('D5', '32n', now + 0.06);
    synth.triggerAttackRelease('E5', '32n', now + 0.12);
    synth.triggerAttackRelease('G5', '32n', now + 0.18);
    synth.triggerAttackRelease('C6', '16n', now + 0.24);
  }, [isMuted, ensureAudioStarted, getSynth]);

  const playAchievement = useCallback(async () => {
    if (isMuted) return;
    const started = await ensureAudioStarted();
    if (!started) return;
    const synth = getSynth();
    const membrane = getMembraneSynth();
    const now = Tone.now();
    membrane.triggerAttackRelease('C2', '16n', now);
    synth.triggerAttackRelease('E5', '32n', now + 0.05);
    synth.triggerAttackRelease('G5', '32n', now + 0.1);
    synth.triggerAttackRelease('B5', '32n', now + 0.15);
    synth.triggerAttackRelease('E6', '8n', now + 0.2);
  }, [isMuted, ensureAudioStarted, getSynth, getMembraneSynth]);

  const playError = useCallback(async () => {
    if (isMuted) return;
    const started = await ensureAudioStarted();
    if (!started) return;
    const metal = getMetalSynth();
    const now = Tone.now();
    metal.triggerAttackRelease('16n', now);
  }, [isMuted, ensureAudioStarted, getMetalSynth]);

  return {
    isMuted,
    toggleMute,
    playBleep,
    playSuccess,
    playChapterFanfare,
    playLevelUp,
    playAchievement,
    playError,
  };
};
