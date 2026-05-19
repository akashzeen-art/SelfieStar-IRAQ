import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const COUNTRY_CODES = [
  { code: "+1",   flag: "🇺🇸", name: "US" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+91",  flag: "🇮🇳", name: "IN" },
  { code: "+33",  flag: "🇫🇷", name: "FR" },
  { code: "+966", flag: "🇸🇦", name: "SA" },
  { code: "+34",  flag: "🇪🇸", name: "ES" },
  { code: "+971", flag: "🇦🇪", name: "AE" },
  { code: "+92",  flag: "🇵🇰", name: "PK" },
  { code: "+880", flag: "🇧🇩", name: "BD" },
  { code: "+86",  flag: "🇨🇳", name: "CN" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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

    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    const fullPhone = `${countryCode}${phone.trim()}`;

    try {
      await login(fullPhone, password, true); // true = phone login
    } catch (err: any) {
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
              Your account is not active. Please contact support to reactivate your account.
            </p>
            <Button
              onClick={() => setShowInactivePopup(false)}
              className="w-full bg-white text-black hover:bg-white/90"
            >
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

              {/* Phone Number */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-10 rounded-md border border-border/40 bg-input px-2 text-sm text-white focus:outline-none focus:border-neon-purple/60 w-24"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    disabled={isLoading}
                    className="bg-input border-border/40 focus:border-neon-purple/60 flex-1"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.login.password}</label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border/40 focus:border-neon-purple/60"
                />
              </div>

              {/* Demo credentials */}
              <div
                onClick={() => { setCountryCode("+91"); setPhone("9876543210"); setPassword("User123456"); }}
                className="rounded-lg border border-white/20 bg-white/5 p-3 text-xs text-muted-foreground cursor-pointer hover:bg-white/10 transition-colors"
              >
                <p className="font-semibold text-white/80 mb-1">🎯 Demo Account <span className="text-white/40 font-normal">(click to fill)</span></p>
                <p>Mobile: <span className="text-white/70 font-medium">+91 9876543210</span></p>
                <p>Password: <span className="text-white/70 font-medium">User123456</span></p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-white/90 border border-white/30 py-2 text-base disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader className="mr-2 h-4 w-4 animate-spin" />{t.login.signingIn}</>
                ) : (
                  t.login.signIn
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40 text-center">
              <p className="text-muted-foreground text-sm">
                {t.login.noAccount}{" "}
                <Link to="/register" className="text-neon-purple hover:text-neon-purple/80 font-medium">
                  {t.login.createAccount}
                </Link>
              </p>
            </div>
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
