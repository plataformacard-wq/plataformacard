import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/entrar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;