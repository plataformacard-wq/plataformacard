"use client";

import dynamic from "next/dynamic";

const BulkGridEditor = dynamic(() => import("./BulkGridEditor"), {
  ssr: false,
});

export default function BulkPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--dash-text-primary)]">
          Gerenciar produtos em Massa
        </h1>
        <p className="text-[var(--dash-text-secondary)]">
          Edite múltiplos produtos e categorias simultaneamente com interface de planilha.
        </p>
      </div>
      
      <BulkGridEditor />
    </div>
  );
}
