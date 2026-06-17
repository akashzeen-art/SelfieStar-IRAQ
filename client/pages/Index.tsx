import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Camera, Zap, Users, Trophy, Loader } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";
import LanguageDropdown from "@/components/LanguageDropdown";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import { SubscriptionStatusResponse } from "@shared/api";

export default function Index() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    const msisdn = (searchParams.get("msisdn") || searchParams.get("phone") || "").trim();
    if (!msisdn) return;

    let cancelled = false;
    setCheckingStatus(true);

    apiClient
      .get<SubscriptionStatusResponse>("/subscription/check-status", { params: { msisdn } })
      .then((response) => {
        if (cancelled) return;

        if (response.data.status === 0 && response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
          return;
        }

        if (response.data.status === 0) {
          setCheckingStatus(false);
          return;
        }

        if (response.data.status === 1) {
          navigate(`/login?msisdn=${encodeURIComponent(msisdn)}`, { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white relative">
        <VideoBackground />
        <Loader className="h-10 w-10 animate-spin mb-4" />
        <p className="text-muted-foreground">Checking subscription status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <VideoBackground />
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-transparent backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src="/image.png" alt="SelfiStar" className="h-16 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <LanguageDropdown />
            <Link to="/login">
              <Button className="bg-white text-black hover:bg-white/90 border border-white/30 text-sm px-5">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 text-white py-32">
            {t.index.hero}
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/login">
              <Button className="bg-white text-black hover:bg-white/90 border border-white/30 px-8 py-6 text-lg">
                <Camera className="mr-2 h-5 w-5" />
                {t.index.getStarted}
              </Button>
            </Link>
          </div>
          <div className="relative h-96 sm:h-[500px] rounded-2xl border border-white/20 bg-transparent backdrop-blur-sm overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-24 w-24 text-white/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Your selfie showcase</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">{t.index.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-neon-purple/20 bg-transparent backdrop-blur-sm hover:border-neon-purple/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-neon-purple/50 transition-shadow">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.index.feature1Title}</h3>
              <p className="text-muted-foreground">{t.index.feature1Desc}</p>
            </div>
            <div className="p-6 rounded-xl border border-white/20 bg-transparent backdrop-blur-sm hover:border-white/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-white/20 transition-shadow">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.index.feature2Title}</h3>
              <p className="text-muted-foreground">{t.index.feature2Desc}</p>
            </div>
            <div className="p-6 rounded-xl border border-white/20 bg-transparent backdrop-blur-sm hover:border-white/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-white/20 transition-shadow">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.index.feature3Title}</h3>
              <p className="text-muted-foreground">{t.index.feature3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">2M+</div>
              <p className="text-muted-foreground mt-2">{t.index.selfiesScored}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">500K+</div>
              <p className="text-muted-foreground mt-2">{t.index.activeUsers}</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">50+</div>
              <p className="text-muted-foreground mt-2">{t.index.dailyChallenges}</p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">100%</div>
              <p className="text-muted-foreground mt-2">{t.index.secure}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="mx-auto max-w-4xl text-center p-12 rounded-2xl border border-white/20 bg-transparent backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-4">{t.index.ctaTitle}</h2>
          <p className="text-xl text-muted-foreground mb-8">{t.index.ctaDesc}</p>
          <Link to="/login">
            <Button className="bg-white text-black hover:bg-white/90 border border-white/30 px-8 py-6 text-lg">
              <Star className="mr-2 h-5 w-5" />
              {t.index.ctaBtn}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
