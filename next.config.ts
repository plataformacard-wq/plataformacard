import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/login",
        permanent: false,
      },
    ].filter(Boolean) as any[];
  },
};

export default nextConfig;