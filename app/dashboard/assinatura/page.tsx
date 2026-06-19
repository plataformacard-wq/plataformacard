"use client";

import dynamic from "next/dynamic";

const AssinaturaClient = dynamic(() => import("./AssinaturaClient"), {
  ssr: false,
});

export default function Page() {
  return <AssinaturaClient />;
}
