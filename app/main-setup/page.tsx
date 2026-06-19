"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bootstrapMainAdmin } from "./actions";

export default function MainSetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await bootstrapMainAdmin(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/main-login");
        }, 2000);
      }
    } catch (err) {
      setError("Erro inesperado ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>

        <div className="mb-8">
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-500 rounded-lg flex items-center justify-center mb-4 border border-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Main Admin Setup</h1>
          <p className="text-zinc-400 text-sm mt-2">Inicialização do Sistema e Cadastro do Proprietário</p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium">Setup Concluído</h3>
              <p className="text-sm opacity-80 mt-1">Sua conta de Main Admin foi criada com sucesso. Redirecionando para o login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Chave Secreta de Setup</label>
              <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50">
                <input 
                  type={showSecret ? "text" : "password"} 
                  name="secret"
                  required
                  className="w-full bg-transparent px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((prev) => !prev)}
                  className="px-4 text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
                >
                  {showSecret ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800/50 my-4"></div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
              <input 
                type="text" 
                name="fullName"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                placeholder="Seu Nome"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">E-mail Oficial</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                placeholder="admin@suaempresa.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Senha Forte</label>
              <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  className="w-full bg-transparent px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="px-4 text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Inicializar Sistema"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
