import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // .mdx joins the usual suspects so posts can live beside routes.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      new URL("https://recso.dev/R.png"),
      new URL("https://messyui.dev/favicon_io/android-chrome-192x192.png"),
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
