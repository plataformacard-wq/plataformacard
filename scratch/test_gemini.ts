
import { generateSEOWithAI } from './lib/ai-actions';

async function testGemini() {
    console.log("Testing Gemini integration...");
    const result = await generateSEOWithAI("Empresa de Teste", "tecnologia");
    console.log("Result:", JSON.stringify(result, null, 2));
}

testGemini();
