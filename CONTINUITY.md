# Prompt de Continuidade

## Validação da Integração Bling (Próxima Sessão)
Na próxima sessão, inicie confirmando com o usuário se as configurações no **Bling Developer Portal** foram concluídas.
O código do OAuth 2.0 e de sincronização (Server Action) já foi inteiramente implementado no repositório.

Pontos focais para a próxima etapa:
1. **Verificação de Variáveis:** Checar se `BLING_CLIENT_ID` e `BLING_CLIENT_SECRET` estão devidamente configurados no `.env.local`.
2. **Execução de Migration:** Confirmar se o SQL `supabase/migrations/20260707174300_add_bling_oauth_fields.sql` foi rodado no banco de dados.
3. **Teste Ponta a Ponta:** Clicar em "Conectar ao Bling" em `/dashboard/empresa`, finalizar a autenticação no painel do Bling, retornar para a aplicação, e em seguida, testar o botão "Sincronizar Bling" no `/dashboard/catalogo/gerenciador`.
4. **Tratamentos de Erro:** Caso ocorram erros no callback (`app/api/auth/bling/callback/route.ts`), debugar e ajustar as permissões do aplicativo no Bling (ex: verificar se os escopos corretos de Estoque e Produtos foram liberados na criação do app lá no painel do Bling).

## Auditorias:
1. **Sessão de gerenciamento de produtos em massa de catalogo:** Revisar funcionamento e escalabilidade do componente de gerenciamento.
2. **Função [produtos esgotados no fim do catálogo]:** Investigar ou implementar funcionalidade que move os produtos esgotados para o final do catálogo automaticamente.
3. **Função de auto detecção de monolitos falhou:** Checar por que a auto detecção de arquivos monolíticos (que aciona a skill "Refatoração Proativa e Anti-Monolito") está falhando e reparar o fluxo.
