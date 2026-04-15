import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Home } from "lucide-react";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-slate-900 text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30">
            <Star className="h-10 w-10 text-neon-purple" />
          </div>

          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
            404
          </h1>

          <p className="text-xl font-semibold mb-2">Oops! Page Not Found</p>
          <p className="text-muted-foreground mb-8">
            This page doesn't exist or has moved. Let's get you back to finding your selfie potential!
          </p>

          <Link to="/">
            <Button className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/90 hover:to-neon-pink/90 text-white px-8 py-2 text-base gap-2">
              <Home className="h-5 w-5" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
