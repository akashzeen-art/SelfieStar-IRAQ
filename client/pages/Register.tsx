import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const IRAQ_COUNTRY_CODE = "+964";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone || !username || !password || !confirmPassword) {
      setError(t.register.fillFields);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.register.passwordMismatch);
      return;
    }
    if (!isStrongPassword(password)) {
      setError(t.register.weakPassword);
      return;
    }
    if (!agreeTerms) {
      setError(t.register.agreeTermsError);
      return;
    }

    try {
      const fullPhone = `${IRAQ_COUNTRY_CODE}${phone.trim()}`;
      await register(fullPhone, username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.register.registerFailed);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <VideoBackground />

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/image.png" alt="SelfiStar" className="h-16 w-auto mx-auto mb-4" />
            <p className="text-muted-foreground">{t.register.joinStars}</p>
          </div>

          {/* Register Form */}
          <div className="p-8 rounded-xl border border-white/20 bg-transparent backdrop-blur-sm">
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
                    className="bg-input border-border/40 focus:border-white/60 flex-1"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.register.username}</label>
                <Input
                  type="text"
                  placeholder="your_selfie_name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border/40 focus:border-white/60"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.register.password}</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border/40 focus:border-white/60"
                />
                <p className="mt-2 text-xs text-muted-foreground">{t.register.passwordHint}</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t.register.confirmPassword}</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border/40 focus:border-white/60"
                />
              </div>

              {/* Terms */}
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={isLoading}
                  className="rounded border-border/40"
                />
                <span>
                  {t.register.agreeTerms}{" "}
                  <a href="#" className="text-white hover:text-white/80">{t.register.termsOfService}</a>
                </span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-white/90 border border-white/30 py-2 text-base disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader className="mr-2 h-4 w-4 animate-spin" />{t.register.creatingAccount}</>
                ) : (
                  t.register.createAccount
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40 text-center">
              <p className="text-muted-foreground text-sm">
                {t.register.alreadyStar}{" "}
                <Link to="/login" className="text-white hover:text-white/80 font-medium">{t.register.signIn}</Link>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground text-sm">
              {t.register.backHome}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function isStrongPassword(value: string) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
}
