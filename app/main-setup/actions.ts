"use server";

import { createClient } from '@supabase/supabase-js';
import { bootstrapMainAdminSchema } from '@/lib/validations/setup-schemas';

export async function bootstrapMainAdmin(formData: FormData) {
  const secret = formData.get("secret") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const parsed = bootstrapMainAdminSchema.safeParse({
    secret,
    email,
    password,
    fullName,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const envSecret = process.env.MAIN_ADMIN_SETUP_SECRET;

  if (!envSecret) {
    return { error: "Variável MAIN_ADMIN_SETUP_SECRET não configurada no servidor." };
  }

  if (parsed.data.secret !== envSecret) {
    return { error: "Chave secreta inválida. Acesso negado." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: "Variáveis do Supabase (URL ou Service Role Key) não configuradas." };
  }

  // Cria um client com Service Role para bypass no RLS e Auth
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 1. Criar o usuário no Auth (Admin API)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true, // Já confirma o email direto
      user_metadata: {
        full_name: parsed.data.fullName
      }
    });

    if (userError) {
      console.error("Erro auth.admin.createUser:", userError);
      return { error: `Erro ao criar usuário: ${userError.message}` };
    }

    if (!userData.user) {
      return { error: "Usuário não retornado pelo Supabase após criação." };
    }

    // 2. Inserir o perfil como main_admin
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userData.user.id,
      user_id: userData.user.id,
      role: 'main_admin',
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      onboarding_completed: true, // Já considera o onboarding completo pro Main Admin
      onboarding_completed_at: new Date().toISOString()
    });

    if (profileError) {
      console.error("Erro insert profile:", profileError);
      // Fallback: Deletar o usuário do auth se falhar no perfil (para não deixar usuário órfão)
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return { error: `Erro ao criar perfil no banco de dados: ${profileError.message}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Erro crítico no bootstrap:", err);
    return { error: `Erro interno: ${err.message || "Falha desconhecida"}` };
  }
}
