# Prompt de Continuidade

## Auditoria na Página de Horários (Próxima Sessão)
Na próxima sessão, inicie realizando uma auditoria completa na lógica e UI das páginas de Horários (`app/dashboard/empresa/page.tsx` e `app/dashboard/perfil/page.tsx`).
Pontos focais da auditoria:
1. **Consistência Visual:** Garantir que o padding dos selects, inputs e toggles estejam em conformidade com o Dark Mode e regras de padding (`.dash-select`).
2. **SSOT (Single Source of Truth):** Avaliar a redundância do estado de horários customizados vs globais e a tipagem `BusinessHours`.
3. **UX de Preenchimento:** Revisar a fluidez do "Copiar para a semana" e os comportamentos do Modo de Emergência, garantindo consistência com CaaS e All Service.
