import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

interface Track {
  name: string;
  url: string;
}

interface MusicPlayerContextValue {
  tracks: Track[];
  isPlaying: boolean;
  currentTrack: number;
  volume: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  setTrack: (index: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tracks: Track[] = useMemo(
    () => [
      { name: "Track 1", url: "/music/track1.mp3" },
      { name: "Track 2", url: "/music/track2.mp3" },
      { name: "Track 3", url: "/music/track3.mp3" },
      { name: "Track 4", url: "/music/track4.mp3" },
      { name: "Track 5", url: "/music/track5.mp3" },
      { name: "Track 6", url: "/music/track6.mp3" },
    ],
    []
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<number>(() => {
    const saved = localStorage.getItem("music_player_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.currentTrack === "number" ? parsed.currentTrack : 0;
      } catch {}
    }
    return 0;
  });
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem("music_player_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.volume === "number" ? parsed.volume : 0.6;
      } catch {}
    }
    return 0.6;
  });

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    audio.volume = volume;
    audio.src = tracks[currentTrack]?.url;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "music_player_state",
      JSON.stringify({ currentTrack, volume, isPlaying })
    );
  }, [currentTrack, volume, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = tracks[currentTrack]?.url;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggle = () => {
    if (isPlaying) pause();
    else play();
  };

  const setVolume = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
  };

  const setTrack = (index: number) => {
    const i = Math.max(0, Math.min(tracks.length - 1, index));
    setCurrentTrack(i);
  };

  const value: MusicPlayerContextValue = {
    tracks,
    isPlaying,
    currentTrack,
    volume,
    play,
    pause,
    toggle,
    setVolume,
    setTrack,
  };

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
};

