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
    console.log("Iniciando chamada ao Gemini v1...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        // Adicionando um sinal de aborto/timeout se necessário no futuro
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("RESPOSTA HTTP NÃO OK:", response.status, errorData);
      return { error: `Google API retornou erro ${response.status}: ${errorData.error?.message || 'Falha desconhecida'}` };
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) throw new Error("Resposta sem texto do Google");

    // Tenta limpar o texto caso a IA tenha colocado crases de markdown
    const jsonStr = resultText.replace(/```json|```/g, "").trim();
    return { success: true, data: JSON.parse(jsonStr) };

  } catch (error: any) {
    console.error("ERRO FATAL NA CHAMADA IA:", error);
    return { error: `Erro de conexão: ${error.message}. Verifique sua internet ou se o Google está acessível.` };
  }
}
