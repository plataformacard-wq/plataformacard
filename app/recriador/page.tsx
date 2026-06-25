"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Upload, Sparkles, Check, ArrowRight, ArrowLeft, 
  Copy, Eye, Code, RefreshCw, AlertTriangle, Key, Loader2, ArrowLeftCircle
} from "lucide-react";

// Mapeamento de ícones para tipos de assets
const iconMap: Record<string, string> = {
  logo: "🏷️",
  foto_produto: "📦",
  foto_pessoa: "👤",
  icone: "⭐",
  ilustracao: "🎨",
  fonte: "🔤",
  texto_editavel: "✏️",
  cor_marca: "🎨",
  elemento_grafico: "◼️",
};

export default function RecriadorPage() {
  const [step, setStep] = useState<number>(1);
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<string>("gemini-2.0-flash");
  const [referenceImage, setReferenceImage] = useState<string>("");
  const [imageMeta, setImageMeta] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [assetValues, setAssetValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega a chave da API do localStorage no início
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value.trim();
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  // Redimensionamento de imagem para otimizar tamanho de payload da API
  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file.type || "image/jpeg");
          setReferenceImage(dataUrl);
          setImageMeta(`${file.name} · ${Math.round((dataUrl.split(",")[1].length * 3) / 4 / 1024)} KB (redimensionada para ${width}x${height}px)`);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const extractJSON = (text: string) => {
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) return fence[1].trim();
    const brace = text.match(/(\{[\s\S]*\})/);
    if (brace) return brace[1].trim();
    return text.trim();
  };

  const callGemini = async (prompt: string, maxTokens: number, systemInstructionText = "") => {
    if (!apiKey.trim()) {
      throw new Error("Por favor, insira sua chave da API do Google no topo da página.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const base64Content = referenceImage.split(",")[1];
    const mimeType = referenceImage.split(";")[0].split(":")[1] || "image/jpeg";

    const parts = [
      { inlineData: { mimeType, data: base64Content } },
      { text: prompt }
    ];

    const body: any = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.1
      }
    };

    if (systemInstructionText) {
      body.systemInstruction = {
        parts: [{ text: systemInstructionText }]
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const rawMsg = err.error?.message || `Erro HTTP ${res.status}`;
      
      const msgLower = rawMsg.toLowerCase();
      if (msgLower.includes("quota exceeded") || msgLower.includes("limit") || res.status === 429) {
        throw new Error("Limite de requisições ou tokens do Gemini atingido. Por favor, aguarde alguns instantes, mude o modelo no topo para 'gemini-1.5-pro' ou verifique seus limites no Google AI Studio.");
      }
      throw new Error(rawMsg);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Resposta vazia da API do Gemini.");
    return text;
  };

  const startAnalysis = async () => {
    setStep(2);
    setIsLoading(true);
    setError("");
    setLoadingMessage("Gemini analisando o criativo de referência...");

    const systemInstruction = `Você é um analista visual sênior e UI designer especialista em criativos para anúncios de redes sociais. Sua tarefa é analisar a imagem enviada com atenção extrema a cada elemento gráfico, tipográfico e de posicionamento espacial, produzindo uma especificação limpa no formato JSON solicitado.`;

    const prompt = `Analise este criativo com atenção aos detalhes. Retorne APENAS um objeto JSON estruturado da seguinte forma, sem qualquer bloco de texto fora dele:

{
  "dimensoes": {"largura": 1080, "altura": 1080, "formato": "quadrado|story|retrato|paisagem"},
  "fundo": {"tipo": "cor_solida|gradiente|imagem|padrao", "cor_principal": "#hex"},
  "paleta": ["#hex1","#hex2","#hex3","#hex4"],
  "elementos_texto": [
    {
      "conteudo": "texto exato como aparece no criativo",
      "papel": "titulo|subtitulo|corpo|cta|tagline|preco|hashtag|legal",
      "fonte_estilo": "sans-serif geometrica|serifada|script|display bold|monospace",
      "cor": "#hex",
      "tamanho_relativo": "muito grande|grande|medio|pequeno|muito pequeno",
      "posicao": "topo|centro|base|esquerda|direita|canto superior esquerdo|etc"
    }
  ],
  "assets_necessarios": [
    {
      "id": "id_unico_sem_espacos",
      "tipo": "logo|foto_produto|foto_pessoa|icone|ilustracao|fonte|texto_editavel|cor_marca|elemento_grafico",
      "descricao": "Descrição clara e específica do que é e onde aparece",
      "obrigatorio": true,
      "pode_aproximar": false,
      "valor_detectado": "texto ou cor hex se detectável, senão string vazia"
    }
  ],
  "layout_descricao": "Descreva em 1-2 frases o layout, hierarquia e composição visual",
  "tom_visual": "moderno|luxo|urgente|jovem|corporativo|minimalista|vibrante|etc"
}

Seja exaustivo nos assets_necessarios: inclua todos os elementos isoláveis essenciais para a composição.`;

    try {
      const raw = await callGemini(prompt, 2048, systemInstruction);
      const parsed = JSON.parse(extractJSON(raw));
      setAnalysisData(parsed);
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || "Erro na análise visual.");
    }
  };

  const generateCreative = async () => {
    setStep(4);
    setIsLoading(true);
    setError("");
    setLoadingMessage("Criando código HTML/CSS no Gemini...");

    const assets = analysisData?.assets_necessarios || [];
    let assetCtx = "";
    assets.forEach((a: any) => {
      const val = assetValues[a.id];
      let display = "";
      
      if (val && val.startsWith("data:image")) {
        display = `[IMAGEM FORNECIDA] O usuário enviou esta imagem. Por favor, coloque exatamente a string "$$${a.id}$$" no atributo src da tag <img> correspondente. Exemplo: <img src="$$${a.id}$$" style="..." />.`;
      } else if (val) {
        display = val;
      } else if (a.valor_detectado) {
        display = a.valor_detectado + " (usar para aproximar)";
      } else {
        display = "não fornecido — aproximar usando CSS ou div com cor de fundo dominante";
      }
      
      assetCtx += `• ${a.descricao} [${a.tipo}] (ID: ${a.id}): ${display}\n`;
    });

    const textos = (analysisData?.elementos_texto || [])
      .map((t: any) => `• "${t.conteudo}" — papel:${t.papel} | estilo/fonte:${t.fonte_estilo} | cor:${t.cor} | tamanho:${t.tamanho_relativo} | posição:${t.posicao||"?"}`)
      .join("\n");

    const dim = analysisData?.dimensoes || { largura: 1080, altura: 1080, formato: "quadrado" };
    const paleta = (analysisData?.paleta || []).join(", ");

    const systemInstruction = `Você é um desenvolvedor front-end sênior especialista em HTML/CSS e design pixel-perfect. Seu papel é escrever um único código HTML autocontido que reproduza com precisão cirúrgica o layout do criativo original fornecido.`;

    const prompt = `Recrie o criativo de rede social da imagem com MÁXIMA fidelidade usando os dados de layout abaixo.

DADOS DA ANÁLISE DO DESIGN ORIGINAL:
• Dimensões: ${dim.largura}×${dim.altura || 1080}px (${dim.formato})
• Fundo: ${analysisData?.fundo?.tipo} — ${analysisData?.fundo?.cor_principal}
• Paleta exata de cores: ${paleta}
• Layout/Hierarquia: ${analysisData?.layout_descricao}
• Tom visual: ${analysisData?.tom_visual}

TEXTOS (reproduza exatamente na mesma posição e com o mesmo estilo):
${textos}

ASSETS FORNECIDOS E INSTRUÇÕES DE INSERÇÃO:
${assetCtx}

REGRAS CRÍTICAS DE PROGRAMAÇÃO:
1. Retorne APENAS o código HTML completo (da tag <!DOCTYPE html> até </html>), sem qualquer bloco markdown de código ou textos de explicação adicionais.
2. O container principal deve ter exatamente "width: ${dim.largura}px" e "height: ${dim.altura || 1080}px", com "position: relative", "overflow: hidden" e cores condizentes com o fundo original.
3. Use posicionamento absoluto ("position: absolute") para cada elemento de forma que reproduza exatamente o layout original. Utilize porcentagens ou pixels com base no tamanho total (${dim.largura}x${dim.altura || 1080}px).
4. Utilize as cores exatas da paleta fornecida.
5. Importe as fontes correspondentes usando "@import" do Google Fonts no topo da tag <style>.
6. Se uma imagem de asset (Ex: ID "logo_marca") foi marcada como [IMAGEM FORNECIDA], coloque EXATAMENTE a string "$$logo_marca$$" no atributo src da tag <img>. Exemplo: <img src="$$logo_marca$$" style="..." />.
7. Para assets de imagem ausentes (não fornecidos), monte uma <div> com cor de fundo dominante, texto de identificação centralizado e bordas adequadas para agir como placeholder.
8. Sem dependências, frameworks (como Tailwind ou Bootstrap) ou scripts adicionais. Apenas CSS puro estruturado.
9. Não escreva comentários em parte alguma do código.`;

    try {
      const raw = await callGemini(prompt, 4096, systemInstruction);
      let html = raw.replace(/^```html\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();

      // Hot-swapping de imagens: Substitui as marcações especiais pelos Base64 reais inseridos pelo usuário
      assets.forEach((a: any) => {
        const val = assetValues[a.id];
        if (val) {
          html = html.replaceAll(`$$${a.id}$$`, val);
        }
      });

      setGeneratedHtml(html);
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || "Erro na geração do criativo.");
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Determina a largura/proporção máxima do container da prévia
  const getPreviewStyles = () => {
    const dim = analysisData?.dimensoes || { largura: 1080, altura: 1080 };
    return {
      aspectRatio: `${dim.largura} / ${dim.altura}`,
      maxWidth: `${dim.largura}px`,
    };
  };

  const renderAssetForm = () => {
    const assets = analysisData?.assets_necessarios || [];
    if (assets.length === 0) {
      return (
        <p className="text-xs text-slate-400">
          Nenhum asset externo foi identificado. Você pode gerar o criativo diretamente.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {assets.map((asset: any) => {
          const isTextual = ["texto_editavel", "cor_marca", "fonte"].includes(asset.tipo);
          return (
            <div key={asset.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-3 border-b border-slate-800 last:border-b-0">
              <div className="flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">{iconMap[asset.tipo] || "📄"}</span>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{asset.descricao}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {asset.obrigatorio ? (
                      <span className="text-[9px] font-medium bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/10">obrigatório</span>
                    ) : (
                      <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">opcional</span>
                    )}
                    {asset.pode_aproximar && (
                      <span className="text-[9px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">pode aproximar</span>
                    )}
                    <span className="text-[9px] font-medium bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/10">{asset.tipo}</span>
                  </div>
                  {asset.valor_detectado && (
                    <div className="text-[10px] text-slate-500 mt-1">Detectado no original: "{asset.valor_detectado}"</div>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                {isTextual ? (
                  <input
                    type="text"
                    className="w-full sm:w-44 text-xs px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-100 focus:border-emerald-500 outline-none transition-all"
                    placeholder={asset.valor_detectado || "Digitar..."}
                    value={assetValues[asset.id] || ""}
                    onChange={(e) => {
                      setAssetValues({ ...assetValues, [asset.id]: e.target.value });
                    }}
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*,.ttf,.otf,.woff"
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setAssetValues({ ...assetValues, [asset.id]: ev.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                )}
                {assetValues[asset.id] && (
                  <span className="text-[9px] text-emerald-400 font-semibold mt-1">
                    {isTextual ? "✓ preenchido" : "✓ arquivo carregado"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Navbar superior */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors mr-2">
            <ArrowLeftCircle className="w-6 h-6" />
          </Link>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-lg">
            P
          </div>
          <div>
            <h1 className="text-md font-bold flex items-center gap-2">
              Plataforma<span className="text-emerald-400">Card</span> 
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Agente de Criativos
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          Powered by <span className="font-semibold text-emerald-400">Google Gemini</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        
        {/* Barra de Configurações da API */}
        <section className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Google AI API Key
              </label>
              <input
                type="password"
                placeholder="Insira sua chave AIza..."
                value={apiKey}
                onChange={handleApiKeyChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Modelo AI
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="gemini-2.0-flash">gemini-2.0-flash (recomendado)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (mais recente)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (completo)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
            <span>Sua chave é armazenada de forma segura apenas localmente no seu navegador.</span>
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline hover:text-emerald-300"
            >
              Obter chave grátis →
            </a>
          </div>
        </section>

        {/* Indicador de progresso das etapas */}
        <nav className="flex border border-slate-800 rounded-xl overflow-hidden mb-6 bg-slate-950/20">
          {[
            { id: 1, label: "1 · Imagem" },
            { id: 2, label: "2 · Análise" },
            { id: 3, label: "3 · Assets" },
            { id: 4, label: "4 · Criativo" }
          ].map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div 
                key={s.id} 
                className={`flex-1 text-center text-xs py-3.5 transition-all ${
                  isActive 
                    ? "bg-emerald-500 text-slate-900 font-bold" 
                    : isDone 
                      ? "bg-emerald-950/20 text-emerald-400 font-medium" 
                      : "text-slate-500"
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </nav>

        {/* LOADING STATE CARD */}
        {isLoading && (
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-200">{loadingMessage}</p>
            <p className="text-xs text-slate-500 mt-2">Isso pode levar alguns segundos, por favor aguarde...</p>
          </div>
        )}

        {/* ERROR STATE CARD */}
        {!isLoading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-200">Ocorreu um erro</h4>
                <p className="text-xs text-red-400/90 mt-1 leading-relaxed">{error}</p>
                <button 
                  onClick={() => {
                    setError("");
                    if (step === 2) startAnalysis();
                    if (step === 4) generateCreative();
                  }}
                  className="mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3.5 py-1.5 rounded-md font-medium transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: CARREGAR IMAGEM */}
        {!isLoading && !error && step === 1 && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Criativo de referência
              </div>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? "border-emerald-500 bg-emerald-500/5" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-900/20"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Upload className="w-10 h-10 mx-auto text-slate-500 mb-3" />
                <p className="text-sm text-slate-300 font-medium">Clique ou arraste a imagem do criativo aqui</p>
                <p className="text-xs text-slate-500 mt-1.5">Suporta JPG, PNG ou WEBP</p>
              </div>

              {referenceImage && (
                <div className="mt-6 border-t border-slate-800 pt-6">
                  <img 
                    src={referenceImage} 
                    alt="Original" 
                    className="max-h-72 object-contain mx-auto rounded-lg border border-slate-800 bg-slate-950/40 shadow-inner"
                  />
                  <div className="text-xs text-slate-400 text-center mt-3 font-mono">{imageMeta}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={startAnalysis}
                disabled={!referenceImage}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                Analisar criativo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ANÁLISE VISUAL */}
        {!isLoading && !error && step === 2 && analysisData && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Resultado da Análise Visual
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dimensões Detectadas</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {analysisData.dimensoes?.largura || "?"} × {analysisData.dimensoes?.altura || "?"} px 
                    <span className="text-slate-400 text-xs font-normal ml-1.5">({analysisData.dimensoes?.formato})</span>
                  </span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tom Visual</span>
                  <span className="text-sm font-semibold text-slate-200 capitalize">
                    {analysisData.tom_visual || "—"}
                  </span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Composição e Layout</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {analysisData.layout_descricao || "—"}
                  </p>
                </div>
              </div>

              {/* Cores detectadas */}
              <div className="mt-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Paleta de Cores Identificada
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  {(analysisData.paleta || []).map((hex: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 px-2 py-1.5 rounded-lg">
                      <div className="w-6 h-6 rounded border border-slate-800 shrink-0" style={{ backgroundColor: hex }} />
                      <span className="text-xs font-mono text-slate-300 uppercase">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Textos detectados */}
              <div className="mt-6 border-t border-slate-800 pt-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Elementos de Texto
                </div>
                <div className="space-y-2.5">
                  {(analysisData.elementos_texto || []).map((t: any, i: number) => (
                    <div key={i} className="bg-slate-900/20 border border-slate-800/80 p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="text-xs font-semibold text-slate-100">"{t.conteudo}"</div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-medium bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/10">
                          {t.papel}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                          {t.tamanho_relativo}
                        </span>
                        {t.posicao && (
                          <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                            {t.posicao}
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-medium text-slate-300 ml-auto" style={{ color: t.cor }}>
                          {t.cor}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          · {t.fonte_estilo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Alterar Imagem
              </button>
              
              <button
                onClick={() => {
                  setStep(3);
                  // Inicializa os assetValues vazios
                  const initial: Record<string, string> = {};
                  (analysisData?.assets_necessarios || []).forEach((a: any) => {
                    initial[a.id] = "";
                  });
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                Configurar Assets
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ASSETS DO CRIATIVO */}
        {!isLoading && !error && step === 3 && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Especificar Assets Necessários
              </div>
              
              {renderAssetForm()}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à análise
              </button>

              <button
                onClick={generateCreative}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                Gerar Criativo HTML
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PREVIEW E CÓDIGO GERADO */}
        {!isLoading && !error && step === 4 && generatedHtml && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5">
              
              {/* Botões de Ação Superior */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "preview" 
                        ? "bg-slate-800 text-slate-100 shadow" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Prévia
                  </button>
                  <button
                    onClick={() => setActiveTab("code")}
                    className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "code" 
                        ? "bg-slate-800 text-slate-100 shadow" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Código HTML
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyCodeToClipboard}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? "Copiado!" : "Copiar HTML"}
                  </button>
                  
                  <button
                    onClick={generateCreative}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
                    title="Regerar criativo"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regerar
                  </button>
                </div>
              </div>

              {/* Aba de Prévia (Aspect Ratio controlado e centralizado) */}
              {activeTab === "preview" && (
                <div className="py-2">
                  <div 
                    className="preview-frame-wrap border border-slate-800 rounded-lg overflow-hidden bg-white shadow-xl max-w-full mx-auto relative"
                    style={getPreviewStyles()}
                  >
                    <iframe
                      srcDoc={generatedHtml}
                      className="absolute inset-0 w-full h-full border-0"
                      title="Criativo Gerado"
                    />
                  </div>
                </div>
              )}

              {/* Aba do Código-Fonte */}
              {activeTab === "code" && (
                <div>
                  <textarea
                    value={generatedHtml}
                    readOnly
                    className="w-full min-h-[420px] font-mono text-xs p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-slate-700 resize-y"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Ajustar Assets
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
