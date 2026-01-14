import { Menu, Search, Settings, LogIn, LogOut, Download, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({ onMenuClick, searchQuery = "", onSearchChange }: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("সফলভাবে লগআউট হয়েছে");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.jpeg" 
              alt="Right NeT TV" 
              className="h-10 w-10 rounded-xl object-contain"
            />
            <span className="font-display font-bold text-xl gradient-text hidden sm:block">
              Right Net TV
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="চ্যানেল খুঁজুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange?.("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <Link to="/install">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">ইনস্টল</span>
            </Button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="glass" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">অ্যাডমিন</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="glass" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">লগইন</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3">
          <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="চ্যানেল খুঁজুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              autoFocus
              className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange?.("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
