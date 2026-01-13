import { Channel } from "@/types/channel";
import { Play, Users, Radio } from "lucide-react";
import { Button } from "./ui/button";

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

const ChannelCard = ({ channel, onClick }: ChannelCardProps) => {
  return (
    <div 
      className="channel-card glass-card-hover group cursor-pointer outline-none
        focus:ring-4 focus:ring-primary/50 focus:border-primary/50 focus:scale-[1.02]
        transition-all duration-300"
      onClick={() => onClick(channel)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(channel);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${channel.name} চ্যানেল দেখুন${channel.isLive ? ' - লাইভ' : ''}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Live Badge */}
        {channel.isLive && (
          <div className="absolute top-3 left-3 live-badge">
            <Radio className="w-3 h-3" />
            <span>LIVE</span>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
          <Button variant="glow" size="icon" className="w-14 h-14 rounded-full">
            <Play className="w-6 h-6 fill-current" />
          </Button>
        </div>

        {/* Viewers Count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-foreground/80 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Users className="w-3 h-3" />
          <span>{channel.viewers.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground truncate group-hover:text-primary group-focus:text-primary transition-colors">
          {channel.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {channel.category}
        </p>
      </div>
    </div>
  );
};

export default ChannelCard;
