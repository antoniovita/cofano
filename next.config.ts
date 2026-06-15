import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/articles", destination: "/research", permanent: true },
      { source: "/articles/:id", destination: "/research/:id", permanent: true },
      { source: "/dashboard", destination: "/account", permanent: false },
      { source: "/learn", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
