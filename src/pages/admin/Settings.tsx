import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Server, Shield, Bell } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("সেটিংস সংরক্ষণ করা হয়েছে!");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl">সেটিংস</h1>
        <p className="text-muted-foreground">অ্যাপ্লিকেশন সেটিংস কনফিগার করুন</p>
      </div>

      {/* Server Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">সার্ভার সেটিংস</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>RTMP সার্ভার URL</Label>
            <Input defaultValue="rtmp://stream.example.com/live" />
          </div>
          <div className="space-y-2">
            <Label>HLS সার্ভার URL</Label>
            <Input defaultValue="https://hls.example.com" />
          </div>
          <div className="space-y-2">
            <Label>স্ট্রিম কী প্রিফিক্স</Label>
            <Input defaultValue="stream_" />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">নিরাপত্তা</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>দ্বি-ফ্যাক্টর প্রমাণীকরণ</Label>
              <p className="text-sm text-muted-foreground">অ্যাডমিনদের জন্য 2FA সক্রিয় করুন</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>স্ট্রিম এনক্রিপশন</Label>
              <p className="text-sm text-muted-foreground">সব স্ট্রিম এনক্রিপ্ট করুন</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">নোটিফিকেশন</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>স্ট্রিম ডাউন অ্যালার্ট</Label>
              <p className="text-sm text-muted-foreground">কোনো স্ট্রিম ডাউন হলে নোটিফাই করুন</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>দৈনিক রিপোর্ট</Label>
              <p className="text-sm text-muted-foreground">প্রতিদিনের সারসংক্ষেপ ইমেইলে পান</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <Button variant="gradient" onClick={handleSave} className="gap-2">
        <Save className="h-4 w-4" />
        সেটিংস সংরক্ষণ করুন
      </Button>
    </div>
  );
};

export default Settings;
