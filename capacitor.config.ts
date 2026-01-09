import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rightnetiptv.app',
  appName: 'rightnetiptv',
  webDir: 'dist',
  server: {
    url: 'https://773b7c08-00b2-4414-a17a-5c50947736de.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    // Android TV specific settings
    allowMixedContent: true,
    // Disable LOCAL_NETWORK permission popup
    useLegacyBridge: false,
    buildOptions: {
      releaseType: 'release'
    }
  },
  ios: {
    // iOS specific settings for HTTP video playback
    preferredConfig: {
      scheme: 'capacitor://',
      iosScheme: 'capacitor',
      hostname: 'localhost'
    }
  }
};

export default config;
