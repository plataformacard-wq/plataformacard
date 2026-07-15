import { ShieldCheck, CheckSquare, Square } from "lucide-react";
import { motion } from "framer-motion";
import { GranularPermissions } from "@/lib/dashboard/sellerActions";
import { useState, useEffect } from "react";

type ModuleType = "catalog" | "analytics" | "company" | "profile";

interface Props {
  sellerName: string;
  module: ModuleType;
  initialPermissions?: GranularPermissions | null;
  onClose: () => void;
  onSave: (newPermissions: GranularPermissions) => void;
  isSaving: boolean;
}

const MODULE_TITLES = {
  catalog: "Permissões de Catálogo",
  analytics: "Permissões de Analytics",
  company: "Permissões de Empresa",
  profile: "Permissões do Próprio Cadastro"
};

const MODULE_OPTIONS = {
  catalog: [
    { key: "create", label: "Adicionar Novos Produtos" },
    { key: "edit", label: "Editar Produtos Existentes" },
    { key: "delete", label: "Excluir Produtos" },
    { key: "bulk", label: "Importação em Massa" },
    { key: "settings_general", label: "Configurações Gerais e Textos" },
    { key: "settings_behavior", label: "Comportamento da Vitrine (Ocultar Preços, etc)" },
    { key: "settings_banners", label: "Gerenciamento de Banners" },
    { key: "settings_status", label: "Status e Integração (Ligar/Desligar)" },
  ],
  analytics: [
    { key: "general", label: "Ver Métricas Gerais (Acessos, Cliques)" },
    { key: "financial", label: "Ver Métricas Financeiras (Faturamento)" },
  ],
  company: [
    { key: "hours", label: "Editar Horários de Funcionamento" },
    { key: "seo", label: "Editar SEO" },
    { key: "domain", label: "Configurar Domínio" },
  ],
  profile: [
    { key: "basic_info", label: "Edição de Dados Básicos (Nome, Contato)" },
    { key: "avatar", label: "Edição de Foto de Perfil (Avatar)" },
    { key: "password", label: "Alteração de Senha" },
    { key: "messages_when_closed", label: "Configurar Recebimento de Mensagens Fechado" },
    { key: "redirect_leads", label: "Configurar Redirecionamento de Clientes (Leads)" },
    { key: "recess", label: "Programar Recesso Temporário" },
  ]
};

export default function GranularPermissionsModal({ sellerName, module, initialPermissions, onClose, onSave, isSaving }: Props) {
  const [localPermissions, setLocalPermissions] = useState<GranularPermissions>({});

  useEffect(() => {
    if (initialPermissions) {
      setLocalPermissions(initialPermissions);
    }
  }, [initialPermissions]);

  const handleToggle = (key: string) => {
    setLocalPermissions(prev => {
      const moduleData = prev[module] || {};
      return {
        ...prev,
        [module]: {
          ...moduleData,
          [key]: !moduleData[key as keyof typeof moduleData]
        }
      };
    });
  };

  const currentModuleData = localPermissions[module] || {};
  const options = MODULE_OPTIONS[module];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[32px] p-8 shadow-2xl border"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>{MODULE_TITLES[module]}</h2>
            <p className="text-xs" style={{ color: "var(--dash-text-secondary)" }}>Para {sellerName}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {options.map((opt) => {
            const isChecked = currentModuleData[opt.key as keyof typeof currentModuleData] === true;
            return (
              <button
                key={opt.key}
                onClick={() => handleToggle(opt.key)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors hover:bg-[var(--dash-hover-bg)]"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <div className={isChecked ? "text-primary" : "text-[var(--dash-text-muted)]"}>
                  {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border transition-colors hover:bg-[var(--dash-hover-bg)]"
            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(localPermissions)}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-zinc-900 dark:bg-white px-4 py-3 text-sm font-bold text-white dark:text-black transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Salvar Permissões"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
