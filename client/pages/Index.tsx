import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Camera, Zap, Users, Trophy } from "lucide-react";
import VideoBackground from "@/components/VideoBackground";
import LanguageDropdown from "@/components/LanguageDropdown";

export default function Index() {
  return (
    <div className="min-h-screen text-foreground relative">
      <VideoBackground />
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-transparent backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 border border-white/30">
              <Star className="h-6 w-6 fill-white text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              SelfiStar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageDropdown />
            <Link to="/login">
              <Button className="bg-white text-black hover:bg-white/90 border border-white/30 text-sm px-5">
                Login / Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 text-white py-32">
            SMILE, TAKE A SELFIE !
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register">
              <Button className="bg-white text-black hover:bg-white/90 border border-white/30 px-8 py-6 text-lg">
                <Camera className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white/30 px-8 py-6 text-lg hover:bg-white/10 text-white">
                Already a Star?
              </Button>
            </Link>
          </div>

          {/* Hero Image Placeholder */}
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
          <h2 className="text-4xl font-bold text-center mb-16">Why SelfiStar?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-neon-purple/20 bg-transparent backdrop-blur-sm hover:border-neon-purple/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-neon-purple/50 transition-shadow">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Scoring</h3>
              <p className="text-muted-foreground">
                Advanced AI analyzes facial symmetry, lighting, and expression to give you an accurate star rating from 0-100.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-white/20 bg-transparent backdrop-blur-sm hover:border-white/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-white/20 transition-shadow">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Daily Challenges</h3>
              <p className="text-muted-foreground">
                Compete in themed challenges, submit your best selfies, and climb the global leaderboard to become a legend.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-white/20 bg-transparent backdrop-blur-sm hover:border-white/50 transition-colors group">
              <div className="h-12 w-12 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-white/20 transition-shadow">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Thriving Community</h3>
              <p className="text-muted-foreground">
                Share your selfies, engage with millions of users, collect likes and comments, and build your fanbase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                2M+
              </div>
              <p className="text-muted-foreground mt-2">Selfies Scored</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">
                500K+
              </div>
              <p className="text-muted-foreground mt-2">Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">
                50+
              </div>
              <p className="text-muted-foreground mt-2">Daily Challenges</p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                100%
              </div>
              <p className="text-muted-foreground mt-2">Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="mx-auto max-w-4xl text-center p-12 rounded-2xl border border-white/20 bg-transparent backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-4">Ready to Become a Star?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users discovering their selfie potential today.
          </p>
          <Link to="/register">
            <Button className="bg-white text-black hover:bg-white/90 border border-white/30 px-8 py-6 text-lg">
              <Star className="mr-2 h-5 w-5" />
              Launch Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <Star className="h-5 w-5 text-neon-purple" />
            <span className="font-bold">SelfiStar</span>
          </div>
          <p>© 2024 SelfiStar. Unleash your selfie potential.</p>
        </div>
      </footer>
    </div>
  );
}
