# 🎨 Guia Central de Assets da Landing Page — PlataformaShop

Esta pasta centraliza todas as mídias, gráficos e ilustrações oficiais que alimentam a **Landing Page Institucional** (`app/page.tsx`) e a **Central de Gerenciamento CMS Admin** (`app/main/landing-page/page.tsx`).

---

## 📁 Estrutura da Pasta `public/assets/landing-page/`

```
public/assets/landing-page/
├── hero/          # Mockups 3D do Hero Section (Dark & Light Mode)
├── logos/         # Logomarcas oficiais da PlataformaShop (Header/Footer)
├── recursos/      # Ilustrações dos 4 cards de recursos B2B (#recursos)
├── parceiros/     # Logos vetorizadas de empresas parceiras (Marquee Infinito 6+)
└── depoimentos/   # Avatares e fotos reais dos lojistas depoentes
```

---

## 🔗 Mapeamento Técnico & Especificações

| Subpasta | Componente Alvo | Especificação Recomendada | Resolução / Formato |
|---|---|---|---|
| `hero/` | `HeroSection.tsx` | Render 3D da Vitrine Digital + Cartão NFC | `1200x900px` (WebP / PNG) |
| `logos/` | `Header.tsx` / `Footer.tsx` | Marca vetorizada com fundo transparente | `400x120px` (PNG / SVG) |
| `recursos/` | `WhyChooseUs.tsx` / `#recursos` | Prints/Gráficos dos diferenciais transacionais | `800x600px` (WebP / PNG) |
| `parceiros/` | `CompanyLogos.tsx` | Logos em tom monocromático/vetorizado (Mínimo 6) | `200x80px` (PNG / SVG) |
| `depoimentos/` | `Testimonials.tsx` | Fotos de perfil redondas dos clientes | `300x300px` (WebP / JPG) |

---

## 🛠️ Upload e Gerenciamento via CMS
Todas as imagens desta pasta também podem ser gerenciadas e atualizadas dinamicamente via painel administrativo em:  
👉 **`http://localhost:3000/main/landing-page`**
