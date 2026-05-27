# Relatório de Pendências Global - PlataformaCard

Este documento centraliza todas as tarefas, melhorias técnicas e auditorias pendentes para garantir a estabilidade e o lançamento da plataforma.

---

## 🚨 1. Pendências Imediatas e Críticas (Showstoppers)

- [ ] **Crítico: iFrame no Site Real (MAJ):** Resolver bugs de integração, redimensionamento ou bloqueio no site da MAJ.
- [ ] **Segurança de Dados:** Elaborar relatório/auditoria sobre a segurança dos dados dos clientes (Criptografia, RLS, LGPD).
- [ ] **Favicon:** Resolver o problema do ícone do navegador que ainda não está carregando corretamente.
- [ ] **Limpeza de Dados Fictícios:** Varredura total para remover placeholders, textos "Lorem Ipsum" e dados de teste. O jogo vai começar!
- [ ] **Alerta Super Admin:** Ajustar o alerta de "Simulação de Dashboard" que aparece incorretamente ou precisa de refinamento na UX.
- [ ] **Sino de Notificações:** Implementar funcionalidade real para o ícone de sino no dashboard (alertas de leads, sistema ou atualizações). Atualmente é apenas estético.
- [ ] **Sticker de Status (Assinatura):** Integrar o sticker de "Status do Sistema" para exibir informações em tempo real sobre a assinatura do cliente (ex: "Assinatura Ativa", "Próxima ao Vencimento"). Deve emitir alertas sutis quando o prazo estiver acabando.

---

## 🎨 2. UI/UX e Novas Funcionalidades (Engajamento)

### 2.1 Modal de Produto (Publico & Dashboard)
- [x] **Campo [Destaque do Produto]:**
    - [x] Adicionar campo de input no `ProductModal` (Dashboard).
    - [x] Criar lógica de ativação via **Botão Slider** (mostrar apenas se ativo).
    - [x] Implementar exibição no Modal Público: Alta hierarquia, logo abaixo do título, na área congelada.
    - [x] Estilizar para aceitar diferenciais (ex: "Exclusivo", "Pronta Entrega").
    - [x] Implementar contador de caracteres (35 chars) e trava de caixa alta (UPPERCASE).

- [x] **Inteligência Artificial (Filtro de Qualidade):**
    - [x] Criar sessão dedicada "Filtro de Qualidade IA" no final do modal.
    - [x] Implementar **Review Modal** para aprovação granular de sugestões.
    - [x] Refinar prompts para evitar citação de preços e focar em "papo reto" técnico.
    - [x] Implementar "Corretor com IA" multicanal (Nome, Destaque e Descrição).

### 2.2 Sistemas de Compartilhamento
- [x] **Social Share - Cartão Público:** Botões de WhatsApp, Link e Redes Sociais.
- [x] **Social Share - Catálogo:** Botão flutuante ou fixo para compartilhar a vitrine.
- [x] **Social Share - Modal de Produto:** Link direto para o produto específico com preview (OG Tags).

### 2.3 Gestão de Promoções em Massa (Bulk Pricing)
- [x] **Integração de Banco (RPC)**: Criar migration SQL `apply_bulk_price_adjustment` para aplicação e reversão de descontos e acréscimos usando os campos `price` e `compare_at_price`. (Resolvido via RPC no Supabase)
- [x] **Interface Administrativa**: Desenvolver painel modular no Dashboard para permitir ajustes em 3 níveis de escopo (Catálogo Inteiro, Categoria, Produto Único). (Resolvido no BulkPromoModal e BulkGridEditor)
- [x] **Regras de Negócio**: Suportar % ou Valor Fixo com preview das alterações antes de executar. (Resolvido com preview dinâmico de reajuste)

### 2.4 Estética, Branding e Identidade
- [ ] **Revitalização do Cartão Público:** Tornar o design menos neutro e mais "premium".
- [ ] **Conexão Visual Dinâmica:** Implementar sistema que herda cores e logo da empresa/vendedor para o cartão, removendo o aspecto genérico.
- [ ] **Landing Page de Captura:** Criar página oficial para conversão de novos clientes do SaaS.
- [ ] **Validação: Catálogo Híbrido & WhatsApp Customizado:**
    - [ ] **Migração:** Confirmar integridade das colunas `whatsapp_template` (perfis/catálogos) e `type` (produtos).
    - [ ] **Template Tags:** Testar substituição de `{nome}`, `{preco}`, `{sku}`, `{link}` e `{vendedor}` na vitrine.
    - [ ] **Lógica Híbrida:** Validar seletor Produto/Serviço no `ProductModal` e labels dinâmicos.
    - [ ] **Fallback:** Garantir que mensagens inteligentes padrão funcionam se o template estiver vazio.
    - [ ] **SEO Vitrine:** Validar se a descrição customizada aparece corretamente na meta tag da página pública.

