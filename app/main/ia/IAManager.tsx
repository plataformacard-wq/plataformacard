"use client";

import { useState } from "react";
import { 
  Save, 
  CheckCircle2, 
  Settings, 
  MessageSquare, 
  Search
} from "lucide-react";
import { updateSystemConfig } from "@/lib/admin-actions";

interface IAManagerProps {
  configs: Record<string, string>;
}

export default function IAManager({ configs }: IAManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [aiModel, setAiModel] = useState(configs.ai_model || "gpt-4o-mini");
  const [aiTemperature, setAiTemperature] = useState(configs.ai_temperature || "0.7");
  const [descriptionPrompt, setDescriptionPrompt] = useState(configs.ai_description_prompt || "");
  const [seoPrompt, setSeoPrompt] = useState(configs.ai_seo_prompt || "");

  async function handleSave(key: string, value: string) {
    setLoading(key);
    setMessage("");
    const result = await updateSystemConfig(key, value);
    if (result.success) {
      setMessage("Configuração atualizada!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Erro ao atualizar!");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {message && (
        <div className="p-4 rounded-xl flex items-center gap-3 animate-in fade-in bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{message}</span>
        </div>
      )}

      {/* Model & Temp */}
      <div className="rounded-2xl border p-6 transition-all shadow-sm" style={{ backgroundColor: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Settings size={20} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Motor da IA</h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Selecione o modelo LLM e a criatividade (temperatura).</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>Modelo</label>
            <div className="flex gap-2">
              <select 
                value={aiModel} 
                onChange={e => setAiModel(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border text-sm focus:border-blue-500/50 outline-none"
                style={{ backgroundColor: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Mais rápido/barato)</option>
                <option value="gpt-4o">GPT-4o (Mais inteligente)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
              <button 
                onClick={() => handleSave("ai_model", aiModel)}
                disabled={loading === "ai_model" || aiModel === configs.ai_model}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              >
                {loading === "ai_model" ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Salvar"}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider flex justify-between" style={{ color: "var(--dash-text-secondary)" }}>
              <span>Temperatura: {aiTemperature}</span>
              <span className="text-[10px] opacity-70">0 (Focado) - 1 (Criativo)</span>
            </label>
            <div className="flex gap-2 items-center h-[46px]">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={aiTemperature} 
                onChange={e => setAiTemperature(e.target.value)}
                className="flex-1 accent-blue-500"
              />
              <button 
                onClick={() => handleSave("ai_temperature", aiTemperature)}
                disabled={loading === "ai_temperature" || aiTemperature === configs.ai_temperature}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              >
                {loading === "ai_temperature" ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description Prompt */}
      <div className="rounded-2xl border p-6 transition-all shadow-sm" style={{ backgroundColor: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <MessageSquare size={20} className="text-emerald-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Prompt de Descrição de Produto</h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Instrução do sistema para gerar a descrição persuasiva dos produtos.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={descriptionPrompt}
            onChange={(e) => setDescriptionPrompt(e.target.value)}
            className="w-full h-64 p-4 rounded-xl border text-sm font-mono focus:border-emerald-500/50 outline-none resize-y"
            placeholder="Você é um especialista em vendas e copywriting..."
            style={{ backgroundColor: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
          <div className="flex justify-end">
            <button 
              onClick={() => handleSave("ai_description_prompt", descriptionPrompt)}
              disabled={loading === "ai_description_prompt" || descriptionPrompt === configs.ai_description_prompt}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {loading === "ai_description_prompt" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Salvar Prompt</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SEO Prompt */}
      <div className="rounded-2xl border p-6 transition-all shadow-sm" style={{ backgroundColor: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Search size={20} className="text-purple-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Prompt de SEO</h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Instrução do sistema para otimização de metadados e palavras-chave.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={seoPrompt}
            onChange={(e) => setSeoPrompt(e.target.value)}
            className="w-full h-64 p-4 rounded-xl border text-sm font-mono focus:border-purple-500/50 outline-none resize-y"
            placeholder="Você é um especialista em SEO. Gere uma meta description e keywords..."
            style={{ backgroundColor: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
          <div className="flex justify-end">
            <button 
              onClick={() => handleSave("ai_seo_prompt", seoPrompt)}
              disabled={loading === "ai_seo_prompt" || seoPrompt === configs.ai_seo_prompt}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {loading === "ai_seo_prompt" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Salvar Prompt</>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
