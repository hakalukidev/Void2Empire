import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js, which is what
  // the Docker runtime stage copies.
  output: "standalone",

  async headers() {
    return [
      {
        // public/ files are served with max-age=0 by default, so every flag
        // would be revalidated on each visit. Flags never change in place; a
        // new design would ship under a new path.
        source: "/flags/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
