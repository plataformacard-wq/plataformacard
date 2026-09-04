# PROTOCOLO DE REFATORAÇÃO DE MONOLITOS

## 1. Objetivo
O objetivo deste protocolo é garantir que processos de refatoração de arquivos grandes ("monolíticos") sejam executados de forma totalmente segura, sem gerar **nenhum retrabalho** na parte de Design, Layout (UI) e UX do sistema.

## 2. A Trava Absoluta (Recortar e Colar)
Toda e qualquer extração de componentes deve seguir a regra da **Trava Absoluta**. 
Isso significa que:
- O código JSX e as classes CSS (Tailwind) devem ser **EXATAMENTE RECORTADOS** do arquivo original e **COLADOS** no novo arquivo menor.
- É **estritamente proibido** alterar as tags HTML, reestruturar o DOM ou modificar as regras visuais durante uma refatoração.
- O componente extraído deve receber as props necessárias de forma transparente, garantindo que a renderização continue 100% idêntica à versão anterior.

## 3. Arquivos Intocáveis (Blacklist de Refatoração)
Devido ao alto risco de quebra de design e regras de negócio sensíveis em áreas vitais, os seguintes arquivos/domínios estão **BLINDADOS** e devem ser **IGNORADOS** em processos de refatoração estrutural no momento:

- **Modais de Produtos:** `components/dashboard/ProductModal.tsx`
- **Cards de Produtos:** Arquivos relacionados à renderização do card de produto no painel.
- **Iframe do Catálogo Mobile / UI do Catálogo:** Toda a interface final que renderiza o catálogo para o usuário (`app/p/[slug]/...` ou `components/catalog/...`).

Se for estritamente necessário alterar lógicas nesses arquivos, isso deve ser feito como inserção de código local (feature nova), e não sob a justificativa de "refatoração estrutural".

## 4. Passos para Execução Segura
1. Realizar uma varredura (ex: `npm run build` ou lint) antes da refatoração.
2. Executar o Protocolo Deploy criando um ponto de restauração.
3. Extrair os trechos adotando a Trava Absoluta.
4. Testar o componente refatorado antes de avançar para a próxima etapa.
