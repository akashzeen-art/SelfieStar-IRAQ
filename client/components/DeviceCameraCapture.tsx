import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Download, RotateCcw, Save } from "lucide-react";
import { downloadImage, saveLocalSelfie } from "@/lib/local-selfies";

interface DeviceCameraCaptureProps {
  onSaved?: () => void;
}

export default function DeviceCameraCapture({ onSaved }: DeviceCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("Camera access denied. Please allow camera permission.");
      }
    }

    startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 720;
    const height = video.videoHeight || 1280;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    setPreview(canvas.toDataURL("image/jpeg", 0.92));
  };

  const saveToDevice = async () => {
    if (!preview) return;
    try {
      setSaving(true);
      saveLocalSelfie(preview);
      downloadImage(preview);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : (
        <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-white/20 bg-black">
          {preview ? (
            <img src={preview} alt="Captured selfie" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-wrap gap-3 justify-center">
        {!preview ? (
          <Button onClick={capturePhoto} disabled={!!error} className="bg-white text-black hover:bg-white/90">
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        ) : (
          <>
            <Button onClick={() => setPreview(null)} variant="outline" className="border-white/30">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button onClick={saveToDevice} disabled={saving} className="bg-white text-black hover:bg-white/90">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save to Device"}
            </Button>
            <Button onClick={() => preview && downloadImage(preview)} variant="outline" className="border-white/30">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
