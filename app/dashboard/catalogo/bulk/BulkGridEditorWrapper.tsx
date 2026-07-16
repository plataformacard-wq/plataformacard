"use client";

import dynamic from "next/dynamic";

const BulkGridEditor = dynamic(() => import("./BulkGridEditor"), {
  ssr: false,
});

export default function BulkGridEditorWrapper() {
  return <BulkGridEditor />;
}
