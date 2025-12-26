import { Channel } from "@/types/channel";
import { X, Volume2, VolumeX, Maximize, Settings, Users, Radio } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
}

const VideoPlayer = ({ channel, onClose }: VideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-display font-semibold text-lg">{channel.name}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {channel.isLive && (
                  <span className="live-badge">
                    <Radio className="w-3 h-3" />
                    LIVE
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {channel.viewers.toLocaleString()} দর্শক
                </span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {/* Placeholder for actual video player */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Radio className="w-12 h-12 text-primary" />
              </div>
              <p className="text-muted-foreground">স্ট্রিম লোড হচ্ছে...</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{channel.streamUrl}</p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-foreground hover:bg-foreground/10"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-foreground/10">
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4 border-t border-border/30">
          <p className="text-muted-foreground">{channel.description}</p>
          <p className="text-sm text-muted-foreground/60 mt-2">ক্যাটাগরি: {channel.category}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
