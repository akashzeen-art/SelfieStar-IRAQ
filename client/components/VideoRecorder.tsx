import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Play, Square, Download, Upload, Loader } from "lucide-react";
import { apiClient } from "@/lib/axios";

interface VideoRecorderProps {
  onClose: () => void;
  challengeId?: string;
}

type FilterType = "none" | "retro" | "vintage" | "bw" | "warm" | "cool" | "smooth";

const FILTERS: { id: FilterType; name: string; icon: string }[] = [
  { id: "none",    name: "Original", icon: "📷" },
  { id: "retro",   name: "Retro",    icon: "🎞️" },
  { id: "vintage", name: "Vintage",  icon: "📸" },
  { id: "bw",      name: "B&W",      icon: "⚫" },
  { id: "warm",    name: "Warm",     icon: "🔥" },
  { id: "cool",    name: "Cool",     icon: "❄️" },
  { id: "smooth",  name: "Smooth",   icon: "✨" },
];

const MAX_RECORDING_TIME = 15;

function applyFilter(data: Uint8ClampedArray, filter: FilterType) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    switch (filter) {
      case "retro":
        r = Math.min(255, r * 1.1); g = Math.min(255, g * 0.95); b = Math.min(255, b * 0.9);
        r = Math.max(0, Math.min(255, (r - 128) * 1.3 + 128));
        g = Math.max(0, Math.min(255, (g - 128) * 1.3 + 128));
        b = Math.max(0, Math.min(255, (b - 128) * 1.3 + 128));
        break;
      case "vintage":
        const vr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        const vg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        const vb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        r = vr; g = vg; b = vb;
        break;
      case "bw":
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        r = gray; g = gray; b = gray;
        break;
      case "warm":
        r = Math.min(255, r * 1.15); g = Math.min(255, g * 1.05); b = Math.max(0, b * 0.9);
        break;
      case "cool":
        r = Math.max(0, r * 0.9); g = Math.min(255, g * 1.05); b = Math.min(255, b * 1.15);
        break;
      case "smooth":
        const avg = (r + g + b) / 3;
        r = r * 0.7 + avg * 0.3; g = g * 0.7 + avg * 0.3; b = b * 0.7 + avg * 0.3;
        break;
    }
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
}

export default function VideoRecorder({ onClose, challengeId }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const filterRef = useRef<FilterType>("none");

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("none");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  // keep filterRef in sync so the RAF loop always reads latest
  useEffect(() => { filterRef.current = selectedFilter; }, [selectedFilter]);

  // Live preview loop — runs always when camera is active
  const startPreviewLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.save();
        // Mirror for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (filterRef.current !== "none") {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyFilter(imageData.data, filterRef.current);
          ctx.putImageData(imageData, 0, 0);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  const stopPreviewLoop = () => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            startPreviewLoop();
          };
        }
      } catch (err: any) {
        if (err.name === "NotAllowedError") setError("Camera access denied. Please allow permissions.");
        else if (err.name === "NotFoundError") setError("No camera found.");
        else setError(`Camera error: ${err.message}`);
      }
    };
    start();
    return () => {
      stopPreviewLoop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startPreviewLoop]);

  const startRecording = () => {
    if (!canvasRef.current) return;
    setIsRecording(true);
    setRecordingTime(0);
    chunksRef.current = [];

    const canvasStream = canvasRef.current.captureStream(30);
    let mimeType = "video/webm;codecs=vp9";
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm;codecs=vp8";
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";

    const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 2500000 });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedVideo(URL.createObjectURL(blob));
      setIsRecording(false);
      stopPreviewLoop();
    };

    recorder.start(100);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 0.1) { stopRecording(); return MAX_RECORDING_TIME; }
        return parseFloat((prev + 0.1).toFixed(1));
      });
    }, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const resetRecording = () => {
    if (recordedVideo) URL.revokeObjectURL(recordedVideo);
    setRecordedVideo(null);
    setRecordingTime(0);
    chunksRef.current = [];
    startPreviewLoop();
  };

  const saveVideo = () => {
    if (!recordedVideo) return;
    const a = document.createElement("a");
    a.href = recordedVideo;
    a.download = `selfistar-${Date.now()}.webm`;
    a.click();
  };

  const uploadVideo = async () => {
    if (!recordedVideo) return;
    setIsUploading(true);
    setError("");
    try {
      const res = await fetch(recordedVideo);
      const blob = await res.blob();
      const file = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" });
      const fd = new FormData();
      fd.append("video", file);
      fd.append("filter", selectedFilter);
      if (challengeId) fd.append("challengeId", challengeId);
      await apiClient.post("/video/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white">Video Recorder</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {/* Hidden video element — just feeds the canvas */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />

        {/* Canvas shows live filtered preview */}
        {!recordedVideo && (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Recorded video playback */}
        {recordedVideo && (
          <video src={recordedVideo} controls className="absolute inset-0 w-full h-full object-contain bg-black" />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 z-10">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
            {recordingTime.toFixed(1)}s / {MAX_RECORDING_TIME}s
          </div>
        )}

        {/* Camera loading */}
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm text-center max-w-xs">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm p-4 border-t border-white/10 space-y-4">
        {/* Filters — only show when not viewing recorded video */}
        {!recordedVideo && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <Button
                key={f.id}
                variant={selectedFilter === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(f.id)}
                className={`min-w-[60px] h-12 flex flex-col items-center justify-center gap-1 flex-shrink-0 ${
                  selectedFilter === f.id
                    ? "bg-gradient-to-r from-neon-purple to-neon-pink text-white border-0"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-xs">{f.name}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          {!recordedVideo ? (
            !isRecording ? (
              <Button
                onClick={startRecording}
                disabled={!cameraReady}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50"
              >
                <Play className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <Square className="h-6 w-6" />
              </Button>
            )
          ) : (
            <>
              <Button variant="outline" onClick={saveVideo} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />Save
              </Button>
              <Button onClick={uploadVideo} disabled={isUploading} className="bg-gradient-to-r from-neon-purple to-neon-pink text-white">
                {isUploading ? <><Loader className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Upload</>}
              </Button>
              <Button variant="outline" onClick={resetRecording} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Again
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
