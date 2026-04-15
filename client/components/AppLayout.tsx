import { Link, useNavigate } from "react-router-dom";
import { Star, Camera, Trophy, Zap, LogOut, User } from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import VideoBackground from "@/components/VideoBackground";
import LanguageDropdown from "@/components/LanguageDropdown";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AppLayout({ children, title, description }: AppLayoutProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Video Background */}
      <VideoBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 z-40 w-full border-b border-border/40 bg-transparent backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 border border-white/30">
              <Star className="h-6 w-6 fill-white text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              SelfiStar
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-sm gap-2 text-white hover:text-white hover:bg-white/10">
                <Camera className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="ghost" className="text-sm gap-2 text-white hover:text-white hover:bg-white/10">
                <Zap className="h-4 w-4" />
                Challenges
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="ghost" className="text-sm gap-2 text-white hover:text-white hover:bg-white/10">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" className="text-sm gap-2 text-white hover:text-white hover:bg-white/10">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageDropdown />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:text-white hover:bg-white/10"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 z-40 w-full border-t border-white/20 bg-transparent backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-4 py-3">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors">
            <Camera className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/challenges" className="flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors">
            <Zap className="h-5 w-5" />
            <span className="text-xs">Challenges</span>
          </Link>
          <Link to="/leaderboard" className="flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors">
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Board</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-white hover:text-white/80 transition-colors">
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {title && (
            <div className="mb-8 pt-8">
              <h1 className="text-4xl font-bold mb-2 text-white">
                {title}
              </h1>
              {description && <p className="text-white text-lg">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
