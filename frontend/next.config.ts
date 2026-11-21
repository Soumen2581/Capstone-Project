import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server bundle for the production image.
  output: "standalone",
  reactStrictMode: true,
  // Allow both localhost and 127.0.0.1 during dockerized `next dev`.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
