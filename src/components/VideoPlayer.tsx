import { Channel } from "@/types/channel";
import { X, Volume2, VolumeX, Maximize, Minimize, Settings, Users, Radio, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import Hls from "hls.js";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

interface VideoPlayerProps {
  channel: Channel;
  channels: Channel[];
  onClose: () => void;
  onChannelChange: (channel: Channel) => void;
}

const VideoPlayer = ({ channel, channels, onClose, onChannelChange }: VideoPlayerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.streamUrl) return;

    const streamUrl = channel.streamUrl;

    // Check if it's an HLS stream (.m3u8)
    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => {
            // Autoplay blocked, user needs to interact
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("নেটওয়ার্ক সমস্যা - স্ট্রিম লোড হচ্ছে না");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("মিডিয়া এরর - পুনরায় চেষ্টা করা হচ্ছে");
                hls.recoverMediaError();
                break;
              default:
                setError("স্ট্রিম প্লে করা যাচ্ছে না");
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          video.play().catch(() => {});
        });
      } else {
        setError("আপনার ব্রাউজার HLS সাপোর্ট করে না");
      }
    } else {
      // Direct video URL (mp4, webm, etc.)
      video.src = streamUrl;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });
      video.addEventListener('error', () => {
        setError("ভিডিও লোড করা যাচ্ছে না");
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel.streamUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="min-h-full flex flex-col">
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
        <div className="relative bg-black flex items-center justify-center" style={{ minHeight: '50vh', maxHeight: '70vh' }}>
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            autoPlay
            controls={false}
          />

          {/* Loading State */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Radio className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">স্ট্রিম লোড হচ্ছে...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">URL: {channel.streamUrl}</p>
              </div>
            </div>
          )}

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
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

        {/* Channel Carousel */}
        <div className="p-4 border-t border-border/30">
          <h3 className="font-display font-semibold mb-3">অন্যান্য চ্যানেল</h3>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {channels
                .filter((ch) => ch.id !== channel.id)
                .map((ch) => (
                  <CarouselItem key={ch.id} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                    <button
                      type="button"
                      className="relative cursor-pointer group w-full text-left"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChannelChange(ch);
                      }}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={ch.logo}
                          alt={ch.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                        {ch.isLive && (
                          <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 pointer-events-none">
                            <Radio className="w-2 h-2" />
                            LIVE
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1 truncate text-center">{ch.name}</p>
                    </button>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-1/2" />
            <CarouselNext className="right-0 translate-x-1/2" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
