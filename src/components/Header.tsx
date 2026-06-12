import { Search, Settings, LogIn, LogOut, Download, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({ searchQuery = "", onSearchChange }: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("সফলভাবে লগআউট হয়েছে");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.jpeg"
            alt="Right Net TV"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-primary/20"
          />
          <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-foreground">
            Right Net <span className="text-primary">TV</span>
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <div className="relative w-full group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="চ্যানেল খুঁজুন..."
              className="w-full bg-card/60 border border-border/60 rounded-2xl py-2.5 pl-12 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/install" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">ইনস্টল</span>
            </Button>
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button size="sm" className="rounded-xl gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">অ্যাডমিন</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-xl">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">লগইন</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3 border-t border-border/40">
        <div className="relative w-full mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="চ্যানেল খুঁজুন..."
            className="w-full bg-card/60 border border-border/60 rounded-2xl py-2.5 pl-11 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
