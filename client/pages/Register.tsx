import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
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
      await register(email, username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.register.registerFailed);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <VideoBackground />

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 border border-white/30 mx-auto mb-4">
            <Star className="h-7 w-7 fill-white text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            SelfiStar
          </h1>
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

            <div>
              <label className="text-sm font-medium mb-2 block">{t.register.email}</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border/40 focus:border-white/60"
              />
            </div>

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
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t.register.creatingAccount}
                </>
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
