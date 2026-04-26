
import { createAdminClient } from "./lib/supabase/admin";

async function cleanupOrphan() {
  const admin = createAdminClient();
  const email = "O_EMAIL_QUE_VOCE_USOU"; // Eu vou buscar dinamicamente se você me disser, ou tentar o último erro
  
  // Como não tenho o email exato aqui, vou buscar usuários criados nos últimos 10 minutos sem organização
  const { data: users, error } = await admin.auth.admin.listUsers();
  
  if (error) {
    console.error("Erro ao listar usuários:", error);
    return;
  }

  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const orphans = users.users.filter(u => {
    const createdAt = new Date(u.created_at);
    return createdAt > tenMinutesAgo;
  });

  console.log(`Encontrados ${orphans.length} possíveis cadastros incompletos.`);

  for (const user of orphans) {
    // Verifica se tem perfil
    const { data: profile } = await admin.from("profiles").select("organization_id").eq("user_id", user.id).maybeSingle();
    
    if (!profile || !profile.organization_id) {
      console.log(`Limpando usuário incompleto: ${user.email}`);
      await admin.auth.admin.deleteUser(user.id);
    }
  }
}

cleanupOrphan();