---

## 🛠️ 3. Infraestrutura e Auditoria Técnica

- [ ] **Domínios Próprios:** Analisar viabilidade técnica e arquitetura para clientes usarem seus próprios domínios.
- [ ] **Watchdog Telegram:** Deploy da Edge Function e configuração de Secrets.
- [ ] **Auditoria de Tipagem:** Remoção de `any` e unificação de interfaces (`ProductRow`, etc).
- [ ] **Auditoria de Tema:** Varredura de cores hardcoded e classes Tailwind residuais.
- [x] **Gestão de Recursos (Super Admin):** Monitoração de consumo de tokens da IA (Gemini) integrada ao dashboard de infraestrutura.

---

## 🚨 5. Bloqueadores de Lançamento (CRÍTICO)

- [x] **Quebra de Texto em Cards Públicos:** Resolver definitivamente o problema de palavras (ex: EMPLACAMENTO) que quebram no meio. Estratégia de CSS `word-break: keep-all` aplicada e sanitização de caracteres invisíveis implementada, aguardando validação final em todos os dispositivos.
- [x] **Status de Vendedor - Lógica de Pausa:**
    - [x] Implementar campo `status` (`active`, `paused`, `terminated`) no DB.
    - [x] Se `paused`: Exibir badge "Indisponível para entrega imediata" nos cards.
    - [x] Se `paused`: Desativar abertura do modal de detalhes (cards puramente informativos).
- [x] **Status de Vendedor - Lógica de Desligamento:**
    - [x] Adicionar botão vermelho `{Desligar vendedor}` no modal de gestão de vendedores para acionamento do desligamento.
    - [x] Criar "Bridge Page" (página de transição) para links de vendedores inativos.
    - [x] Exibir lista aleatória/sugerida de vendedores ativos da mesma empresa na Bridge Page.
    - [x] Botão de redirecionamento para o Catálogo Master da Organização.
    - [x] Remoção automática de dados sensíveis (foto/nome) do perfil desligado.
- [ ] **Auditoria no Cadastro de Catálogo B2C:** Realizar auditoria técnica e validação completa no processo de criação/vinculação automática de catálogos para perfis com nível de acesso B2C (individual seller) para prevenir falhas de RLS.
- [ ] **Recesso Temporário B2C (Férias):** Implementar a lógica de recesso programado (dias/horas) para usuários individuais B2C na aba de Edição de Cartão Público (Perfil), conforme o plano de implementação aprovado.

### 5.1 Pendências do Catálogo IFrame
- [ ] **01 - Criar um loader de carregamento personalizado:** Desenvolver um indicador de carregamento customizado e de alta qualidade estética para o catálogo embarcado.
- [ ] **02 - Remover scrolling do modal de produtos e deixar todo expandido:** Alterar o comportamento de exibição do modal de produtos no embed para que apareça completamente expandido verticalmente na página, eliminando barras de rolagem internas no modal.
- [ ] **03 - Auditoria na versão mobile do catálogo iframe:** Realizar testes completos de layout, responsividade e usabilidade no fluxo do iframe em smartphones e tablets.
- [ ] **04 - Atenuar as sombras dos cards de produtos:** Suavizar o sombreamento (box-shadow) dos cartões de produtos na vitrine para um visual mais sutil e moderno.

---

## 💰 6. Business & Expansão (Backlog)

- [ ] **Sistemas de Pagamento:** Iniciar planejamento da arquitetura para checkout e assinaturas.
- [ ] **Análise Estratégica:** Criação e validação do sistema de acesso de vendedores ao dashboard com as limitações configuradas pelo Gestor B2B.
- [ ] **Análise Estratégica:** Definição e criação de Planos e Funções (Roles) do SaaS.
- [ ] **Pesquisa de Mercado:** Estudo de precificação e análise da concorrência para posicionamento do SaaS.
- [x] **Remoção de Seletor de Modelo de Negócio Obsoleto:** Removido o card de seleção de Modelo de Negócio da página de configurações da Empresa no dashboard (obsoleto).

---
*Última atualização: 2026-05-27*
