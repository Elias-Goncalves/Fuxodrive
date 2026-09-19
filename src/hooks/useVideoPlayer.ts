import { useCallback, useEffect, useRef, useState } from "react";

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
}

/**
 * Encapsula o estado e os controles do `<video>` nativo: play/pause, seek,
 * volume, fullscreen e leitura do buffer real carregado — usado pelo
 * VideoPlayer customizado (scrubber, atalhos de teclado, gestos de toque).
 */
export function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    isFullscreen: false,
  });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function updateBuffered() {
      if (!video || video.buffered.length === 0) return;
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setState((prev) => ({ ...prev, buffered: bufferedEnd }));
    }

    function tick() {
      if (!video) return;
      setState((prev) => ({
        ...prev,
        currentTime: video.currentTime,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      }));
      updateBuffered();
      rafRef.current = requestAnimationFrame(tick);
    }

    const onPlay = () => setState((prev) => ({ ...prev, isPlaying: true }));
    const onPause = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onVolumeChange = () =>
      setState((prev) => ({ ...prev, volume: video.volume, muted: video.muted }));

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }, [videoRef]);

  const seekTo = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.min(Math.max(seconds, 0), video.duration || 0);
    },
    [videoRef]
  );

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      seekTo(video.currentTime + deltaSeconds);
    },
    [videoRef, seekTo]
  );

  const setVolume = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = Math.min(Math.max(value, 0), 1);
      video.muted = value === 0;
    },
    [videoRef]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, [videoRef]);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState((prev) => ({ ...prev, isFullscreen: false }));
    }
  }, [videoRef]);

  return { state, togglePlay, seekTo, seekBy, setVolume, toggleMute, toggleFullscreen };
}
