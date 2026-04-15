import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

export default function LanguageDropdown() {
  const { language, setLanguage } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2 text-white hover:text-white hover:bg-white/10 font-medium"
        >
          <span>{current.flag}</span>
          <span className="text-xs uppercase tracking-wide">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px] bg-black/80 border-white/20 backdrop-blur-md">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`gap-2 cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 ${
              language === lang.code ? "bg-white/20" : ""
            }`}
          >
            <span>{lang.flag}</span>
            <span className="text-sm">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
