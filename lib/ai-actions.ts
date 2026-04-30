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

  const prompt = `
    Aja como um especialista em SEO. Gere o Título (max 60 carac), Descrição (150-160 carac) e Keywords para a empresa "${orgName}" do ramo "${businessType}".
    Retorne APENAS um JSON no formato:
    {"title": "...", "description": "...", "keywords": "..."}
  `;

  try {
    console.log("Iniciando chamada ao Gemini v1beta...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("RESPOSTA HTTP NÃO OK:", response.status, JSON.stringify(errorData, null, 2));
      return { error: `Google API retornou erro ${response.status}: ${errorData.error?.message || 'Falha desconhecida'}` };
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      console.error("RESPOSTA SEM TEXTO:", JSON.stringify(data, null, 2));
      throw new Error("Resposta sem texto do Google");
    }

    try {
      const parsedData = JSON.parse(resultText);
      return { success: true, data: parsedData };
    } catch (parseError) {
      console.error("ERRO AO PARSEAR JSON DA IA:", resultText);
      return { error: "A IA retornou um formato inválido. Tente novamente." };
    }

  } catch (error: any) {
    console.error("ERRO FATAL NA CHAMADA IA:", error);
    // Se for um erro de rede/conexão, pode ser o 'fetch failed' que o usuário relatou
    return { error: `Erro de conexão (${error.name}): ${error.message}. Verifique se o servidor tem acesso à API do Google.` };
  }
}
