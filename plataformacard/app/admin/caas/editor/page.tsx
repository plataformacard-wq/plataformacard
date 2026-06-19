"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

const CatalogoClient = dynamic(() => import("@/app/dashboard/catalogo/CatalogoClient"), {
  ssr: false,
});

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const catalogId = searchParams.get("catalogId");

  if (!catalogId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[var(--dash-surface)] rounded-xl border border-[var(--dash-border)]">
        <p className="font-bold text-[var(--dash-text-muted)] mb-4">Nenhum catálogo especificado para edição.</p>
        <button 
          onClick={() => router.push("/admin/caas")}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-all"
        >
          Voltar para CaaS
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Voltar */}
      <div>
        <button
          onClick={() => router.push("/admin/caas")}
          className="px-5 py-3 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg text-[var(--dash-text-secondary)] hover:text-purple-500 hover:border-purple-500/50 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Voltar para QG CaaS
        </button>
      </div>

      <CatalogoClient adminCatalogId={catalogId} />
    </div>
  );
}

export default function CaasEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
