"use server";

/**
 * Gera sugestões de SEO (Título e Descrição) usando Google Gemini 1.5 Flash
 * Baseado no nome da organização e contexto de produtos.
 */
export async function generateSEOWithAI(orgName: string, businessType: string = "comércio") {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { 
      error: "API Key do Gemini não configurada. Adicione GEMINI_API_KEY ao seu .env.local" 
    };
  }

  console.log(`[AI-DEBUG] Iniciando chamada. Key detectada (tamanho: ${apiKey.length}, começa com: ${apiKey.substring(0, 4)}...)`);

  const prompt = `
    Aja como um especialista em SEO. Gere o Título (max 60 carac), Descrição (150-160 carac) e Keywords para a empresa "${orgName}" do ramo "${businessType}".
    Retorne APENAS um JSON no formato:
    {"title": "...", "description": "...", "keywords": "..."}
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: `Google API retornou erro ${response.status}. Detalhes: ${errorData.error?.message || 'Falha desconhecida'}.` 
      };
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("Resposta sem texto do Google");
    }

    try {
      const cleanedText = resultText.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(cleanedText);
      return { success: true, data: parsedData };
    } catch (parseError) {
      return { error: "A IA retornou um formato inválido. Tente novamente." };
    }

  } catch (error: any) {
    console.error("ERRO FATAL NA CHAMADA IA:", error);
    return { error: `Erro de conexão (${error.name}): ${error.message}.` };
  }
}

/**
 * Gera ou melhora a descrição do produto.
 * Focado apenas no campo de texto da sessão.
 */
export async function enhanceDescriptionWithAI(payload: { name: string; currentDescription?: string; price?: string }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { error: "API Key do Gemini não configurada." };
  }

  const prompt = `
    Aja como um copywriter especializado em e-commerce de luxo.
    Seu objetivo é criar uma descrição irresistível para o produto: "${payload.name}".
    
    Contexto atual:
    - Descrição existente: "${payload.currentDescription || 'Vazia'}"
    - Preço: "${payload.price || 'Não informado'}"

    REGRAS:
    1. Use HTML básico (<b>, <p>, <ul>, <li>) para uma formatação elegante.
    2. Foque nos benefícios e na experiência de uso, não apenas em características.
    3. Se houver descrição atual, use-a como base para expandir e melhorar.
    4. O tom deve ser persuasivo e profissional.
    5. AO FINAL do texto, inclua sempre de 3 a 5 hashtags relevantes (ex: #tecnologia #premium).
    6. NÃO gere títulos, especificações técnicas em formato JSON ou cores. APENAS o texto da descrição.

    Retorne APENAS o HTML da nova descrição.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      return { error: `Erro na API do Google: ${response.status}` };
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Resposta vazia");

    return { success: true, data: resultText.trim() };

  } catch (error: any) {
    console.error("ERRO ENHANCE:", error);
    return { error: "Falha ao melhorar descrição." };
  }
}

/**
 * Corrige apenas a gramática e pontuação de um texto.
 */
export async function correctGrammarWithAI(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { error: "API Key do Gemini não configurada." };
  }

  const prompt = `
    Aja como um revisor profissional de textos para e-commerce.
    Sua tarefa é APENAS corrigir erros de gramática, ortografia e pontuação do texto abaixo.
    Mantenha o significado original, o tom de voz e quaisquer tags HTML presentes.
    NÃO adicione novas informações nem remova detalhes importantes.
    
    TEXTO:
    ${text}
    
    Retorne APENAS o texto corrigido, sem comentários adicionais.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      return { error: `Erro na API do Google: ${response.status}` };
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Resposta vazia");

    return { success: true, data: resultText.trim() };

  } catch (error: any) {
    console.error("ERRO GRAMMAR:", error);
    return { error: "Falha ao corrigir gramática." };
  }
}
