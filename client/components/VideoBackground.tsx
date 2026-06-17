import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  mobileVideoPath?: string;
  desktopVideoPath?: string;
  className?: string;
}

const CDN_VIDEO = "https://vz-8b014dd7-1d8.b-cdn.net/12f12c0c-4ec8-41c6-a4c6-5afb6704d24e/play_480p.mp4";

export default function VideoBackground({
  mobileVideoPath = CDN_VIDEO,
  desktopVideoPath = CDN_VIDEO,
  className = "",
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src =
    typeof window !== "undefined" && window.innerWidth < 768
      ? mobileVideoPath
      : desktopVideoPath;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [src]);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        key={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          minWidth: "100%",
          minHeight: "100%",
          objectPosition: "center center",
        }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
