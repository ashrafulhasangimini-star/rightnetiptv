import { Channel } from "@/types/channel";
import { X, Users, Radio, AlertCircle, RotateCw, Play, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
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
  const [retryKey, setRetryKey] = useState(0);
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);
  // FIX 1: isMuted state — video শুরু হয় muted, user tap করলে unmute হয়
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const channelButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const carouselPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const viewerCountTrackedRef = useRef(false);

  // FIX 1: isMuted state সরাসরি video element-এ sync করা
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Initialize HLS / native video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.streamUrl) return;

    // FIX 3 & 4: প্রতিবার নতুন channel-এ state পরিষ্কার করা
    setWaitingForInteraction(false);
    setIsLoading(true);
    setError(null);
    setIsMuted(true);

    const streamUrl = channel.streamUrl;
    const isHLS = /\.m3u8(\?|$)/i.test(streamUrl);

    // FIX 4: আগের HLS instance destroy করা
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // FIX 4: iOS-এ নতুন source দেওয়ার আগে video element সম্পূর্ণ reset
    video.pause();
    video.removeAttribute("src");
    video.load();

    const onLoaded = () => setIsLoading(false);
    const onPlaying = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);
    const onErr = () => setError("স্ট্রিম প্লে করা যাচ্ছে না");

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", onErr);

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch((err: any) => {
          // iOS Safari / Firefox autoplay block হলে tap-to-play overlay দেখানো
          if (err && (err.name === "NotAllowedError" || err.name === "AbortError")) {
            setWaitingForInteraction(true);
          }
        });
      }
    };

    // FIX 4: 50ms delay — iOS Safari-কে আগের media session release করার সময় দেওয়া
    const setupTimer = setTimeout(() => {
      if (!isHLS) {
        video.src = streamUrl;
        tryPlay();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // iOS Safari / macOS Safari — native HLS, hls.js ব্যবহার করা যাবে না
        video.src = streamUrl;
        tryPlay();
      } else if (Hls.isSupported()) {
        // Chrome, Firefox, Edge, Android
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          tryPlay();
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error("HLS error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                hlsRef.current = null;
                setError("স্ট্রিম প্লে করা যাচ্ছে না");
                setIsLoading(false);
            }
          }
        });
      } else {
        setError("আপনার ব্রাউজার এই ভিডিও সাপোর্ট করে না");
        setIsLoading(false);
      }
    }, 50);

    return () => {
      clearTimeout(setupTimer); // FIX 4: unmount হলে timer বাতিল
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", onErr);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      try {
        video.removeAttribute("src");
        video.load();
      } catch {}
    };
  }, [channel.streamUrl, retryKey]);

  // Track viewer count — increment when player opens, decrement when closes
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

    setLiveViewerCount(channel.viewers);

    const channelSubscription = supabase
      .channel(`viewer-count-${channel.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "channels",
          filter: `id=eq.${channel.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new.viewer_count === "number") {
            setLiveViewerCount(payload.new.viewer_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [channel.id, channel.viewers]);

  // Keyboard / D-pad navigation for TV remotes
  const otherChannels = channels.filter((ch) => ch.id !== channel.id);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace" || e.keyCode === 27) {
        e.preventDefault();
        onClose();
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setFocusedChannelIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusedChannelIndex((prev) =>
            Math.min(otherChannels.length - 1, prev + 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          closeButtonRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          channelButtonsRef.current[focusedChannelIndex]?.focus();
          break;
      }
    },
    [onClose, otherChannels.length, focusedChannelIndex]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    channelButtonsRef.current[focusedChannelIndex]?.focus();
  }, [focusedChannelIndex]);

  return (
    // FIX 2: safe-area padding যোগ — iPhone notch ও home indicator ঠিক রাখবে
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background animate-fade-in flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-display font-semibold text-foreground">
              {channel.name}
            </h2>
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

      {/* Video Section — FIX 2: min-h-0 ছাড়া iOS Safari flex-1 ভুল height ধরে */}
      <div className="flex-1 relative bg-black min-h-0">
        <video
          ref={videoRef}
          // FIX 2: object-contain যোগ, hardcoded muted সরানো
          className="w-full h-full object-contain [&::-webkit-media-controls]:opacity-100"
          controls
          playsInline
          // @ts-ignore — iOS vendor attribute
          webkit-playsinline="true"
          x-webkit-airplay="deny"
          disableRemotePlayback
          autoPlay
          // FIX 1: মূল muted attribute নেই — useEffect দিয়ে control করা হচ্ছে
        />

        {/* FIX 1: Unmute overlay — video চলছে কিন্তু muted আছে তখন দেখাবে */}
        {isMuted && !waitingForInteraction && !error && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setIsMuted(false);
              if (videoRef.current) videoRef.current.muted = false;
            }}
            className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/60 hover:bg-black/80 active:scale-95 text-white text-sm rounded-full px-3 py-2 transition-all"
            aria-label="শব্দ চালু করুন"
          >
            <VolumeX className="w-4 h-4" />
            <span>শব্দ চালু করুন</span>
          </button>
        )}

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
              <p className="text-destructive font-semibold">
                ভিডিও লোড হচ্ছে না। পুনরায় চেষ্টা করুন।
              </p>
              <p className="text-sm text-white/70 mt-1">{channel.name}</p>
              <p className="text-xs text-white/40 mt-1">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setRetryKey((k) => k + 1);
                }}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                আবার চেষ্টা করুন
              </Button>
            </div>
          </div>
        )}

        {/* Tap-to-play overlay — iOS Safari autoplay block হলে */}
        {waitingForInteraction && !error && (
          <button
            type="button"
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              // প্রথমে unmuted play করার চেষ্টা
              v.muted = false;
              setIsMuted(false);
              const p = v.play();
              if (p && typeof p.then === "function") {
                p.then(() => {
                  setWaitingForInteraction(false);
                }).catch(() => {
                  // unmuted play ব্লক হলে muted play
                  v.muted = true;
                  setIsMuted(true);
                  v.play().finally(() => setWaitingForInteraction(false));
                });
              } else {
                setWaitingForInteraction(false);
              }
            }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-white"
            aria-label="চ্যানেল দেখতে এখানে ট্যাপ করুন"
          >
            <div className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center mb-4 shadow-2xl animate-pulse">
              <Play className="w-12 h-12 fill-current" />
            </div>
            <p className="text-lg font-display font-semibold">
              চ্যানেল দেখতে এখানে ট্যাপ করুন
            </p>
          </button>
        )}
      </div>

      {/* Channel Carousel */}
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
                  ref={(el) => {
                    channelButtonsRef.current[index] = el;
                  }}
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
                    if (e.key === "Enter" || e.key === " ") {
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
