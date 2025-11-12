import React from "react";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Pause, Play, Music, Volume2, VolumeX } from "lucide-react";

export const MusicPlayerBar: React.FC = () => {
  const { tracks, isPlaying, currentTrack, volume, toggle, setVolume, setTrack } = useMusicPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4" />
        <span className="text-sm font-medium">
          {tracks[currentTrack]?.name || "Music"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={toggle} size="sm" variant="outline" className="gap-2">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <div className="flex items-center gap-2">
          {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>
        <select
          value={currentTrack}
          onChange={(e) => setTrack(parseInt(e.target.value))}
          className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
        >
          {tracks.map((t, i) => (
            <option key={i} value={i}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

