import { Channel } from "@/types/channel";
import { X, Users, Radio, AlertCircle, Cone } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import mpegts from "mpegts.js";
import dashjs from "dashjs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { incrementViewerCount, decrementViewerCount } from "@/lib/viewerUtils";
import { supabase } from "@/integrations/supabase/client";

interface VideoPlayerProps {
  channel: Channel;
  channels: Channel[];
  onClose: () => void;
  onChannelChange: (channel: Channel) => void;
}

const VideoPlayer = ({ channel, channels, onClose, onChannelChange }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedChannelIndex, setFocusedChannelIndex] = useState(0);
  const [liveViewerCount, setLiveViewerCount] = useState(channel.viewers);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mpegtsRef = useRef<ReturnType<typeof mpegts.createPlayer> | null>(null);
  const dashRef = useRef<ReturnType<typeof dashjs.MediaPlayer> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const channelButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const carouselPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const viewerCountTrackedRef = useRef(false);

  // Initialize multi-engine player (VLC-like open-source codec coverage)
  useEffect(() => {
    if (!videoRef.current || !channel.streamUrl) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const streamUrl = channel.streamUrl;
    const url = streamUrl.toLowerCase().split("?")[0];
    const isHLS = url.includes(".m3u8");
    const isDASH = url.includes(".mpd");
    const isFLV = url.includes(".flv");
    const isTS = url.endsWith(".ts") || url.includes(".m2ts");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isAppleDevice = isIOS || isSafari;

    // Reset video element
    video.pause();
    video.removeAttribute("src");
    video.load();

    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    (video as any).disableRemotePlayback = true;

    const onLoaded = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onErr = () => {
      setError("এই স্ট্রিম ফরম্যাট সাপোর্টেড নয়");
      setIsLoading(false);
    };
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("canplay", onLoaded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onErr);

    const cleanupEngines = () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (mpegtsRef.current) {
        try { mpegtsRef.current.unload(); mpegtsRef.current.detachMediaElement(); mpegtsRef.current.destroy(); } catch {}
        mpegtsRef.current = null;
      }
      if (dashRef.current) { try { dashRef.current.reset(); } catch {} dashRef.current = null; }
    };

    try {
      if (isHLS) {
        if (isAppleDevice || video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (Hls.isSupported()) {
          const hls = new Hls({
            lowLatencyMode: true,
            backBufferLength: 30,
            maxBufferLength: 30,
            enableWorker: true,
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              setError("HLS স্ট্রিম এরর");
              setIsLoading(false);
            }
          });
          hlsRef.current = hls;
        } else {
          video.src = streamUrl;
        }
      } else if (isDASH) {
        const player = dashjs.MediaPlayer().create();
        player.initialize(video, streamUrl, true);
        player.on(dashjs.MediaPlayer.events.ERROR, () => {
          setError("DASH স্ট্রিম এরর");
          setIsLoading(false);
        });
        dashRef.current = player;
      } else if ((isFLV || isTS) && mpegts.isSupported()) {
        const player = mpegts.createPlayer({
          type: isFLV ? "flv" : "mpegts",
          url: streamUrl,
          isLive: true,
          cors: true,
        }, {
          enableWorker: true,
          enableStashBuffer: false,
          stashInitialSize: 128,
          liveBufferLatencyChasing: true,
        });
        player.attachMediaElement(video);
        player.load();
        player.on(mpegts.Events.ERROR, () => {
          setError("TS/FLV স্ট্রিম এরর");
          setIsLoading(false);
        });
        mpegtsRef.current = player;
      } else {
        video.src = streamUrl;
      }
    } catch (e) {
      console.error("Player init failed", e);
      setError("প্লেয়ার শুরু করা যায়নি");
      setIsLoading(false);
    }

    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => {});

    // Unmute after user interaction
    const unmute = () => {
      video.muted = false;
      document.removeEventListener("touchstart", unmute);
      document.removeEventListener("click", unmute);
    };
    document.addEventListener("touchstart", unmute, { once: true });
    document.addEventListener("click", unmute, { once: true });

    return () => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("canplay", onLoaded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onErr);
      document.removeEventListener("touchstart", unmute);
      document.removeEventListener("click", unmute);
      cleanupEngines();
      try { video.pause(); video.removeAttribute("src"); video.load(); } catch {}
    };
  }, [channel.streamUrl]);

  // Track viewer count - increment when player opens, decrement when closes
  useEffect(() => {
    const trackViewer = async () => {
      try {
        if (!viewerCountTrackedRef.current && channel.id) {
          const newCount = await incrementViewerCount(channel.id);
          viewerCountTrackedRef.current = true;
          setLiveViewerCount(newCount);
          console.log(`Viewer count incremented for channel: ${channel.name}`);
        }
      } catch (error) {
        console.error("Failed to update viewer count:", error);
      }
    };

    trackViewer();

    return () => {
      // Decrement viewer count when component unmounts
      const untrackViewer = async () => {
        try {
          if (viewerCountTrackedRef.current && channel.id) {
            await decrementViewerCount(channel.id);
            viewerCountTrackedRef.current = false;
            console.log(`Viewer count decremented for channel: ${channel.name}`);
          }
        } catch (error) {
          console.error("Failed to update viewer count:", error);
        }
      };
      untrackViewer();
    };
  }, [channel.id, channel.name]);

  // Real-time subscription for viewer count updates
  useEffect(() => {
    if (!channel.id) return;

    // Reset live count when channel changes
    setLiveViewerCount(channel.viewers);

    const channelSubscription = supabase
      .channel(`viewer-count-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'channels',
          filter: `id=eq.${channel.id}`
        },
        (payload) => {
          if (payload.new && typeof payload.new.viewer_count === 'number') {
            setLiveViewerCount(payload.new.viewer_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [channel.id, channel.viewers]);

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
                {liveViewerCount.toLocaleString()}
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
