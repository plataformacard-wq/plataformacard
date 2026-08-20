import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PanelLayout } from "@/components/dashboard/PanelLayout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role !== "main_admin") {
    redirect("/dashboard");
  }

  // 🔒 TRAVA DE SEGURANÇA 2FA / MFA PARA MAIN ADMIN
  try {
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    // Valida fatores apenas se a resposta do servidor for bem-sucedida
    if (!factorsError && factorsData?.all) {
      const verifiedFactors = factorsData.all.filter((f) => f.status === "verified");

      if (verifiedFactors.length === 0) {
        // Redireciona para o Perfil para cadastrar o 2FA no Google Authenticator
        redirect("/dashboard/perfil?mfa_required=true");
      }

      // Se possui 2FA ativo, mas a sessão atual não é AAL2 (desafio pendente)
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
        redirect("/entrar/2fa?redirect=/main");
      }
    }
  } catch (err: any) {
    // Permite que o Next.js realize o redirecionamento HTTP nativo (NEXT_REDIRECT)
    if (err && typeof err === "object" && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("Aviso de verificação MFA no layout /main:", err);
  }

  return (
    <PanelLayout>{children}</PanelLayout>
  );
}