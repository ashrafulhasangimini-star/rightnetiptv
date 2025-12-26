import { Tv, Menu, Search, Settings, LogIn, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();

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
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Tv className="h-5 w-5 text-foreground" />
            </div>
            <span className="font-display font-bold text-xl gradient-text hidden sm:block">
              StreamBD
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="চ্যানেল খুঁজুন..."
              className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-muted-foreground"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
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
    </header>
  );
};

export default Header;
