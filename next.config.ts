import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A package-lock.json in the home folder otherwise makes Next.js guess the wrong root.
  turbopack: { root: __dirname },
};

export default nextConfig;
