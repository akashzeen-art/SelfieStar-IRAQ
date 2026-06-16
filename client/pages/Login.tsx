import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { useAuth, AuthError } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const IRAQ_COUNTRY_CODE = "+964";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [showInactivePopup, setShowInactivePopup] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const params = new URLSearchParams(location.search);
      const inviteCode = params.get("inviteCode");
      if (inviteCode) {
        navigate(`/challenge/invite/${inviteCode}`, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Please enter your mobile number");
      return;
    }

    const fullPhone = `${IRAQ_COUNTRY_CODE}${phone.trim()}`;

    try {
      await login(fullPhone, "", true);
    } catch (err: any) {
      if (err instanceof AuthError && err.redirectUrl) {
        window.location.href = err.redirectUrl;
        return;
      }
      const msg = err instanceof Error ? err.message : "Login failed.";
      if (msg.toLowerCase().includes("not active") || msg.toLowerCase().includes("blocked")) {
        setShowInactivePopup(true);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <VideoBackground />

      {/* Inactive User Popup */}
      {showInactivePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInactivePopup(false)} />
          <div className="relative z-10 bg-card/90 border border-destructive/40 backdrop-blur-md rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-xl font-bold text-white mb-2">Account Inactive</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You are a non active user. Please contact support to reactivate your account.
            </p>
            <Button onClick={() => setShowInactivePopup(false)} className="w-full bg-white text-black hover:bg-white/90">
              OK
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/image.png" alt="SelfiStar" className="h-16 w-auto mx-auto mb-4" />
            <p className="text-muted-foreground">{t.login.welcome}</p>
          </div>

          {/* Login Form */}
          <div className="p-8 rounded-xl border border-neon-purple/30 bg-card/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Mobile Number */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="h-10 flex items-center justify-center rounded-md border border-border/40 bg-input px-3 text-sm text-white shrink-0">
                    🇮🇶 +964
                  </div>
                  <Input
                    type="tel"
                    placeholder="7901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    className="bg-input border-border/40 focus:border-neon-purple/60 flex-1"
                    maxLength={15}
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-white/90 border border-white/30 py-2 text-base disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader className="mr-2 h-4 w-4 animate-spin" />Logging in...</>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              {t.login.backHome}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
