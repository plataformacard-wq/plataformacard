# Protocolo Clear User

Este protocolo documenta o procedimento oficial para limpar contas de teste do banco de dados (Supabase Auth) durante o desenvolvimento local ou homologação.

Como o Supabase gerencia a deleção em cascata (CASCADE) na tabela `auth.users`, apagar o usuário do Auth automaticamente limpará as tabelas dependentes (como `profiles`, `organizations`, etc., dependendo de como as *Foreign Keys* estão configuradas).

## Script de Limpeza (`clear_users.ts`)

Quando for necessário resetar a base de testes, crie temporariamente na raiz do projeto um arquivo chamado `clear_users.ts` com o código abaixo:

```typescript
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Carrega as variáveis de ambiente locais
dotenv.config({ path: "./.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam variáveis de ambiente (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY) no .env.local");
}

// Inicializa o cliente com Service Role para bypass do RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function clearTestUsers() {
  console.log("Buscando usuários...");
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error("Erro ao buscar usuários:", error);
    return;
  }

  if (!users || users.users.length === 0) {
    console.log("Nenhum usuário encontrado para deletar.");
    return;
  }

  console.log(`Encontrados ${users.users.length} usuário(s). Deletando...`);

  // Itera e apaga cada usuário listado (Protegendo o dono do app)
  for (const user of users.users) {
    if (user.email === "plataformashop@gmail.com") {
      console.log(`[PULADO] E-mail: ${user.email} (Dono do App)`);
      continue;
    }

    console.log(`[DELETE] E-mail: ${user.email} | ID: ${user.id}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error(`Erro ao deletar ${user.email}:`, deleteError);
    } else {
      console.log(`✓ Usuário ${user.email} deletado com sucesso.`);
    }
  }
  
  console.log("Limpeza concluída!");
}

clearTestUsers();
```

## Como Executar

Execute o comando no terminal integrado (na raiz do projeto):

```bash
npx tsx clear_users.ts
```

> **Aviso de Segurança**: Nunca faça o commit deste arquivo e nunca o execute conectando às chaves de Produção, pois ele apagará TODOS os usuários retornados pela listagem. Após executar em desenvolvimento, você pode deletar o arquivo `clear_users.ts`.
