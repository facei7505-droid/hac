import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
  },
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.parallelism = 1;
    }
    return config;
  },
};

export default nextConfig;
