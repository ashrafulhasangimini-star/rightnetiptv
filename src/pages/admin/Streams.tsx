import { mockChannels } from "@/data/mockData";
import { Radio, Signal, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Streams = () => {
  const liveChannels = mockChannels.filter((ch) => ch.isLive);
  const offlineChannels = mockChannels.filter((ch) => !ch.isLive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">লাইভ স্ট্রিম মনিটর</h1>
        <p className="text-muted-foreground">সকল স্ট্রিমের বর্তমান অবস্থা</p>
      </div>

      {/* Live Streams */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-live animate-pulse" />
          <h2 className="font-semibold text-lg">লাইভ স্ট্রিম ({liveChannels.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveChannels.map((channel) => (
            <div key={channel.id} className="glass-card p-4 border-l-4 border-l-success">
              <div className="flex items-center gap-4">
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{channel.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{channel.streamUrl}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-success">
                      <Signal className="w-3 h-3" />
                      সংযুক্ত
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {channel.viewers.toLocaleString()} দর্শক
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <WifiOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Streams */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <WifiOff className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">অফলাইন ({offlineChannels.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offlineChannels.map((channel) => (
            <div key={channel.id} className="glass-card p-4 opacity-60">
              <div className="flex items-center gap-4">
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-16 h-16 rounded-xl object-cover grayscale"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{channel.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{channel.streamUrl}</p>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <WifiOff className="w-3 h-3" />
                    সংযোগ বিচ্ছিন্ন
                  </span>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Wifi className="w-4 h-4" />
                  সংযুক্ত করুন
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Streams;
