# 🚀 Guia de Configuração Rápida: PlataformaCard

Este documento contém as instruções necessárias para configurar o ambiente de desenvolvimento em uma nova máquina, garantindo que o projeto esteja sincronizado com o GitHub e pronto para rodar.

---

## 📋 Prompt para o Antigravity
Copie e cole o texto abaixo para o agente na nova máquina para automatizar a configuração:

> **"Olá! Estou configurando este projeto nesta nova máquina. Por favor, execute o seguinte Protocolo de Inicialização:**
>
> 1. **Repositório:** Verifique se esta pasta já é um repositório Git. Se não for, inicialize o Git e conecte ao repositório: `https://github.com/startagenciadigital/plataformacard.git`.
> 2. **Sincronização:** Faça um `git fetch` e um `pull` (ou reset) para garantir que os arquivos locais são exatamente os mesmos da branch `main` do GitHub.
> 3. **Dependências:** Verifique se o Node.js e o Homebrew estão instalados. Se sim, rode `npm install` para preparar o projeto.
> 4. **Variáveis de Ambiente:** Crie o arquivo `.env.local` na raiz. (Eu vou te fornecer as chaves do Supabase ou você pode buscá-las no projeto antigo).
> 5. **Regras do Agente:** Crie um arquivo `.antigravityrules` com a seguinte instrução: *"Sempre verifique se há atualizações no GitHub (git fetch) ao iniciar uma nova sessão e informe o usuário. Utilize comandos compatíveis com o SO atual e priorize a manutenção dos arquivos de documentação."*
>
> **O objetivo é deixar esta máquina 100% sincronizada com o GitHub e pronta para o comando `npm run dev`."**

---

## 🔑 Credenciais Necessárias (.env.local)
Certifique-se de preencher os valores abaixo no arquivo `.env.local` da nova máquina:

| Variável | Descrição | Onde encontrar? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Projeto | Dashboard Supabase > Settings > API |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | OAuth Client ID | Google Cloud Console > APIs & Services > Credentials |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave Anon | Dashboard Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave Mestra (Admin) | Dashboard Supabase > Settings > API > service_role |

---

## 🛠️ Comandos de Verificação
Após a configuração, você pode rodar estes comandos no Terminal para validar:

```bash
# Ver Versão do Node
node -v

# Instalar dependências (se necessário)
npm install

# Rodar o servidor local
npm run dev
```

---
*Gerado por Antigravity em 11 de maio de 2026.*
