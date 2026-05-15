import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://recso.dev/R.png"),
      new URL("https://messyui.dev/favicon_io/android-chrome-192x192.png"),
    ],
  },
};

export default nextConfig;
