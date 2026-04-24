# Status Report: PlataformaCard 🚀

Este documento descreve o estado atual do desenvolvimento, as tecnologias utilizadas, o escopo consolidado e os próximos passos do projeto.

---

## 1. Fase Atual
O projeto encontra-se na fase de **Consolidação e Refinamento de UX/UI**. Após a implementação das funcionalidades base (Auth, CRUD de produtos, Perfis), o foco mudou para a robustez da plataforma SaaS, incluindo gestão de limites por plano, automação de onboarding e ferramentas avançadas de administração (Super Admin).

---

## 2. Escopo Atualizado

### 🛡️ Core & Modelos de Negócio
- **Plataforma Híbrida**: Suporte a três modelos principais:
    - **B2C (Cartão Digital)**: Foco em perfis pessoais e networking.
    - **B2B (Gestão de Vendas)**: Foco em times de vendas e hierarquia organizacional.
    - **CaaS (Catalog as a Service)**: Modo catálogo puro para vitrines digitais de empresas.
- **Multi-tenancy**: Separação completa de dados por conta/empresa.
- **RBAC (Controle de Acesso)**: Papéis de Super Admin, Gestor, Vendedor e `caas_admin`.
- **Blindagem**: Sistema de proteção e integridade para catálogos e acessos.

### 📊 Dashboard do Usuário (Gestor/Vendedor)
- **Catálogo Inteligente**: Edição em massa de produtos (Bulk Editor) via interface tipo planilha.
- **Gestão de Imagens**: Sistema de upload com crop automático e compressão no cliente para otimização de storage.
- **Analytics**: Visualização de acessos e performance do catálogo.
- **Onboarding**: Fluxo guiado para novos usuários configurarem sua empresa e produtos.

### 🧠 Centro de Inteligência (Super Admin)
- **BI Analytics**: Visão global da saúde da plataforma, segmentada por B2B, B2C e CaaS.
- **Client Raio-X**: Detalhamento de contratos, vencimentos e histórico operacional de cada cliente.
- **Gestão de Vitrines (CaaS)**: Controle centralizado de implementações de catálogos.
- **Manutenção Global**: Sistema de notificações e bloqueios para manutenção do sistema.

---

## 3. Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript |
| **Frontend** | React 19 / Tailwind CSS 4 |
| **Animações** | Framer Motion |
| **Backend/BaaS** | Supabase (Auth, Postgres, Storage, Edge Functions) |
| **Gerenciamento de Estado** | React Hooks / Supabase Context |
| **Manipulação de Imagens** | react-easy-crop / browser-image-compression |
| **Tabelas** | TanStack Table (v8) |

---

## 4. Pendências de Programação (Backlog Técnico)

1.  **Refinamento de RBAC**: Garantir que o `AccessManager` bloqueie dinamicamente ações baseadas no plano contratado.
2.  **Sincronização de Sidebar**: Pequenos ajustes na indicação de item ativo quando há mudanças via hash da URL.
3.  **Logs de Auditoria**: Implementar rastreamento de alterações críticas feitas por vendedores/gestores.
4.  **Otimização de Performance**: Lazy loading mais agressivo no Bulk Editor para catálogos com +500 itens.
5.  **Notificações em Tempo Real**: Implementar via Supabase Realtime alertas para novos acessos ou atualizações do sistema.

---

## 5. Plano de Implementação em Andamento

### 🚀 Curto Prazo (Próximos Dias)
- **Finalização do Onboarding**: Garantir que 100% dos novos usuários completem o perfil antes de acessar o dashboard.
- **Estabilização da Gestão de Limites**: Bloqueio automático de criação de produtos ao atingir o limite do plano.
- **Ajustes de UI**: Padronização final de modais e botões seguindo o novo `PanelLayout`.

### 🎯 Médio Prazo (Próximas Semanas)
- **Otimização do Fluxo CaaS**: Refinar o onboarding específico para o modo catálogo (foco em Logo e Vitrine em vez de perfil pessoal).
- **Lançamento da Versão Beta Protegida**: Liberação para usuários selecionados (como o usuário "Maj") com verificação de e-mail obrigatória.
- **Documentação Master**: Consolidação final da lógica de negócio para futuras expansões de equipe.
- **Automação de Renovação**: Integração de gatilhos para expiração de contratos no Super Admin.

---

> [!NOTE]
> Este documento é dinâmico e deve ser atualizado a cada grande marco de desenvolvimento.
