# 🚀 Prompt de Continuidade - Auditoria & Otimização da Landing Page B2B

## 📌 Contexto & Estado do Projeto
Você está assumindo a continuidade da auditoria e otimização de conversão B2B da Landing Page do **PlataformaShop** (`c:\Users\Start\PlataformaShop`).

---

## ✅ Tarefas Concluídas nesta Sessão
1. **Simulador de Link & Funil Topo de Funil (Hero):**
   - URL atualizada para `anotameucontato.com.br/sua-empresa`.
   - Botão **"Reservar Link"** salva o slug no `localStorage` e realiza **scroll suave** para a seção de planos (`#planos`).
2. **Eliminação Total de Menções a "Teste Grátis":**
   - Varredura em 100% dos componentes da LP; todas as menções a "grátis" e "sem cartão" foram substituídas por comunicação B2B focada em planos e ativação imediata.
3. **Copywriting & Seções Otimizadas:**
   - Link de anúncio superior direcionado para a âncora `#como-funciona`.
   - Faixa de parceiros atualizada: *"FAÇA COMO AS EMPRESAS QUE ABANDONARAM OS PDFS E ACELERAM VENDAS COM CATÁLOGO DIGITAL"*.
   - Seção de dores com título formatado em Title Case: *"A PlataformaShop Veio Para Acabar Com:"*.
4. **Carrossel Animado de Métricas Éticas & Controle no CMS:**
   - Componente `WhyChooseUs.tsx` com 3 grupos autênticos (Garantias & Infraestrutura, Fim dos PDFs, Experiência B2B), transição via Framer Motion, pílulas navegáveis e pausa ao passar o mouse.
   - **CARD 4 no CMS** (`/main/landing-page/hero`): Permite ajustar o tempo da rotação (3s a 8s) e alternar para o modo *Métricas Reais da Plataforma* quando atingir a meta de escala.
5. **Mockup 1 Aplicado (Taxa Zero / Pedido no WhatsApp):**
   - Imagem retangular 16:9 aplicada em `/assets/landing-page/recursos/mockup_taxa_zero_whatsapp.png` com enquadramento perfeito `object-contain`.

---

## 🎯 Ponto Exato de Parada (Handover para Continuação)

A próxima sessão deve dar prosseguimento à **geração e aplicação dos mockups retangulares para os blocos restantes de recursos**:

1. **Mockup 2 (Estoque Sincronizado - Bling V3):**
   - Imagem gerada em `public/assets/landing-page/recursos/mockup_estoque_bling_v3.png`.
   - Validar/Gerar formato widescreen 16:9 retangular e aplicar em `app/page.tsx`.
2. **Mockup 3 (Físico e Digital: Cartão NFC + Celular):**
   - Gerar imagem 16:9 da aproximação do Cartão NFC no celular abrindo o catálogo e aplicar em `app/page.tsx`.
3. **Mockup 4 (Incorpore no seu Site - iFrame):**
   - Gerar imagem 16:9 mostrando o catálogo embutido em um site corporativo e aplicar em `app/page.tsx`.

---

## ⚡ Comando de Inicialização para o Próximo Agente
Rode `Protocolo Start` (verificar Git status, dev server na porta 3000 e compilação `npx tsc --noEmit`).
