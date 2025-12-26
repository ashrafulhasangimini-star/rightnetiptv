import { Button } from "@/components/ui/button";
import { Plus, Shield, User, Clock } from "lucide-react";

const mockUsers = [
  { id: "1", name: "আহমেদ করিম", email: "ahmed@example.com", role: "অ্যাডমিন", lastActive: "এইমাত্র" },
  { id: "2", name: "ফাতেমা আক্তার", email: "fatema@example.com", role: "মডারেটর", lastActive: "৫ মিনিট আগে" },
  { id: "3", name: "রহিম উদ্দিন", email: "rahim@example.com", role: "এডিটর", lastActive: "১ ঘন্টা আগে" },
];

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">ব্যবহারকারী ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">অ্যাডমিন ও মডারেটর ম্যানেজ করুন</p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          নতুন ব্যবহারকারী
        </Button>
      </div>

      <div className="glass-card divide-y divide-border/30">
        {mockUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">{user.role}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{user.lastActive}</span>
              </div>
              <Button variant="ghost" size="sm">সম্পাদনা</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
