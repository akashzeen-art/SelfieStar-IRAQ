import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Loader, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import SelfieUploadModal from "@/components/SelfieUploadModal";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";

export default function UploadSelfie() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <VideoBackground />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </Button>
          </div>

          {/* Main Content */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 border border-white/30 mx-auto mb-6 shadow-lg shadow-white/20">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upload Your Selfie
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Show the world your best self! Capture a moment, apply filters, and get AI-powered scoring.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl animate-slide-up">
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 rounded-full bg-white/10 border border-white/30">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Ready to Shine?</h2>
                  <p className="text-muted-foreground">
                    Click below to start your selfie journey
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-white text-black hover:bg-white/90 border border-white/30 px-8 py-6 text-lg shadow-lg shadow-white/20 hover:scale-105 transition-transform"
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Upload
              </Button>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 pt-8 border-t border-border/40">
                <div className="text-center p-5 rounded-lg bg-card/50 border border-border/20 hover:border-neon-purple/50 transition-colors">
                  <div className="text-3xl mb-3">✨</div>
                  <h3 className="font-semibold mb-2">AI Beautification</h3>
                  <p className="text-sm text-muted-foreground">
                    Skin smoothing, blemish removal, face reshaping
                  </p>
                </div>
                <div className="text-center p-5 rounded-lg bg-card/50 border border-border/20 hover:border-neon-cyan/50 transition-colors">
                  <div className="text-3xl mb-3">🎭</div>
                  <h3 className="font-semibold mb-2">AR Face Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Interactive stickers that move with your face
                  </p>
                </div>
                <div className="text-center p-5 rounded-lg bg-card/50 border border-border/20 hover:border-neon-pink/50 transition-colors">
                  <div className="text-3xl mb-3">📸</div>
                  <h3 className="font-semibold mb-2">Live Filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time Retro, Vintage, B&W, Warm, Cool filters
                  </p>
                </div>
                <div className="text-center p-5 rounded-lg bg-card/50 border border-border/20 hover:border-orange-500/50 transition-colors">
                  <div className="text-3xl mb-3">🎬</div>
                  <h3 className="font-semibold mb-2">Video Recording</h3>
                  <p className="text-sm text-muted-foreground">
                    15-second videos with beauty filters
                  </p>
                </div>
                <div className="text-center p-5 rounded-lg bg-transparent backdrop-blur-sm border border-border/20 hover:border-green-500/50 transition-colors">
                  <div className="text-3xl mb-3">🖼️</div>
                </div>
                <div className="text-center p-5 rounded-lg bg-card/50 border border-border/20 hover:border-neon-purple/50 transition-colors">
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="font-semibold mb-2">AI Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant AI-powered scores & compete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SelfieUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </div>
  );
}
