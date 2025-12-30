import { useState } from "react";
import { Channel } from "@/types/channel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { X, Save, Link as LinkIcon, Image, Tag } from "lucide-react";

interface ChannelFormProps {
  channel?: Channel;
  onSave: (channel: Partial<Channel>) => void;
  onClose: () => void;
}

const ChannelForm = ({ channel, onSave, onClose }: ChannelFormProps) => {
  const [formData, setFormData] = useState({
    name: channel?.name || "",
    logo: channel?.logo || "",
    streamUrl: channel?.streamUrl || "",
    category: channel?.category || "",
    description: channel?.description || "",
    isLive: channel?.isLive || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg mx-4 p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">
            {channel ? "চ্যানেল এডিট করুন" : "নতুন চ্যানেল যোগ করুন"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">চ্যানেলের নাম</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="চ্যানেলের নাম লিখুন"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="streamUrl" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              স্ট্রিম URL (M3U8/HLS/RTMP)
            </Label>
            <Input
              id="streamUrl"
              value={formData.streamUrl}
              onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
              placeholder="https://example.com/live/stream.m3u8"
              required
            />
            <p className="text-xs text-muted-foreground">
              সাপোর্টেড ফরম্যাট: .m3u8, HLS, RTMP লিংক
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              লোগো URL
            </Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              ক্যাটাগরি
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="সংবাদ, খেলাধুলা, বিনোদন..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="চ্যানেল সম্পর্কে সংক্ষিপ্ত বিবরণ"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <Label htmlFor="isLive" className="font-medium">লাইভ স্ট্যাটাস</Label>
              <p className="text-sm text-muted-foreground">চ্যানেলটি বর্তমানে লাইভ আছে</p>
            </div>
            <Switch
              id="isLive"
              checked={formData.isLive}
              onCheckedChange={(checked) => setFormData({ ...formData, isLive: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              বাতিল
            </Button>
            <Button type="submit" variant="gradient" className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelForm;
