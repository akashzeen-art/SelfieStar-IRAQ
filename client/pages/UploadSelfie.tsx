import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DeviceCameraCapture from "@/components/DeviceCameraCapture";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelfies } from "@/contexts/SelfieContext";

export default function UploadSelfie() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshMine } = useSelfies();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <VideoBackground />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              {t.upload.backToDashboard}
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 border border-white/30 mx-auto mb-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t.upload.title}</h1>
            <p className="text-muted-foreground">Capture a selfie and save it directly to your device</p>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8">
            <DeviceCameraCapture onSaved={() => refreshMine()} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
