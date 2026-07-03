import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { execSync } from "child_process";

let appVersion = "0.9.0";
try {
  const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
  appVersion = pkg.version;
} catch (e) {}

const getGitCommit = () => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7);
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (e) {
    return "local";
  }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GIT_COMMIT: getGitCommit(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
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