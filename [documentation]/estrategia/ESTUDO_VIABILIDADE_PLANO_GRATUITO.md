# 📊 Estudo de Viabilidade: Planos Gratuitos na PlataformaShop (Freemium vs. Free Trial)

> **Autor:** Antigravity AI  
> **Escopo:** Análise Estratégica, Financeira (Unit Economics), Riscos de Infraestrutura e Arquitetura de Conversão (PLG).

---

## 🎯 1. O Dilema: Freemium Perpétuo vs. Free Trial com Prazo

No mercado de software SaaS de catálogos e links (concorrentes como Kyte, Linktree, CaniStore, OlaClick e Pedir.to), existem duas abordagens principais para planos gratuitos:

| Modelo | Como Funciona | Prós | Contras & Riscos |
|---|---|---|---|
| **Modelo A: Freemium Perpétuo** *(R$ 0 para sempre)* | O usuário usa uma versão restrita (ex: até 15 ou 20 produtos) por tempo ilimitado. | • Explosão de novos cadastros (Top-of-Funnel).<br>• Difusão viral da marca PlataformaShop.<br>• Efeito de rede orgânico. | • **Custo de Infraestrutura acumulativo:** bancos de dados cheios de usuários inativos.<br>• Risco de spam/abusadores de storage.<br>• Taxa de conversão para pago costuma ser baixa (2% a 4%). |
| **Modelo B: Free Trial Sem Cartão** *(14 dias grátis)* | O usuário tem acesso completo (PRO ou Starter) por 7 a 14 dias sem precisar colocar cartão. | • Alta taxa de conversão (12% a 25%).<br>• O usuário experimenta o valor real imediatamente.<br>• Baixo custo residual de infraestrutura. | • Menos cadastros brutos que o freemium.<br>• Exige nutrição ativa por e-mail e WhatsApp durante os 14 dias. |
| **Modelo C: Híbrido "Freemium Estratégico com Marca d'Água"** | Grátis para até 20 produtos, porém com badge fixo no rodapé: *"Criado com PlataformaShop - Crie o seu grátis"* e sem domínio próprio. | • Cada catálogo gratuito atua como um outdoor que atrai novos clientes pagantes.<br>• Custo de infraestrutura é pago pelo marketing gerado. | • Exige controle rígido de limites de imagens e storage no Supabase. |

---

## 💰 2. Análise de Custos de Infraestrutura (Unit Economics por Usuário Grátis)

A PlataformaShop utiliza a seguinte stack técnica:
1. **Supabase (PostgreSQL + Auth + Storage):**
   - No plano Pro do Supabase (US$ 25/mês), há 100 GB de Storage e 8 GB de disco.
   - Cada imagem comprimida pelo nosso pipeline WebP consome em média **80 KB a 150 KB**.
   - Se 1.000 usuários gratuitos cadastrarem 20 produtos (3 fotos cada = 60 fotos = ~6 MB por usuário):
     - 1.000 usuários grátis = **~6 GB de Storage** (dentro da cota do Supabase).
2. **Vercel (Bandwidth & Edge Requests):**
   - Catálogos estáticos geram leituras de CDN. A Vercel possui 1 TB de tráfego no plano Pro.
3. **Gemini AI (SEO e Descrições):**
   - **Risco:** Se liberarmos a IA no plano gratuito, o consumo de tokens de API pode gerar custos descontrolados. **A IA DEVE SER 100% BLOQUEADA NO PLANO GRÁTIS.**
4. **Bling ERP V3 & Módulo B2B:**
   - Devem ser recursos 100% exclusivos dos planos pagos (PRO e Sales Team).

> 💡 **Veredito de Custo:** Manter 1.000 usuários gratuitos custa menos de **R$ 20 a R$ 35/mês** em infraestrutura compartilhada se limitarmos o storage a 20 produtos e bloquearmos APIs externas (IA/ERP).

---

## ⚖️ 3. Tabela Comparativa de Recursos: Pago vs. Sugestão de Plano Grátis

Para que um plano gratuito não canibalize os planos pagos (especialmente o **Starter de R$ 59,90**), os limites precisam ser cirúrgicos:

| Funcionalidade | Plano Grátis (Free) | Starter (R$ 59,90/mês) | PRO (R$ 149,90/mês) |
|---|:---:|:---:|:---:|
| **Preço** | **R$ 0,00** | R$ 59,90 / R$ 39,90 | R$ 149,90 / R$ 99,90 |
| **Limite de Produtos** | **Até 20 produtos** | Até 100 produtos | Até 1.000 produtos |
| **Endereço na Internet** | `anotameucontato.com.br/empresa` | `anotameucontato.com.br/empresa` | `anotameucontato.com.br` + Domínio Próprio |
| **Taxa sobre Vendas** | 0% | 0% | 0% |
| **Selo / Marca da Plataforma** | **Badge Obrigatório no Rodapé** | Rodapé Limpo | Rodapé Limpo e White-label |
| **Assistente de IA (SEO e Textos)** | ❌ Bloqueado | ❌ Bloqueado | ✅ Ilimitado |
| **Integração Bling ERP V3** | ❌ Bloqueado | ❌ Bloqueado | ✅ Tempo Real |
| **Portal B2B Atacado (Zeon)** | ❌ Bloqueado | ❌ Bloqueado | 🟡 Degustação (3 clientes) |
| **Vendedores / Usuários** | 1 | 1 | 3 |

---

## 🚀 4. Proposta Recomendada: O Efeito "Outdoor Viral" (Product-Led Growth)

Se decidirmos lançar um Plano Gratuito, a recomendação de ouro da engenharia de produto é:

1. **Transformar o Usuário Grátis em Divulgador:**
   - No catálogo do usuário gratuito, incluir uma barra fixa ou selo flutuante discreto e sofisticado:
     > *"⚡ Criado com PlataformaShop • Crie sua vitrine grátis"*
   - Sempre que o cliente dele comprar pelo catálogo, verá que a PlataformaShop é o motor por trás.
2. **Gatilho de Upgrade Natural:**
   - Ao tentar cadastrar o 21º produto: *"Você atingiu o limite de 20 produtos do plano Grátis. Faça upgrade para o Starter e cadastre até 100 produtos!"*.
   - Ao tentar usar a IA ou Bling: modal de upgrade automático.
3. **Política de Limpeza de Inativos (Anti-Lixo):**
   - Contas gratuitas sem acessos há mais de 60 dias entram em modo "hibernação" para não consumir recursos.

---

## 🧭 Próximo Passo para Decisão:
Podemos seguir por 3 caminhos:
- **Opção 1:** Implementar o **Plano Free (Grátis)** com trava de 20 produtos e badge de viralização.
- **Opção 2:** Adotar o **Free Trial de 14 Dias (Sem Cartão)** no Plano PRO (maior taxa de conversão direta em receita).
- **Opção 3:** Manter apenas os planos pagos e focar a comunicação da Landing Page no Starter (R$ 39,90 anual).
