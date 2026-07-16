"use client";

import dynamic from "next/dynamic";

const CatalogoClient = dynamic(() => import("./CatalogoClient"), {
  ssr: false,
});

export default function CatalogoClientWrapper() {
  return <CatalogoClient />;
}
