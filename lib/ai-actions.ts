"use server";
 
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAuthenticated } from "@/lib/utils/auth-validation";

/**
 * Função interna para buscar a API Key do Gemini com fallback para o banco de dados.
 */
async function getGeminiApiKey(): Promise<string | null> {
  let apiKey = process.env.GEMINI_API_KEY || null;
  if (!apiKey) {
    try {
      const adminSupabase = createAdminClient();
      const { data } = await adminSupabase
        .from("platform_config")
        .select("value")
        .eq("key", "gemini_api_key")
        .maybeSingle();
      if (data?.value) {
        apiKey = data.value;
      }
    } catch (dbErr) {
      console.warn("[AI-CONFIG-WARN]: Erro ao buscar gemini_api_key do banco:", dbErr);
    }
  }
  return apiKey;
}

/**
 * Função utilitária para extrair e fazer o parse de JSON de forma robusta
 * a partir das respostas do LLM.
 */
function parseLLMJsonResponse(text: string) {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Tenta encontrar o primeiro bloco JSON caso haja texto explicativo envolta
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = cleaned.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }
    throw e;
  }
}

/**
 * Envia a requisição para a API do Gemini com tentativas de reprocessamento em caso de erro 503/500 temporário.
 */
async function fetchGeminiWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 503 && response.status !== 500) {
        return response;
      }
      console.warn(`[GEMINI-RETRY]: Recebido status ${response.status}. Tentando novamente em ${delay}ms... (Tentativa ${i + 1} de ${retries})`);
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return fetch(url, options);
}

/**
 * Função interna para logar o uso de tokens no banco de dados.
 */
async function logAiUsage(actionType: string, usage: any) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Busca o organization_id do perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      organization_id: profile?.organization_id,
      action_type: actionType,
      prompt_tokens: usage?.promptTokenCount || 0,
      completion_tokens: usage?.candidatesTokenCount || 0,
      total_tokens: usage?.totalTokenCount || 0,
      model_name: 'gemini-2.5-flash'
    });
  } catch (error) {
    console.error("[AI-LOG-ERROR]:", error);
  }
}

/**
 * Gera ou melhora a descrição do produto com explicação das mudanças.
 */
export async function enhanceDescriptionWithAI(payload: { 
  name: string; 
  currentDescription?: string; 
  price?: string;
  specs?: { chave: string; valor: string }[];
}) {
  try {
    await verifyAuthenticated();
  } catch (err: any) {
    return { error: err.message || "Não autorizado." };
  }
 
  const apiKey = await getGeminiApiKey();

  if (!apiKey) {
    return { error: "API Key do Gemini não configurada." };
  }

  const specsText = payload.specs?.map(s => `${s.chave}: ${s.valor}`).join(', ') || 'Não informadas';

  const prompt = `
    Aja como um copywriter de alta conversão, focado em vendas diretas e "papo reto".
    Seu objetivo é criar uma descrição impactante, concisa e profissional para o produto: "${payload.name}".
    
    FONTES DE DADOS:
    - Especificações Técnicas: "${specsText}"
    - Descrição atual: "${payload.currentDescription || 'Vazia'}"

    REGRAS CRÍTICAS:
    1. O texto deve ter NO MÁXIMO 10 LINHAS. Seja direto e evite enrolação.
    2. Use as Especificações Técnicas como base para não ser genérico.
    3. Use HTML básico (<b>, <p>, <ul>, <li>).
    4. O tom deve ser "papo reto": direto, honesto e persuasivo.
    5. AO FINAL, inclua 3 hashtags relevantes.
    6. JAMAIS cite o preço do produto no texto. 
    7. NÃO gere títulos ou campos extras.
    8. Se a "Descrição atual" for "Vazia", crie uma descrição totalmente nova, cativante e completa do zero a partir do nome do produto e das especificações técnicas fornecidas.

    RETORNO:
    Retorne APENAS um JSON no formato:
    {
      "proposed": "HTML da nova descrição",
      "explanation": "Uma breve explicação do que foi feito (ex: 'Criei uma descrição comercial focada nas especificações técnicas fornecidas' ou 'Melhorei a legibilidade do texto e foquei na potência')."
    }
  `;

  try {
    const response = await fetchGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) return { error: `Erro na API do Google: status ${response.status}` };

    const data = await response.json();
    
    // Log de uso
    if (data.usageMetadata) {
      await logAiUsage('enhance_description', data.usageMetadata);
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Resposta vazia");

    const parsedData = parseLLMJsonResponse(resultText);
    return { success: true, data: parsedData };

  } catch (error: any) {
    console.error("ERRO ENHANCE:", error);
    return { error: "Falha ao melhorar descrição." };
  }
}

