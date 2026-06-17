import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PRELOADER_DURATION_MS = 5000;

const CDN_VIDEO = "https://vz-8b014dd7-1d8.b-cdn.net/12f12c0c-4ec8-41c6-a4c6-5afb6704d24e/play_480p.mp4";

interface PreloaderProps {
  onComplete: () => void;
  durationMs?: number;
  className?: string;
}

export default function Preloader({
  onComplete,
  durationMs = PRELOADER_DURATION_MS,
  className,
}: PreloaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Play video once mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, []);

  // 5 second timer then fade out and complete
  useEffect(() => {
    const startExitTimer = setTimeout(() => setIsExiting(true), durationMs);
    const completeTimer = setTimeout(onComplete, durationMs + 300);
    return () => {
      clearTimeout(startExitTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  // Loading progress percentage synced with duration
  useEffect(() => {
    let frameId: number;
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      const ratio = Math.min(1, elapsed / durationMs);
      setProgress(Math.round(ratio * 100));
      if (ratio < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [durationMs]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300",
        isExiting && "opacity-0 pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        loop
        preload="auto"
        aria-label="Loading"
      >
        <source
          src={CDN_VIDEO}
          type="video/mp4"
        />
      </video>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Centered logo, welcome text and loading bar */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center text-white">
        <img src="/image.png" alt="SelfiStar" className="h-28 w-auto" />

        {/* Welcome text */}
        <p className="text-sm md:text-base text-white/80 uppercase tracking-[0.15em]">
          welcome to Selfie Star
        </p>

        {/* Loading bar + percentage */}
        <div className="mt-2 w-56 md:w-72 space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs md:text-sm text-white/70">
            Loading {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}
