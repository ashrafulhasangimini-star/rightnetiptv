import { Channel } from "@/types/channel";
import { X, Users, Radio, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
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

// Detect if running on Android TV or large screen TV
const isTV = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android tv') || 
         ua.includes('googletv') || 
         ua.includes('smart-tv') ||
         ua.includes('smarttv') ||
         ua.includes('hbbtv') ||
         ua.includes('tizen') ||
         ua.includes('webos') ||
         (window.innerWidth >= 1920 && !('ontouchstart' in window));
};

const VideoPlayer = ({ channel, channels, onClose, onChannelChange }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTVMode] = useState(isTV);
  const [focusedChannelIndex, setFocusedChannelIndex] = useState(0);
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const channelButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const carouselPointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize Video.js player
  useEffect(() => {
    if (!videoRef.current || !channel.streamUrl) return;

    // Clean up previous player
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    // Create video element
    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-big-play-centered");
    videoRef.current.innerHTML = '';
    videoRef.current.appendChild(videoElement);

    const streamUrl = channel.streamUrl;
    const isHLS = streamUrl.includes('.m3u8');

    // Video.js options - using default controls
    const options = {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      preload: 'auto',
      playsinline: true,
      liveui: true,
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          fastQualityChange: true,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      sources: [{
        src: streamUrl,
        type: isHLS ? 'application/x-mpegURL' : 'video/mp4'
      }]
    };

    // Initialize player
    const player = videojs(videoElement, options, function onPlayerReady() {
      console.log('Video.js player is ready');
      
      player.on('loadeddata', () => {
        setIsLoading(false);
      });

      player.on('playing', () => {
        setIsLoading(false);
      });

      player.on('waiting', () => {
        setIsLoading(true);
      });

      player.on('canplay', () => {
        setIsLoading(false);
      });

      player.on('error', () => {
        const err = player.error();
        console.error('Video.js error:', err);
        
        if (err) {
          switch (err.code) {
            case 1:
              setError("মিডিয়া লোড বাতিল হয়েছে");
              break;
            case 2:
              setError("নেটওয়ার্ক সমস্যা - স্ট্রিম লোড হচ্ছে না");
              break;
            case 3:
              setError("মিডিয়া ডিকোড এরর");
              break;
            case 4:
              setError("এই স্ট্রিম ফরম্যাট সাপোর্টেড নয়");
              break;
            default:
              setError("স্ট্রিম প্লে করা যাচ্ছে না");
          }
        }
        setIsLoading(false);
      });

      player.on('stalled', () => {
        console.log('Stream stalled');
      });
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [channel.streamUrl]);

  // Keyboard/D-pad navigation for TV
  const otherChannels = channels.filter((ch) => ch.id !== channel.id);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 27) {
      e.preventDefault();
      onClose();
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedChannelIndex((prev) => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedChannelIndex((prev) => Math.min(otherChannels.length - 1, prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        closeButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        channelButtonsRef.current[focusedChannelIndex]?.focus();
        break;
    }
  }, [onClose, otherChannels.length, focusedChannelIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    channelButtonsRef.current[focusedChannelIndex]?.focus();
  }, [focusedChannelIndex]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-background animate-fade-in flex flex-col">
      {/* Header with Channel Info */}
      <div className="flex items-center justify-between p-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-display font-semibold text-foreground">{channel.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {channel.isLive && (
                <span className="live-badge text-xs">
                  <Radio className="w-2 h-2" />
                  LIVE
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {channel.viewers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <Button 
          ref={closeButtonRef}
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-foreground hover:bg-accent focus:ring-2 focus:ring-primary/50"
          tabIndex={0}
          aria-label="বন্ধ করুন"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Video Player Section */}
      <div className="flex-1 relative bg-black">
        <div ref={videoRef} className="w-full h-full video-js-container" />

        {/* Loading State */}
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Radio className="w-8 h-8 text-primary" />
              </div>
              <p className="text-white/70">স্ট্রিম লোড হচ্ছে...</p>
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
              <p className="text-xs text-white/50 mt-2">URL: {channel.streamUrl}</p>
            </div>
          </div>
        )}
      </div>

      {/* Channel Carousel - Separate Section Below Player */}
      <div className="bg-card border-t border-border p-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {otherChannels.map((ch, index) => (
              <CarouselItem key={ch.id} className="pl-2 basis-auto">
                <button
                  ref={(el) => { channelButtonsRef.current[index] = el; }}
                  type="button"
                  className="flex flex-col items-center gap-1 cursor-pointer group outline-none focus:scale-110 transition-transform duration-200"
                  tabIndex={0}
                  onFocus={() => setFocusedChannelIndex(index)}
                  onPointerDown={(e) => {
                    carouselPointerStartRef.current = {
                      x: e.clientX,
                      y: e.clientY,
                    };
                  }}
                  onPointerUp={(e) => {
                    const start = carouselPointerStartRef.current;
                    carouselPointerStartRef.current = null;
                    if (!start) return;

                    const dx = Math.abs(e.clientX - start.x);
                    const dy = Math.abs(e.clientY - start.y);
                    const isTap = dx < 8 && dy < 8;
                    if (!isTap) return;

                    e.preventDefault();
                    e.stopPropagation();
                    onChannelChange(ch);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onChannelChange(ch);
                    }
                  }}
                >
                  <div className="relative">
                    <img
                      src={ch.logo}
                      alt={ch.name}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover border-2 border-transparent group-hover:border-primary group-focus:border-primary transition-colors"
                    />
                    {ch.isLive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground group-focus:text-foreground transition-colors text-center max-w-16 truncate">
                    {ch.name}
                  </span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-2" />
          <CarouselNext className="hidden md:flex -right-2" />
        </Carousel>
      </div>
    </div>
  );
};

export default VideoPlayer;