/**
 * Corrige a ortografia de múltiplos campos com explicação.
 */
export async function fixProductOrthography(payload: { name: string; highlight?: string; description: string }) {
  try {
    await verifyAuthenticated();
  } catch (err: any) {
    return { error: err.message || "Não autorizado." };
  }
 
  const apiKey = await getGeminiApiKey();

  if (!apiKey) {
    return { error: "API Key do Gemini não configurada." };
  }

  const prompt = `
    Aja como um revisor profissional. Corrija APENAS erros de ortografia, gramática e pontuação dos seguintes campos.
    
    CAMPOS:
    1. Nome: "${payload.name}"
    2. Destaque: "${payload.highlight || ''}"
    3. Descrição: "${payload.description}"

    REGRAS:
    - O campo "Destaque" deve ser retornado em CAIXA ALTA (UPPERCASE).
    - Mantenha tags HTML na descrição.
    
    RETORNO:
    Retorne APENAS um JSON no formato:
    {
      "name": "Nome corrigido",
      "highlight": "Destaque corrigido",
      "description": "Descrição corrigida",
      "explanation": "Lista breve dos erros encontrados e corrigidos."
    }
  `;

  try {
    const response = await fetchGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) return { error: `Erro na API do Google: status ${response.status}` };

    const data = await response.json();
    
    // Log de uso
    if (data.usageMetadata) {
      await logAiUsage('fix_orthography', data.usageMetadata);
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Resposta vazia");

    const parsedData = parseLLMJsonResponse(resultText);
    return { success: true, data: parsedData };

  } catch (error: any) {
    console.error("ERRO FIX_ALL:", error);
    return { error: "Falha ao corrigir campos." };
  }
}

/**
 * Gera sugestões de SEO (Título e Descrição) usando Google Gemini 1.5 Flash
 */
export async function generateSEOWithAI(
  orgName: string, 
  businessType: string = "comércio",
  businessModel: "B2B" | "B2C" = "B2B"
) {
  try {
    await verifyAuthenticated();
  } catch (err: any) {
    return { error: err.message || "Não autorizado." };
  }
 
  const apiKey = await getGeminiApiKey();
  if (!apiKey) return { error: "API Key do Gemini não configurada." };

  let prompt = "";
  if (businessModel === "B2C") {
    prompt = `
      Aja como um especialista em SEO. Gere o Título (max 60 carac), Descrição (150-160 carac) e Keywords para o portfólio/catálogo pessoal do profissional "${orgName}" do ramo "${businessType}".
      Retorne APENAS um JSON no formato:
      {"title": "...", "description": "...", "keywords": "..."}
    `;
  } else {
    prompt = `
      Aja como um especialista em SEO. Gere o Título (max 60 carac), Descrição (150-160 carac) e Keywords para a empresa "${orgName}" do ramo "${businessType}".
      Retorne APENAS um JSON no formato:
      {"title": "...", "description": "...", "keywords": "..."}
    `;
  }

  try {
    const response = await fetchGeminiWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) return { error: `Google API retornou erro ${response.status}` };

    const data = await response.json();
    
    // Log de uso
    if (data.usageMetadata) {
      await logAiUsage('generate_seo', data.usageMetadata);
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Resposta sem texto do Google");

    const parsedData = parseLLMJsonResponse(resultText);
    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error("ERRO SEO AI:", error);
    return { error: "Erro de conexão com a IA." };
  }
}
