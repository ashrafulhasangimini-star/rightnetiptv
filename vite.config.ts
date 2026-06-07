import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // FIX: skipWaiting + clientsClaim — নতুন SW সাথে সাথে active হবে
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "mask-icon.svg",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        id: "/",
        name: "Right NeT TV - লাইভ টিভি স্ট্রিমিং",
        short_name: "Right NeT TV",
        description: "বাংলাদেশের সেরা লাইভ টিভি স্ট্রিমিং প্ল্যাটফর্ম",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        categories: ["entertainment", "news", "sports"],
        lang: "bn",
        dir: "ltr",
        prefer_related_applications: false,
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          // FIX: iOS home screen icon
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        // FIX: page refresh-এ blank screen সমস্যা ঠিক করবে (Firefox, Samsung)
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

        // FIX: নতুন service worker সাথে সাথে নিয়ন্ত্রণ নেবে
        skipWaiting: true,
        clientsClaim: true,

        runtimeCaching: [
          // FIX: HLS .m3u8 manifest — কখনো cache করা যাবে না, সবসময় network থেকে
          {
            urlPattern: /^https?:\/\/.*\.m3u8(\?.*)?$/i,
            handler: "NetworkOnly",
          },
          // FIX: HLS .ts video segments — cache করা যাবে না
          {
            urlPattern: /^https?:\/\/.*\.ts(\?.*)?$/i,
            handler: "NetworkOnly",
          },
          // FIX: HLS .aac audio segments — cache করা যাবে না
          {
            urlPattern: /^https?:\/\/.*\.aac(\?.*)?$/i,
            handler: "NetworkOnly",
          },
          // Images cache — ঠিক আছে
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
