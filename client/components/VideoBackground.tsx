import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  mobileVideoPath?: string;
  desktopVideoPath?: string;
  className?: string;
}

const CDN_VIDEO = "https://vz-8b014dd7-1d8.b-cdn.net/12f12c0c-4ec8-41c6-a4c6-5afb6704d24e/play_480p.mp4";

export default function VideoBackground({ 
  mobileVideoPath = CDN_VIDEO, 
  desktopVideoPath = CDN_VIDEO,
  className = "" 
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Update video source when device type changes
      const source = video.querySelector('source');
      if (source) {
        source.src = isMobile ? mobileVideoPath : desktopVideoPath;
        video.load(); // Reload video with new source
      }
      
      video.play().catch((error) => {
        console.warn("Video autoplay failed:", error);
      });
    }
  }, [isMobile, mobileVideoPath, desktopVideoPath]);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ 
          minWidth: '100%', 
          minHeight: '100%',
          objectPosition: 'center center'
        }}
      >
        <source src={isMobile ? mobileVideoPath : desktopVideoPath} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Black overlay layer for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
