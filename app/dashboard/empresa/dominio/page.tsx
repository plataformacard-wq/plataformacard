"use client";

import { useState, useEffect } from "react";
import { Globe, AlertTriangle, CheckCircle2, Loader2, Copy, ArrowRight, Trash2, Info, RefreshCw, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { getOrganizationDomain, addCustomDomain, removeCustomDomain, checkVercelDomainStatus } from "@/app/actions/domain";
import { checkNativeDNS } from "@/app/actions/dns";
import { VercelDomainResponse } from "@/lib/vercel/domains";

export default function DominioPage() {
  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [domainStatus, setDomainStatus] = useState<VercelDomainResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [nativeStatus, setNativeStatus] = useState<Record<string, boolean | "loading">>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (domainStatus?.createdAt && !domainStatus?.verified) {
      const updateElapsed = () => {
        const diff = Date.now() - domainStatus.createdAt!;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        
        if (hours > 0) {
          setElapsedTime(`${hours} horas e ${remainingMins} minutos`);
        } else {
          setElapsedTime(`${mins} minutos`);
        }
      };
      
      updateElapsed();
      const interval = setInterval(updateElapsed, 60000);
      return () => clearInterval(interval);
    }
  }, [domainStatus]);

  useEffect(() => {
    if (domainStatus?.verification && !domainStatus.verified) {
      const checkRecords = async () => {
        let hasChanges = false;
        
        // Copiamos o estado anterior para não perdermos as flags
        setNativeStatus(prev => {
          const newStatus = { ...prev };
          domainStatus.verification!.forEach((v, idx) => {
            if (newStatus[`host-${idx}`] !== true) {
              newStatus[`host-${idx}`] = "loading";
            }
          });
          return newStatus;
        });

        for (const [idx, v] of domainStatus.verification!.entries()) {
          const key = `host-${idx}`;
          // Só verificar se não estiver verde
          setNativeStatus(prev => {
            if (prev[key] === true) return prev;
            return prev;
          });
          
          const res = await checkNativeDNS(v.domain, v.type, v.value);
          
          setNativeStatus(prev => ({
            ...prev,
            [key]: res.success
          }));
        }
      };

      // Executa de imediato
      checkRecords();
      
      // E a cada 30 segundos
      const interval = setInterval(checkRecords, 30000);
      return () => clearInterval(interval);
    }
  }, [domainStatus]);

  async function loadData() {
    setLoading(true);
    try {
      const storedDomain = await getOrganizationDomain();
      setCurrentDomain(storedDomain);
      
      if (storedDomain) {
        const status = await checkVercelDomainStatus(storedDomain);
        setDomainStatus(status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDomain() {
    setError("");
    setActionLoading(true);
    const res = await addCustomDomain(domain);
    
    if (res.error) {
      setError(res.error);
      setActionLoading(false);
      return;
    }

    setDomain("");
    await loadData();
    setIsConfigOpen(true); // Abre a gaveta logo após vincular
    setActionLoading(false);
  }

  async function handleRemoveDomain() {
    if (!currentDomain) return;
    if (!confirm(`Tem certeza que deseja remover o domínio ${currentDomain}?`)) return;

    setActionLoading(true);
    const res = await removeCustomDomain(currentDomain);
    
    if (res.error) {
      setError(res.error);
      setActionLoading(false);
      return;
    }

    setCurrentDomain(null);
    setDomainStatus(null);
    setActionLoading(false);
  }

  function handleCopy(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--dash-text-primary)]">Configurar Domínio</h1>
        <p className="text-sm text-[var(--dash-text-secondary)]">
          Use seu próprio domínio (ex: meucatalogo.com.br) para dar mais credibilidade ao seu negócio.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!currentDomain ? (
        <div className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--dash-text-primary)]">Adicionar Domínio</h2>
              <p className="text-sm text-[var(--dash-text-secondary)]">Insira o domínio que você já registrou.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="ex: minhaloja.com.br"
              className="flex-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] px-4 py-3 text-sm text-[var(--dash-text-primary)] outline-none transition focus:border-primary"
              disabled={actionLoading}
            />
            <button
              onClick={handleAddDomain}
              disabled={actionLoading || !domain}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vincular"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Caixa de Status e Ações */}
          <div className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--dash-text-primary)]">{currentDomain}</h2>
                <div className="mt-3 flex items-center gap-2">
                  {domainStatus?.verified ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Ativo e Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-500">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>Status do processo de propagação de domínio - <strong>{elapsedTime || "0 minutos"} das 24 horas</strong> previstas</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                {!domainStatus?.verified && (
                  <button onClick={loadData} disabled={loading} className="w-full sm:w-auto rounded-xl bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] px-4 py-2.5 text-sm font-semibold text-[var(--dash-text-primary)] hover:bg-[var(--dash-border)] transition flex items-center justify-center gap-2 shadow-sm">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Verificar propagação do Domínio
                  </button>
                )}
                <button
                  onClick={handleRemoveDomain}
                  disabled={actionLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 rounded-xl"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remover
                </button>
              </div>
            </div>
          </div>

          {/* Configuração DNS */}
          {!domainStatus?.verified && domainStatus?.verification && domainStatus.verification.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] shadow-xl overflow-hidden">
                <button 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--dash-hover-bg)] transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[var(--dash-text-primary)]">Configuração DNS</h3>
                  <p className="mt-1 text-sm text-[var(--dash-text-secondary)]">
                    Copie os códigos abaixo e cole no painel do seu provedor de domínio.
                  </p>
                </div>
                {isConfigOpen ? (
                  <ChevronUp className="h-5 w-5 text-[var(--dash-text-secondary)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--dash-text-secondary)]" />
                )}
              </button>

              {isConfigOpen && (
                <div className="px-6 pb-6 border-t border-[var(--dash-border)] pt-6">
                  {/* Banner de Aviso 24h */}
              <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Atenção ao tempo de propagação</h4>
                  <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-500/90">
                    Após configurar o DNS no seu provedor (Registro.br, GoDaddy, etc), pode levar <strong>até 24 horas</strong> para que as configurações entrem em vigor na internet. Caso já tenha colado, basta aguardar.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {domainStatus.verification.map((v, idx) => {
                  // A Vercel retorna o host completo (ex: _vercel.dominio.com.br)
                  // Mas os provedores (Registro.br) esperam apenas o prefixo (_vercel) ou @ para a raiz.
                  let displayHost = v.domain;
                  if (currentDomain && displayHost.endsWith(`.${currentDomain}`)) {
                    displayHost = displayHost.replace(`.${currentDomain}`, "");
                  } else if (currentDomain && displayHost === currentDomain) {
                    displayHost = "@";
                  }

                  return (
                    <div key={idx} className="relative rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 shadow-sm">
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        {nativeStatus[`host-${idx}`] === "loading" && <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Testando DNS...</span>}
                        {nativeStatus[`host-${idx}`] === true && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Propagado</span>}
                        {nativeStatus[`host-${idx}`] === false && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Pendente</span>}
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded bg-[var(--dash-border)] px-2 py-0.5 text-xs font-mono font-bold text-[var(--dash-text-primary)]">
                          Tipo: {v.type}
                        </span>
                      </div>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">Nome / Host</span>
                          <div className="mt-1 flex items-center justify-between rounded-lg bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] px-3 py-2">
                            <code className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{displayHost}</code>
                            <button onClick={() => handleCopy(displayHost, `host-${idx}`)} className="text-[var(--dash-text-secondary)] hover:text-primary">
                              {copied === `host-${idx}` ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">Valor / Destino</span>
                          <div className="mt-1 flex items-center justify-between rounded-lg bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] px-3 py-2">
                            <code className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[200px] sm:max-w-[150px] md:max-w-[200px]" title={v.value}>{v.value}</code>
                            <button onClick={() => handleCopy(v.value, `val-${idx}`)} className="text-[var(--dash-text-secondary)] hover:text-primary">
                              {copied === `val-${idx}` ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tutorial / Guia Passo a Passo */}
        <div className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] p-6 shadow-xl">
          <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--dash-text-primary)]">Como configurar passo a passo?</h4>
                    <ol className="mt-3 ml-4 list-decimal space-y-2 text-sm text-[var(--dash-text-secondary)]">
                      <li>Acesse o painel da empresa onde você comprou este domínio (ex: Registro.br, HostGator, GoDaddy).</li>
                      <li>Procure pelo menu de <strong>"Zonas de DNS"</strong>, "Configurar DNS" ou "Editar Zona".</li>
                      <li>Clique no botão para <strong>"Adicionar Novo Registro"</strong> (ou "Novo Apontamento").</li>
                      <li>Preencha o formulário do seu provedor com os dados exatos da caixinha acima:
                        <ul className="mt-1.5 ml-4 list-disc space-y-1">
                          <li>O <strong>Tipo</strong> deve ser igual ao indicado (TXT, CNAME ou A).</li>
                          <li>Cole o <strong>Nome / Host</strong> no campo correspondente (em alguns provedores chama-se "Entrada").</li>
                          <li>Cole o <strong>Valor / Destino</strong> no campo correspondente.</li>
                        </ul>
                      </li>
                      <li>Salve as alterações lá no seu provedor. A internet pode demorar de 5 minutos a algumas horas para propagar a informação. Assim que propagar, o status nesta tela mudará para <span className="text-emerald-600 dark:text-emerald-400 font-semibold">"Ativo e Verificado"</span>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
