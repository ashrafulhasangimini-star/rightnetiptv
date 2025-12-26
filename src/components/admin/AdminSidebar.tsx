import { 
  LayoutDashboard, 
  Tv, 
  FolderTree, 
  Settings, 
  Users,
  Radio,
  ChevronLeft
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "ড্যাশবোর্ড", path: "/admin" },
  { icon: Tv, label: "চ্যানেল", path: "/admin/channels" },
  { icon: FolderTree, label: "ক্যাটাগরি", path: "/admin/categories" },
  { icon: Radio, label: "লাইভ স্ট্রিম", path: "/admin/streams" },
  { icon: Users, label: "ব্যবহারকারী", path: "/admin/users" },
  { icon: Settings, label: "সেটিংস", path: "/admin/settings" },
];

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border sidebar-glow z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Tv className="h-5 w-5 text-foreground" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">
                Admin
              </span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary shadow-lg shadow-primary/10"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Tv className="h-4 w-4" />
                <span>হোমে ফিরুন</span>
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
