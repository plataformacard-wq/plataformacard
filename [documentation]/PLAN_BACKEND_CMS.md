# Plano de Implementação: CMS da Landing Page (Main Admin)

Este documento descreve a arquitetura e os requisitos para a construção da central de gerenciamento dinâmico da Landing Page. Ele deve ser utilizado como guia de desenvolvimento na próxima sessão.

## 1. Estratégia Definida

1. **Métricas Dinâmicas (Híbrido):** O painel terá campos para "Números Base" que se somarão automaticamente aos dados reais do banco (ex: Lojas Ativas, Produtos Cadastrados).
2. **Depoimentos (CRUD Total):** Tabela completa para criar, editar e excluir depoimentos falsos iniciais ou aprovar depoimentos reais no futuro.
3. **Marcas Parceiras (CRUD Total):** Tabela para gerenciar a lista de empresas parceiras que aparecem na esteira horizontal. A Landing Page consumirá esses dados e ativará o modo "deslizante" infinito automaticamente caso a tabela passe de 6 registros.
4. **Marketing Core:** Apenas os Textos Críticos (Hero, Meta SEO) e Planos de Preço serão editáveis. Textos estruturais e visuais da interface permanecem fixos no código.

## 2. Banco de Dados / Estado (Supabase)

Tabelas/Estruturas que precisarão ser criadas e conectadas:

- **`landing_page_settings`**: `id`, `hero_headline`, `hero_subtitle`, `seo_title`, `base_users`, `base_catalogs`.
- **`landing_page_testimonials`**: `id`, `name`, `initials`, `color`, `text`, `stars`, `is_active`.
- **`landing_page_partners`**: `id`, `name`, `icon_name`, `color`, `is_active`.

## 3. Interface do Painel de Controle (Admin UI)

**Localização da Página:** `app/main/landing-page/page.tsx`

A página principal do CMS será dividida em 4 grandes "Tabs" (Abas) ou painéis:
1. **Configurações Principais:** Formulário para Título Principal, Subtítulo e configurações de SEO.
2. **Métricas Híbridas:** Formulário numérico para injetar os números base. Mostrará em tempo real um *preview* da métrica total (Base + Banco Real).
3. **Marcas Parceiras:** Tabela de gerenciamento das logomarcas que alimentam a esteira da Landing Page. Terá um modal de cadastro rápido de marca.
4. **Gestão de Depoimentos:** Uma tabela listando os depoimentos atuais, com botões de Ações (Adicionar Novo, Editar, Desativar). 

**Componentes Auxiliares Esperados:**
- `components/admin/TestimonialModal.tsx`
- `components/admin/PartnerModal.tsx`
- `components/admin/MetricsForm.tsx`

## 4. Integração com a Landing Page (Front-End)

**Localização Alvo:** `app/page.tsx`

- As seções da Landing Page (Hero, Testimonials, CompanyLogos) precisarão ser convertidas para lerem os dados dinâmicos do banco através de chamadas Server-Side via Next.js.
- O array estático `COMPANIES` no `CompanyLogos.tsx` será substituído pelo *fetch* da tabela `landing_page_partners`. A lógica condicional que liga a animação a partir de 6 itens continuará funcionando automaticamente de acordo com o tamanho do retorno do banco.
