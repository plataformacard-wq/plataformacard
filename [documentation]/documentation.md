# Documentação e Regras de Organização

Este diretório `[documentation]` foi criado para organizar todos os artefatos de texto e planejamento do projeto, evitando poluir a raiz com arquivos soltos.

## Regra de Ouro (Atenção IA e Desenvolvedores)
> [!IMPORTANT]
> **DAQUI PARA FRENTE, TODOS OS NOVOS ARQUIVOS `.md` DEVEM SER SALVOS DENTRO DA PASTA `[documentation]` OU EM UMA DE SUAS SUBPASTAS.**
> 
> A única exceção a essa regra é o arquivo `README.md` da raiz do projeto, que deve permanecer onde está para ser exibido como a página inicial do repositório no GitHub ou Vercel.

---

## Plano de Organização (Categorias)

O repositório de documentos foi dividido nas seguintes subpastas para facilitar a busca e a governança:

### 1. `/protocolos`
Contém as regras vitais do sistema, fluxos de contingência e métodos de desenvolvimento. Sempre consulte esses arquivos antes de tomar decisões estruturais.
**Arquivos:**
- `PROTOCOLO_START.md`
- `VARREDURA_PRE_GIT_PUSH.md`
- `PROTOCOLO_GIT_POINT.md`
- `PROTOCOLO_DE_REFATORACAO_DE_MONOLITOS.md`
- `PROTOCOLO_DESCONTAMINACAO.md`
- `PROTOCOLO_CLEAR_USER.md`
- `PROTOCOLO_SEGURANCA.md`

### 2. `/estrategia`
Contém a base intelectual de negócio do aplicativo, definições de monetização, responsabilidades de produto e análises de conformidade legal.
**Arquivos:**
- `ESTRATEGIA_FINANCEIRA_E_PLANOS.md`
- `PERFIL_PRODUCT_MANAGER.md`
- `ANALISE_TAG_NFC.md`
- `RELATORIO_SEGURANCA_LGPD.md`
- `MANIFESTO_SAAS.md`

### 3. `/planejamento`
Contém listas de afazeres atuais, escopos de projetos futuros e documentos para restaurar e sincronizar o estado da IA (Prompts e Walkthroughs).
**Arquivos:**
- `PENDENCIAS.md`
- `sincronia_continuidade.md`
- `PROMPT_DE_CONTINUIDADE.md`
- `LANDING_PAGE_ONBOARD.md`

### 4. `/manuais`
Documentação técnica e guias de uso/configuração para a infraestrutura, chaves e APIs.
**Arquivos:**
- `DOCUMENTATION.md` (Documentação Geral que foi movida da raiz)
- `GUIA_CONFIGURACAO.md`

---

> [!TIP]
> Se você precisar criar um novo documento e não souber em qual categoria ele se encaixa, deixe na raiz de `[documentation]` temporariamente ou crie uma nova categoria, se fizer sentido para o contexto do projeto.
