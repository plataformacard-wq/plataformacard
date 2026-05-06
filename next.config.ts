import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["framer-motion", "motion-dom"],
  serverExternalPackages: ["@supabase/supabase-js"],
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