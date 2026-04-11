import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/entrar",
        destination: "/entrar",
        permanent: false,
      },
    ].filter(Boolean) as any[];
  },
};

export default nextConfig;