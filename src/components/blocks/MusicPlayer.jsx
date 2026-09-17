import React, { useEffect, useRef, useState } from "react";
import { Image as UIImage } from "@/components/ui/image";
import { Play, Pause, Volume2, VolumeX, Music2 } from "lucide-react";

function fmt(t) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer({ block, className }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.volume = volume;
      a.muted = muted;
    }
  }, [volume, muted]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play();
  };

  const seek = (e) => {
    const v = Number(e.target.value);
    setTime(v);
    if (audioRef.current) audioRef.current.currentTime = v;
  };

  if (!block?.audio_url) return null;

  const max = duration || 0;
  const pct = max > 0 ? (time / max) * 100 : 0;
  const volPct = muted ? 0 : volume * 100;
  const gradient = (p) => ({
    background: `linear-gradient(to right, hsl(var(--primary)) ${p}%, hsl(var(--muted)) ${p}%)`,
  });

  return (
    <figure className={className || "max-w-[640px]"}>
      <div className="rounded-lg border border-border/70 bg-card p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_3px_12px_rgba(0,0,0,0.06)] sm:p-3.5">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] sm:h-14 sm:w-14">
            {block.cover_url ? (
              <UIImage
                src={block.cover_url}
                alt={block.title || "Cover artwork"}
                className="h-full w-full object-cover"
                fittingType="fill"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <Music2 className="h-5 w-5 text-muted-foreground/50" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-snug text-foreground">
              {block.title || "Untitled track"}
            </p>
            {block.artist && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{block.artist}</p>
            )}
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-95"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
            )}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:gap-2.5">
          <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums leading-none text-muted-foreground">
            {fmt(time)}
          </span>
          <input
            type="range"
            min={0}
            max={max || 0}
            step={0.1}
            value={Math.min(time, max || 0)}
            onChange={seek}
            aria-label="Seek"
            className="range-now min-w-0 flex-1"
            style={max ? gradient(pct) : undefined}
          />
          <span className="w-9 shrink-0 font-mono text-[10px] tabular-nums leading-none text-muted-foreground">
            {fmt(max)}
          </span>

          <div className="hidden shrink-0 items-center gap-1.5 border-l border-border/70 pl-2.5 sm:flex">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className="text-muted-foreground/80 transition-colors hover:text-foreground"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              aria-label="Volume"
              className="range-now w-12"
              style={gradient(volPct)}
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={block.audio_url}
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </figure>
  );
}