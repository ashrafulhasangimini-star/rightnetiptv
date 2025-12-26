import { Radio, Signal, Wifi, WifiOff, Loader2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChannels, useUpdateChannel } from "@/hooks/useChannels";

const Streams = () => {
  const { data: channels, isLoading } = useChannels();
  const updateChannel = useUpdateChannel();

  const liveChannels = channels?.filter((ch) => ch.is_live) || [];
  const offlineChannels = channels?.filter((ch) => !ch.is_live) || [];

  const toggleLiveStatus = (channelId: string, currentStatus: boolean) => {
    updateChannel.mutate({ id: channelId, is_live: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        {liveChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveChannels.map((channel) => (
              <div key={channel.id} className="glass-card p-4 border-l-4 border-l-success">
                <div className="flex items-center gap-4">
                  {channel.logo_url ? (
                    <img
                      src={channel.logo_url}
                      alt={channel.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{channel.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{channel.stream_url}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-success">
                        <Signal className="w-3 h-3" />
                        সংযুক্ত
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {channel.viewer_count.toLocaleString()} দর্শক
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleLiveStatus(channel.id, channel.is_live)}
                    disabled={updateChannel.isPending}
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    অফলাইন করুন
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-muted-foreground">
            কোনো লাইভ স্ট্রিম নেই
          </div>
        )}
      </div>

      {/* Offline Streams */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <WifiOff className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">অফলাইন ({offlineChannels.length})</h2>
        </div>
        {offlineChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineChannels.map((channel) => (
              <div key={channel.id} className="glass-card p-4 opacity-60">
                <div className="flex items-center gap-4">
                  {channel.logo_url ? (
                    <img
                      src={channel.logo_url}
                      alt={channel.name}
                      className="w-16 h-16 rounded-xl object-cover grayscale"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{channel.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{channel.stream_url}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <WifiOff className="w-3 h-3" />
                      সংযোগ বিচ্ছিন্ন
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => toggleLiveStatus(channel.id, channel.is_live)}
                    disabled={updateChannel.isPending}
                  >
                    <Wifi className="w-4 h-4" />
                    লাইভ করুন
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-muted-foreground">
            সব চ্যানেল লাইভ আছে
          </div>
        )}
      </div>
    </div>
  );
};

export default Streams;
