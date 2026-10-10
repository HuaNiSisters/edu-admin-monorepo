import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // PPR fallback payloads can expose %%drp:...%% IDs on deployed client routes.
  // Keep dynamic routes request-rendered until that path is safe to enable.
  cacheComponents: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      '@backend': path.resolve(__dirname, '../backend'),
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
};

export default nextConfig;
