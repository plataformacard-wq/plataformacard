# Relatório de Pendências Global - PlataformaCard

Este documento centraliza todas as tarefas, melhorias técnicas e auditorias pendentes para garantir a estabilidade e o lançamento da plataforma.

---

## 🚨 1. Pendências Imediatas e Críticas (Showstoppers)

- [ ] **Crítico: iFrame no Site Real (MAJ):** Resolver bugs de integração, redimensionamento ou bloqueio no site da MAJ.
- [ ] **Segurança de Dados:** Elaborar relatório/auditoria sobre a segurança dos dados dos clientes (Criptografia, RLS, LGPD).
- [ ] **Favicon:** Resolver o problema do ícone do navegador que ainda não está carregando corretamente.
- [ ] **Limpeza de Dados Fictícios:** Varredura total para remover placeholders, textos "Lorem Ipsum" e dados de teste. O jogo vai começar!
- [ ] **Alerta Super Admin:** Ajustar o alerta de "Simulação de Dashboard" que aparece incorretamente ou precisa de refinamento na UX.

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

### 2.3 Estética, Branding e Identidade
- [ ] **Revitalização do Cartão Público:** Tornar o design menos neutro e mais "premium".
- [ ] **Conexão Visual Dinâmica:** Implementar sistema que herda cores e logo da empresa/vendedor para o cartão, removendo o aspecto genérico.
- [ ] **Landing Page de Captura:** Criar página oficial para conversão de novos clientes do SaaS.

---

## 🛠️ 3. Infraestrutura e Auditoria Técnica

- [ ] **Domínios Próprios:** Analisar viabilidade técnica e arquitetura para clientes usarem seus próprios domínios.
- [ ] **Watchdog Telegram:** Deploy da Edge Function e configuração de Secrets.
- [ ] **Auditoria de Tipagem:** Remoção de `any` e unificação de interfaces (`ProductRow`, etc).
- [ ] **Auditoria de Tema:** Varredura de cores hardcoded e classes Tailwind residuais.

---

## 💰 4. Business & Expansão (Backlog)

- [ ] **Sistemas de Pagamento:** Iniciar planejamento da arquitetura para checkout e assinaturas.
- [ ] **Pesquisa de Mercado:** Estudo de precificação e planos da concorrência para ajuste do SaaS.
- [ ] **Limpeza Automática de Logs:** Rotina para preservar espaço no Plano Free.

---
*Última atualização: 2026-05-10*
