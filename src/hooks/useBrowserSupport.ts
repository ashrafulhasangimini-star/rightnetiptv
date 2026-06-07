import { useEffect, useState } from "react";
import Hls from "hls.js";
import { toast } from "sonner";

export interface BrowserSupport {
  isIOS: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  hlsSupported: boolean;
}

const SESSION_KEY = "browser-support-warning-shown";

export function useBrowserSupport(): BrowserSupport {
  const [support, setSupport] = useState<BrowserSupport>({
    isIOS: false,
    isSafari: false,
    isFirefox: false,
    hlsSupported: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isFirefox = ua.includes("Firefox");

    const video = document.createElement("video");
    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
    const hlsSupported = Hls.isSupported() || nativeHls;

    setSupport({ isIOS, isSafari, isFirefox, hlsSupported });

    if (!hlsSupported) {
      try {
        if (!sessionStorage.getItem(SESSION_KEY)) {
          toast.error(
            "আপনার ব্রাউজার পুরোপুরি সাপোর্টেড নয়। Chrome বা Safari ব্যবহার করুন।"
          );
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      } catch {
        // sessionStorage unavailable
      }
    }
  }, []);

  return support;
}