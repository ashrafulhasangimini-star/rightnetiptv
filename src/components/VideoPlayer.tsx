import { Channel } from "@/types/channel";
import { X, Volume2, VolumeX, Maximize, Minimize, Settings, Users, Radio, AlertCircle } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTVMode] = useState(isTV);
  const [focusedChannelIndex, setFocusedChannelIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const channelButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const carouselPointerStartRef = useRef<{ x: number; y: number } | null>(null);

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
        // Native HLS support (Safari/iOS)
        // Check for HTTP streams - iOS blocks mixed content
        if (streamUrl.startsWith('http://') && window.location.protocol === 'https:') {
          setError("iOS এ HTTP স্ট্রিম সাপোর্ট করে না। HTTPS স্ট্রিম প্রয়োজন।");
          setIsLoading(false);
          return;
        }
        
        video.src = streamUrl;
        
        const handleLoadedMetadata = () => {
          setIsLoading(false);
          video.play().catch((err) => {
            console.log('Autoplay blocked:', err);
          });
        };
        
        const handleError = () => {
          const mediaError = video.error;
          console.error('iOS Video Error:', mediaError);
          
          if (mediaError) {
            switch (mediaError.code) {
              case MediaError.MEDIA_ERR_NETWORK:
                setError("নেটওয়ার্ক সমস্যা - স্ট্রিম লোড হচ্ছে না (iOS)");
                break;
              case MediaError.MEDIA_ERR_DECODE:
                setError("মিডিয়া ডিকোড এরর");
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                setError("এই স্ট্রিম ফরম্যাট সাপোর্টেড নয়");
                break;
              default:
                setError("স্ট্রিম লোড করা যাচ্ছে না");
            }
          } else {
            setError("স্ট্রিম লোড করা যাচ্ছে না");
          }
          setIsLoading(false);
        };
        
        const handleStalled = () => {
          console.log('iOS: Stream stalled');
          setError("স্ট্রিম থেমে গেছে - নেটওয়ার্ক চেক করুন");
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);
        video.addEventListener('stalled', handleStalled);
        
        // Cleanup
        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
          video.removeEventListener('stalled', handleStalled);
        };
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
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(1);
    } else {
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!container) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
        
        // Lock to landscape on mobile
        if (isMobile && screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (e) {
            console.log('Orientation lock not supported');
          }
        }
      } catch (e) {
        // Fallback for iOS - use video element's webkitEnterFullscreen
        if (video && 'webkitEnterFullscreen' in video) {
          (video as any).webkitEnterFullscreen();
        }
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
      
      // Unlock orientation
      if (isMobile && screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock();
      }
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

  // Keyboard/D-pad navigation for TV
  const otherChannels = channels.filter((ch) => ch.id !== channel.id);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ESC or Android Back button to close
    if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 27) {
      e.preventDefault();
      onClose();
      return;
    }

    // D-pad navigation
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
      case 'Enter':
      case ' ':
        // Let the focused element handle it
        break;
      case 'm':
      case 'M':
        setIsMuted(!isMuted);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
    }
  }, [onClose, otherChannels.length, focusedChannelIndex, isMuted]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus on channel when index changes
  useEffect(() => {
    channelButtonsRef.current[focusedChannelIndex]?.focus();
  }, [focusedChannelIndex]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
      {/* Floating Close Button - Always visible on TV, hover on desktop/mobile */}
      <div className={`fixed top-0 right-0 z-[60] p-4 ${isTVMode ? '' : 'group/close'}`}>
        {/* Large hover trigger area - only for non-TV */}
        {!isTVMode && <div className="absolute inset-0 w-28 h-28" />}
        <Button 
          ref={closeButtonRef}
          variant="destructive" 
          size="icon" 
          onClick={onClose}
          className={`h-12 w-12 rounded-full shadow-xl transition-all duration-300 
            focus:ring-4 focus:ring-destructive/50 focus:outline-none focus:scale-110
            ${isTVMode 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75 group-hover/close:opacity-100 group-hover/close:scale-100'
            }`}
          tabIndex={0}
          aria-label="বন্ধ করুন"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

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
            muted={isMuted}
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
              <div 
                className="flex items-center gap-2 relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  tabIndex={0}
                  aria-label={isMuted ? "আনমিউট করুন" : "মিউট করুন"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                {/* Volume Slider */}
                <div className={`flex items-center transition-all duration-300 overflow-hidden ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    aria-label="ভলিউম"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  tabIndex={0}
                  aria-label="সেটিংস"
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  onClick={toggleFullscreen}
                  tabIndex={0}
                  aria-label={isFullscreen ? "ছোট করুন" : "ফুলস্ক্রিন"}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Carousel - Below Player for PC/TV */}
        <div className="p-4 border-t border-border/30">
          <h3 className="font-display font-semibold mb-4 text-lg">Live</h3>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {otherChannels.map((ch, index) => (
                  <CarouselItem key={ch.id} className="pl-3 basis-auto">
                    <button
                      ref={(el) => { channelButtonsRef.current[index] = el; }}
                      type="button"
                      className={`flex flex-col items-center gap-2 cursor-pointer group outline-none
                        ${isTVMode ? 'tv:w-24 tv:h-24' : ''}
                        focus:scale-110 transition-transform duration-200`}
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
                      {/* Circular Channel Logo */}
                      <div className="relative">
                        <div className={`w-16 h-16 md:w-20 md:h-20 ${isTVMode ? 'lg:w-24 lg:h-24' : ''} rounded-full overflow-hidden border-2 border-white/80 bg-muted transition-all duration-300 
                          group-hover:border-primary group-hover:scale-105 
                          group-focus:border-primary group-focus:scale-110 group-focus:ring-4 group-focus:ring-primary/50
                          shadow-lg`}>
                          {ch.logo ? (
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10 text-xl font-bold text-primary">
                              {ch.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {/* Live Badge */}
                        {ch.isLive && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[9px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5 shadow-md">
                            <Radio className="w-2 h-2" />
                            LIVE
                          </div>
                        )}
                      </div>
                      {/* Channel Name */}
                      <p className={`text-xs text-center max-w-[80px] ${isTVMode ? 'lg:max-w-[100px] lg:text-sm' : ''} truncate text-muted-foreground group-hover:text-foreground group-focus:text-primary transition-colors`}>
                        {ch.name}
                      </p>
                    </button>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-1/2 bg-background/80 hover:bg-background focus:ring-2 focus:ring-primary" />
            <CarouselNext className="right-0 translate-x-1/2 bg-background/80 hover:bg-background focus:ring-2 focus:ring-primary" />
          </Carousel>
        </div>

        {/* Info Section - At Bottom */}
        <div className="p-4 border-t border-border/30">
          <p className="text-muted-foreground">{channel.description}</p>
          <p className="text-sm text-muted-foreground/60 mt-2">ক্যাটাগরি: {channel.category}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
