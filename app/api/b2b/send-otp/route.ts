import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token de acesso B2B obrigatório." },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from("b2b_clients")
      .select("id, company_name, phone_whatsapp, access_token")
      .eq("access_token", token)
      .maybeSingle();

    if (error || !client) {
      return NextResponse.json(
        { success: false, error: "Cliente B2B não encontrado para este token." },
        { status: 404 }
      );
    }

    // Gerar código de 6 dígitos numéricos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos

    // Salvar no Supabase
    await supabase
      .from("b2b_clients")
      .update({
        current_otp_code: otpCode,
        current_otp_expires_at: expiresAt,
      })
      .eq("id", client.id);

    // Formatar telefone mascarado
    const cleanPhone = (client.phone_whatsapp || "").replace(/\D/g, "");
    const maskedPhone =
      cleanPhone.length >= 10
        ? `(${cleanPhone.slice(0, 2)}) 9****-${cleanPhone.slice(-4)}`
        : "WhatsApp cadastrado";

    // Link opcional de disparo rápido
    const message = `🔐 *CÓDIGO DE ACESSO B2B*\n\nOlá, *${client.company_name}*!\nSeu código de segurança para autenticar este dispositivo é:\n\n*${otpCode}*\n\n⏱️ _Válido por 10 minutos. Se você não solicitou, ignore esta mensagem._`;
    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      maskedPhone,
      whatsappUrl,
      expiresAt,
      // Em ambiente de desenvolvimento local, expor código no log para testes fáceis
      devCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (err: any) {
    console.error("Erro ao gerar OTP B2B:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
