import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Loader } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import VideoBackground from "@/components/VideoBackground";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useLanguage();

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      const params = new URLSearchParams(location.search);
      const inviteCode = params.get("inviteCode");

      if (inviteCode) {
        // After login, automatically accept pending invite
        navigate(`/challenge/invite/${inviteCode}`, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t.login.fillFields);
      return;
    }

    try {
      await login(email, password);
      // The useEffect will handle the redirect after user state updates
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.loginFailed);
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

            <div>
              <label className="text-sm font-medium mb-2 block">{t.login.email}</label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border/40 focus:border-neon-purple/60"
              />
            </div>

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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border/40" disabled={isLoading} />
                <span>{t.login.rememberMe}</span>
              </label>
              <a href="#" className="text-neon-purple hover:text-neon-purple/80">
                {t.login.forgotPassword}
              </a>
            </div>

            <div className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 p-3 text-xs text-muted-foreground">
              <strong>Note:</strong> {t.login.note}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 border border-white/30 py-2 text-base disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t.login.signingIn}
                </>
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
