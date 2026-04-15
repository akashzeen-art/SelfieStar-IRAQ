import { Star } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Star className="h-5 w-5 text-neon-purple" />
          <span className="font-bold">SelfiStar</span>
        </div>
        <p>© 2024 SelfiStar. Unleash your selfie potential.</p>
      </div>
    </footer>
  );
}
