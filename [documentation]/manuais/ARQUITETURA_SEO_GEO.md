# 🌐 Arquitetura de SEO & GEO (Generative Engine Optimization)

Este documento descreve a arquitetura técnica de **SEO (Search Engine Optimization)** e **GEO (Generative Engine Optimization)** implementada na **PlataformaShop**, projetada para garantir máxima indexação nos motores de busca tradicionais (**Google**, **Bing**) e citação/recomendação ativa por **Modelos de Inteligência Artificial** (**ChatGPT**, **Perplexity AI**, **Claude**, **Gemini / Google SGE** e **Apple Intelligence**).

---

## 📌 1. Visão Geral da Arquitetura

```
                         ┌────────────────────────────────────────────────┐
                         │   PlataformaShop (Next.js 15 App Router)       │
                         └───────────────────────┬────────────────────────┘
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
┌───────────────────────┐            ┌───────────────────────┐            ┌───────────────────────┐
│     SEO Tradicional   │            │   GEO (IA Search)     │            │    CMS Dinâmico      │
├───────────────────────┤            ├───────────────────────┤            ├───────────────────────┤
│ • MetadataBase        │            │ • Schema JSON-LD      │            │ • Meta Title          │
│ • OpenGraph & Twitter │            │   - SoftwareApp       │            │ • Headline & Subtítulo│
│ • Sitemap XML         │            │   - Organization      │            │ • FAQ Dinâmico        │
│ • Canonical URLs      │            │   - FAQPage           │            │ • Social SameAs       │
│ • HTML lang="pt-BR"   │            │ • robots.ts (AI Bots) │            │ • Redes & Suporte     │
└───────────────────────┘            └───────────────────────┘            └───────────────────────┘
```

---

## 🤖 2. O que é GEO (Generative Engine Optimization)?

Enquanto o **SEO tradicional** otimiza o código para algoritmos baseados em backlinks e palavras-chave (Google/Bing), o **GEO** otimiza o código para **Modelos de Linguagem (LLMs)**.

Para que uma Inteligência Artificial recomende o seu software ao ser questionada por um usuário (*"Qual a melhor plataforma de catálogo digital B2B e cartão NFC no Brasil?"*), ela precisa de:
1. **Dados Estruturados Ontológicos (Schema.org / JSON-LD):** Definição matemática do que é o software, recursos, plano de preços e empresa.
2. **Autorização Expressa em `robots.txt`:** Liberação de rastreamento para robôs de IA (ex: `GPTBot`, `PerplexityBot`).
3. **Canais de Contato e Prova Social (`sameAs`):** Conexão da marca com perfis em redes sociais e e-mails de suporte.

---

## 🛠️ 3. Componentes da Arquitetura

### A. Rastreamento e Bots de IA (`app/robots.ts`)
O arquivo `app/robots.ts` define as regras de acesso para o robô tradicional e autoriza expressamente os bots de IA:

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plataforma.shop';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/main/', '/admin/', '/onboarding/', '/api/'],
      },
      {
        userAgent: [
          'GPTBot',             // OpenAI / ChatGPT
          'ChatGPT-User',       // Navegação em tempo real do ChatGPT
          'PerplexityBot',      // Perplexity AI
          'ClaudeBot',          // Anthropic / Claude
          'anthropic-ai',
          'Google-Extended',    // Google Gemini / SGE
          'Bytespider',         // TikTok / ByteDance AI
          'Applebot-Extended'   // Apple Intelligence
        ],
        allow: '/',
        disallow: ['/dashboard/', '/main/', '/admin/', '/onboarding/', '/api/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

### B. Schemas JSON-LD Ontológicos (`app/page.tsx`)
Injetados dinamicamente via `<script type="application/ld+json">` na página principal:

1. **`SoftwareApplication`:** Explica à IA que a PlataformaShop é um software de negócios B2B (`BusinessApplication`), suportado em Web/iOS/Android, destacando recursos como Taxa Zero, Integração Bling ERP v3 e Cartões NFC.
2. **`Organization`:** Define a entidade da empresa, contatos de suporte (e-mail, WhatsApp) e perfis oficiais de redes sociais (`sameAs`).
3. **`FAQPage`:** Mapeia dinamicamente todas as perguntas e respostas cadastradas no CMS para citação direta em respostas de IA.

---

### C. Metadados e OpenGraph (`app/layout.tsx`)
Definição de metadados nativos do Next.js 15:

- **Idioma Nativo:** `<html lang="pt-BR">`
- **OpenGraph:** `og:title`, `og:description`, `og:image`, `og:locale="pt_BR"`, `og:siteName="PlataformaShop"`
- **Twitter Card:** `summary_large_image`
- **Canonical URL:** `process.env.NEXT_PUBLIC_SITE_URL`

---

### D. Gerador de Sitemap XML (`app/sitemap.ts`)
Gera automaticamente a estrutura em XML de todas as páginas públicas (`/`, `/checkout`, `/entrar`, `/cadastro`) com periodicidade e prioridade.

---

## ⚡ 4. Como o CMS Alimenta o SEO e GEO

Toda alteração feita no **CMS (Site Externo)** reflete automaticamente na estrutura SEO/GEO:

| Seção do CMS | Propriedade | Impacto no SEO / GEO |
| :--- | :--- | :--- |
| **Hero & SEO** | `seo_title` | Meta Title do Google & OpenGraph Title |
| **Hero & SEO** | `hero_headline` | Tag `<h1>` principal e descrição do software |
| **Hero & SEO** | `hero_mockup_url` | Imagem OpenGraph (`og:image`) e Twitter Card |
| **Perguntas (FAQ)** | `question` / `answer` | Schema JSON-LD `FAQPage` para ChatGPT & Google SGE |
| **Rodapé & Redes** | `social_*` | Propriedade ontológica `sameAs` no Schema `Organization` |
| **Rodapé & Redes** | `support_email` / `support_phone` | Objeto `ContactPoint` no Schema `Organization` |

---

## 🧪 5. Ferramentas de Validação

Para testar e validar a infraestrutura:

1. **Validador de Rich Results do Google:** [Google Rich Results Test](https://search.google.com/test/rich-results)
2. **Validador Schema.org:** [Schema Markup Validator](https://validator.schema.org)
3. **Teste de Robots:** Acesse `https://seudominio.com.br/robots.txt`
4. **Teste de Sitemap:** Acesse `https://seudominio.com.br/sitemap.xml`
