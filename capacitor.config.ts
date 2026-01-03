import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.773b7c0800b24414a17a5c50947736de',
  appName: 'rightnetiptv',
  webDir: 'dist',
  server: {
    url: 'https://773b7c08-00b2-4414-a17a-5c50947736de.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    // Android TV specific settings
    allowMixedContent: true
  }
};

export default config;
