import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "elaura.pxxl.click",
        "9k6v5fl0-3000.uks1.devtunnels.ms",
        "*.devtunnels.ms",
        "*.uks1.devtunnels.ms",
      ],
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
