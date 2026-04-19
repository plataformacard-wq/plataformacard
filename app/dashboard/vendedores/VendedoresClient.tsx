"use client";

import { useState } from "react";
import { createSeller, deleteSeller, updateSellerPassword } from "@/lib/dashboard/sellerActions";
import { useRouter } from "next/navigation";

type Seller = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  slug: string;
  avatar_url: string | null;
  created_at: string;
};

export default function VendedoresClient({ sellers }: { sellers: Seller[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createSeller(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsModalOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!sellerToDelete?.user_id) return;
    setDeleteLoading(true);
    const result = await deleteSeller(sellerToDelete.user_id);
    if (result.error) {
      alert(result.error);
    } else {
      setSellerToDelete(null);
      router.refresh();
    }
    setDeleteLoading(false);
  }

  const [sellerToUpdatePwd, setSellerToUpdatePwd] = useState<Seller | null>(null);
  const [updatePwdLoading, setUpdatePwdLoading] = useState(false);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!sellerToUpdatePwd?.user_id) return;
    setUpdatePwdLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    
    const result = await updateSellerPassword(sellerToUpdatePwd.user_id, newPassword);
    if (result.error) {
      alert(result.error);
    } else {
      setSellerToUpdatePwd(null);
      alert("Senha atualizada com sucesso!");
    }
    setUpdatePwdLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Vendedores</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Gestão da sua rede de vendedores.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl px-4 py-2 text-sm font-medium"
          style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
        >
          Novo vendedor
        </button>
      </div>

      <div className="mt-8 rounded-2xl border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        {sellers.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: "var(--dash-text-secondary)" }}>Nenhum vendedor cadastrado.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--dash-border)" }}>
            {sellers.map((seller) => (
              <div key={seller.id} className="flex items-center justify-between p-4 sm:px-6">
                <div className="flex items-center gap-4">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.full_name || ""} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold" style={{ background: "var(--dash-border)" }}>
                      {seller.full_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: "var(--dash-text-primary)" }}>{seller.full_name || "Sem Nome"}</p>
                    <p className="text-xs" style={{ color: "var(--dash-text-secondary)" }}>/p/{seller.slug}</p>
                  </div>
                </div>
                <div className="text-right flex items-center justify-end gap-3">
                   <a 
                     href={`/p/${seller.slug}`} 
                     target="_blank" 
                     className="text-sm font-medium text-blue-500 hover:underline"
                   >
                     Ver Catálogo ↗
                   </a>
                   {seller.user_id && (
                     <>
                       <button
                         onClick={() => setSellerToUpdatePwd(seller)}
                         className="text-sm font-medium hover:underline"
                         style={{ color: "var(--dash-text-secondary)" }}
                       >
                         Trocar Senha
                       </button>
                       <button
                         onClick={() => setSellerToDelete(seller)}
                         className="text-sm font-medium text-red-500 hover:underline"
                       >
                         Excluir
                       </button>
                     </>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--dash-text-primary)" }}>Novo Vendedor</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-primary)" }}>Nome Completo</label>
                <input required type="text" name="fullName" placeholder="Ex: João Silva" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-primary)" }}>E-mail de Acesso</label>
                <input required type="email" name="email" placeholder="vendedor@maj.com" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-primary)" }}>Senha Inicial</label>
                <input required type="text" name="password" defaultValue="Mudar123" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }} />
                <p className="text-xs mt-1" style={{ color: "var(--dash-text-secondary)" }}>O vendedor usará esta senha para acessar o painel.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-primary)" }}>Slug (Link do Catálogo)</label>
                <div className="flex items-center">
                  <span className="rounded-l-xl border border-r-0 px-3 py-2 text-sm" style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-hover-bg)", color: "var(--dash-text-secondary)" }}>/p/</span>
                  <input required type="text" name="slug" placeholder="joao-silva" className="w-full rounded-r-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border px-4 py-2 text-sm font-medium" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}>Cancelar</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {loading ? "Criando..." : "Criar Conta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sellerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <h2 className="text-xl font-semibold mb-2 text-red-500">Excluir Vendedor</h2>
            <p className="text-sm mb-6" style={{ color: "var(--dash-text-secondary)" }}>
              Tem certeza que deseja excluir <strong>{sellerToDelete.full_name}</strong>? Esta ação removerá o acesso permanentemente e não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSellerToDelete(null)} disabled={deleteLoading} className="rounded-xl border px-4 py-2 text-sm font-medium" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {deleteLoading ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Password Modal */}
      {sellerToUpdatePwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--dash-text-primary)" }}>Trocar Senha</h2>
            <p className="text-sm mb-4" style={{ color: "var(--dash-text-secondary)" }}>
              Nova senha para <strong>{sellerToUpdatePwd.full_name}</strong>.
            </p>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-6">
                <input required type="text" name="newPassword" minLength={6} placeholder="Nova senha (min. 6 carateres)" className="w-full rounded-xl border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setSellerToUpdatePwd(null)} disabled={updatePwdLoading} className="rounded-xl border px-4 py-2 text-sm font-medium" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}>Cancelar</button>
                <button type="submit" disabled={updatePwdLoading} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {updatePwdLoading ? "Salvando..." : "Salvar Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
