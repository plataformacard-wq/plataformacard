# 🛡️ Relatório de Auditoria: Segurança de Dados e LGPD

Este documento apresenta a análise de segurança de dados, políticas de privacidade e conformidade com a LGPD (Lei Geral de Proteção de Dados) para a **PlataformaShop**.

---

## 1. Segurança na Transmissão e Armazenamento (Criptografia)

A segurança dos dados é garantida através de múltiplos níveis de proteção na transmissão e no armazenamento:

*   **Criptografia em Trânsito:** Toda a comunicação entre o frontend (Next.js), o backend e o Supabase é realizada estritamente sob conexões seguras criptografadas via HTTPS e WSS (WebSockets sobre TLS), utilizando TLS 1.3.
*   **Criptografia em Repouso:** Os bancos de dados PostgreSQL no Supabase utilizam criptografia de disco transparente (AES-256) fornecida pela AWS (RDS).
*   **Autenticação e Senhas:** As credenciais dos usuários são gerenciadas de forma isolada pelo Supabase Auth. As senhas são criptografadas em repouso utilizando o algoritmo de hashing robusto **Bcrypt**, tornando impossível o acesso por terceiros ou administradores.
*   **Controle de Sessão:** A autenticação é baseada em tokens JWT (JSON Web Tokens) de curta duração, armazenados e validados no lado do cliente com segurança integrada.

---

## 2. Row Level Security (RLS) - Isolamento de Dados

O Supabase PostgreSQL possui políticas estritas de **Row Level Security (RLS)** habilitadas em todas as tabelas sensíveis. Isso garante que um inquilino (tenant) ou vendedor jamais consiga ler ou escrever dados de outro inquilino.

### Arquitetura de Políticas RLS:
1.  **Tabela `profiles`**:
    *   Leitura pública permitida para fins de renderização do cartão público.
    *   Escrita/atualização restrita apenas ao próprio dono da conta (`auth.uid() = id`) ou Super Admins.
2.  **Tabela `catalogs`**:
    *   Leitura de catálogos ativos liberada para a vitrine pública.
    *   Modificações (Insert, Update, Delete) restritas aos donos do catálogo (`owner_id = auth.uid()`) ou administradores vinculados à organização.
3.  **Tabela `products` e `categories`**:
    *   Apenas produtos ativos e não marcados como excluídos (`deleted_at IS NULL` e `is_active = true`) são legíveis publicamente.
    *   A edição e remoção exigem autenticação que comprove a vinculação do usuário com a organização proprietária do produto.
4.  **Tabela `organization_product_overrides`**:
    *   Políticas garantem que apenas a organização ativa (`organization_id`) possa criar ou atualizar overrides de preços e disponibilidade para produtos mestre (CaaS).

---

## 3. Conformidade com a LGPD

A PlataformaShop foi arquitetada seguindo os princípios de *Security by Design* e *Privacy by Design*, garantindo total conformidade com a LGPD:

*   **Minimização de Dados (Art. 6º, III):** Coletamos apenas os dados estritamente necessários para o funcionamento comercial da vitrine (Nome, WhatsApp, E-mail de login e dados da empresa).
*   **Direito de Exclusão / Esquecimento (Art. 18, VI):** O sistema oferece mecanismos claros de exclusão:
    *   **Vendedores:** A exclusão remove os dados sensíveis de contato do banco e redireciona links antigos para uma página neutra.
    *   **Catálogos e Produtos:** Soft-delete (`deleted_at`) para fins de integridade e suporte à recuperação, com possibilidade de exclusão definitiva sob demanda.
*   **Transparência e Consentimento:** Formulários de cadastro de novos usuários contêm termos de uso claros sobre a finalidade dos dados.

---

## 4. Conclusão da Auditoria

A arquitetura de segurança da PlataformaShop está **aprovada** para operação comercial. O uso de RLS no Supabase fornece o nível necessário de isolamento multi-tenant, e a criptografia fim a fim assegura a confidencialidade dos dados dos usuários.
