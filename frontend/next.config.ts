import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js, which is what
  // the Docker runtime stage copies.
  output: "standalone",
};

export default nextConfig;
