"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function VideoPlayer({
  src,
  poster,
  onError,
}: {
  src: string;
  poster?: string | null;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { state, togglePlay, seekTo, seekBy, setVolume, toggleMute, toggleFullscreen } =
    useVideoPlayer(videoRef);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<"back" | "forward" | null>(null);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  const handleActivity = useCallback(() => {
    setControlsVisible(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    scheduleHideControls();
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [scheduleHideControls]);

  // Atalhos de teclado: Espaço, F, M, setas.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      switch (event.key.toLowerCase()) {
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
          seekBy(-5);
          break;
        case "arrowright":
          seekBy(5);
          break;
        case "arrowup":
          event.preventDefault();
          setVolume(state.volume + 0.1);
          break;
        case "arrowdown":
          event.preventDefault();
          setVolume(state.volume - 0.1);
          break;
      }
      handleActivity();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    togglePlay,
    toggleFullscreen,
    toggleMute,
    seekBy,
    setVolume,
    state.volume,
    handleActivity,
  ]);

  function handleDoubleTap(side: "left" | "right") {
    seekBy(side === "left" ? -10 : 10);
    setSeekFeedback(side === "left" ? "back" : "forward");
    setTimeout(() => setSeekFeedback(null), 500);
  }

  const progressPercent = state.duration ? (state.currentTime / state.duration) * 100 : 0;
  const bufferedPercent = state.duration ? (state.buffered / state.duration) * 100 : 0;

  const VolumeIcon = state.muted || state.volume === 0 ? VolumeX : state.volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseMove={handleActivity}
      onClick={handleActivity}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        className="h-full w-full"
        onClick={togglePlay}
        onError={onError}
        playsInline
      />

      {/* Zonas de toque duplo (mobile): retrocede/avança 10s */}
      <div className="absolute inset-0 flex md:hidden">
        <button
          aria-label="Retroceder 10 segundos"
          className="flex-1"
          onDoubleClick={() => handleDoubleTap("left")}
        />
        <div className="w-1/3" />
        <button
          aria-label="Avançar 10 segundos"
          className="flex-1"
          onDoubleClick={() => handleDoubleTap("right")}
        />
      </div>

      {seekFeedback && (
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white",
            seekFeedback === "back" ? "left-8" : "right-8"
          )}
        >
          {seekFeedback === "back" ? "-10s" : "+10s"}
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 md:p-4",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="group/scrubber relative h-1 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            seekTo(ratio * state.duration);
          }}
        >
          <div
            className="absolute h-full rounded-full bg-white/30"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button aria-label={state.isPlaying ? "Pausar" : "Reproduzir"} onClick={togglePlay}>
            {state.isPlaying ? (
              <Pause size={20} className="text-white" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={20} className="text-white" fill="currentColor" strokeWidth={0} />
            )}
          </button>

          <button aria-label="Mudo" onClick={toggleMute}>
            <VolumeIcon size={18} className="text-white" strokeWidth={1.75} />
          </button>

          <span className="font-mono text-xs text-white">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <button
              aria-label="Picture-in-Picture"
              onClick={() => videoRef.current?.requestPictureInPicture()}
              className="hidden md:block"
            >
              <PictureInPicture2 size={18} className="text-white" strokeWidth={1.75} />
            </button>
            <button aria-label="Tela cheia" onClick={toggleFullscreen}>
              {state.isFullscreen ? (
                <Minimize size={18} className="text-white" strokeWidth={1.75} />
              ) : (
                <Maximize size={18} className="text-white" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
