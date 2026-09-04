# 🚨 Documento de Bloqueadores de Lançamento (Go-Live) — Landing Page & Assets Visuais

*Data de Registro:* 25 de julho de 2026  
*Status:* **BLOQUEADOR ATIVO (Go-Live Blocker)**  
*Escopo:* Landing Page Institucional (`app/page.tsx`), CMS Admin (`/main/landing-page`) e Design System.

---

## 📌 Contexto
Para garantir que o lançamento da **PlataformaShop** como SaaS B2B transacional na internet pública (`plataformashop.com.br`) apresente máxima autoridade de marca, credibilidade e taxa de conversão, foram catalogadas as pendências de mídias e assets gráficos essenciais.

Todas as pendências listadas neste documento são classificadas como **BLOQUEADORES DE LANÇAMENTO (GO-LIVE BLOCKERS)** e devem ser sanadas antes do anúncio oficial do produto.

---

## 🎯 Lista Detalhada de Bloqueadores de Assets

| # | Item / Asset | Localização na LP | Especificação Técnica / Resolução | Status |
|---|---|---|---|---|
| **BLK-01** | **Hero Mockup 3D (Tema Escuro)** | `HeroSection.tsx` / CMS Admin | Render 3D 1200x900px WebP com fundo escuro exibindo a vitrine digital e cartão NFC físico. | 🔴 Bloqueado |
| **BLK-02** | **Hero Mockup 3D (Tema Claro)** | `HeroSection.tsx` / CMS Admin | Render 3D 1200x900px WebP com fundo claro exibindo a vitrine em Modo Claro e cartão NFC. | 🔴 Bloqueado |
| **BLK-03** | **Logo Header & Footer (Tema Escuro)** | `Header.tsx` / `Footer.tsx` | PNG/WebP transparente vetorizado da marca PlataformaShop em modo escuro. | 🟡 Em Homologação |
| **BLK-04** | **Logo Header & Footer (Tema Claro)** | `Header.tsx` / `Footer.tsx` | PNG/WebP transparente vetorizado da marca PlataformaShop otimizado para fundos brancos. | 🔴 Bloqueado |
| **BLK-05** | **Ilustração: Taxa Zero nas Vendas** | `#recursos` (Card 1) | Arte gráfica/print do checkout WhatsApp mostrando recebimento Pix com 0% comissão. | 🔴 Bloqueado |
| **BLK-06** | **Ilustração: Sincronização Bling ERP V3** | `#recursos` (Card 2) | Diagrama de fluxo/print da sincronização em tempo real entre Bling V3 e catálogo. | 🔴 Bloqueado |
| **BLK-07** | **Ilustração: Físico & Digital (NFC)** | `#recursos` (Card 3) | Ilustração do toque do cartão NFC físico no smartphone abrindo o catálogo instantaneamente. | 🔴 Bloqueado |
| **BLK-08** | **Ilustração: Embed em Site (iFrame)** | `#recursos` (Card 4) | Mockup de notebook mostrando o catálogo embutido via iFrame responsivo em site de cliente. | 🔴 Bloqueado |
| **BLK-09** | **Logos de Parceiros / Marquee (6+ Marcas)** | `CompanyLogos.tsx` / CMS | Mínimo de 6 marcas reais em PNG vetorizado para ativação do carrossel infinito. | 🔴 Bloqueado |
| **BLK-10** | **Avatares dos Depoentes** | `Testimonials.tsx` / CMS | Fotos/Avatares reais dos lojistas para substituição das badges de iniciais. | 🟡 Opcional / Recomendado |

---

## 🛠️ Matriz de Execução e Resolução

1. **Ferramenta de Geração de Imagens (`generate_image`):**  
   Os mockups 3D e ilustrações da interface podem ser gerados via IA de alta definição ou exportados do Figma.
2. **Gerenciamento via CMS Admin (`http://localhost:3000/main/landing-page`):**  
   Todas as mídias possuem suporte a upload direto com conversão automática em WebP e botões de download integrados.

---

## 🔐 Protocolo Deploy & Homologação
Nenhuma versão final de produção será publicada até que todos os 9 itens bloqueadores sejam atualizados no banco de dados Supabase e o teste TypeScript `npx tsc --noEmit` passe com 0 erros.
