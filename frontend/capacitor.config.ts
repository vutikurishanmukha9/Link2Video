import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.link2video.app",
  appName: "Link2Video",
  webDir: ".output/public",
  server: {
    url: "https://link2download.vercel.app",
    androidScheme: "https",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#000000",
  },
};

export default config;
