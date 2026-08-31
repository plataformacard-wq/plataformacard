import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, code, deviceId } = body;

    if (!token || !code) {
      return NextResponse.json(
        { success: false, error: "Token e código de verificação são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from("b2b_clients")
      .select("*")
      .eq("access_token", token)
      .maybeSingle();

    if (error || !client) {
      return NextResponse.json(
        { success: false, error: "Cliente B2B não encontrado." },
        { status: 404 }
      );
    }

    // Validar código OTP e expiração
    const cleanInputCode = String(code).trim();
    const storedCode = String(client.current_otp_code || "").trim();
    const now = new Date();
    const expiresAt = client.current_otp_expires_at ? new Date(client.current_otp_expires_at) : null;

    if (!storedCode || cleanInputCode !== storedCode) {
      return NextResponse.json(
        { success: false, error: "Código de verificação incorreto ou não solicitado." },
        { status: 400 }
      );
    }

    if (expiresAt && now > expiresAt) {
      return NextResponse.json(
        { success: false, error: "Código de verificação expirado. Solicite um novo código." },
        { status: 400 }
      );
    }

    // Registrar Device ID na lista de dispositivos confiáveis
    let trustedDevices: string[] = Array.isArray(client.trusted_device_ids)
      ? client.trusted_device_ids
      : [];

    if (deviceId && !trustedDevices.includes(deviceId)) {
      trustedDevices.push(deviceId);
    }

    // Atualizar no banco: limpar código e salvar dispositivo
    await supabase
      .from("b2b_clients")
      .update({
        trusted_device_ids: trustedDevices,
        current_otp_code: null,
        current_otp_expires_at: null,
      })
      .eq("id", client.id);

    // Buscar e retornar tabela de preços imediatamente
    const { data: prices } = await supabase
      .from("b2b_sku_prices")
      .select("sku, prices")
      .eq("organization_id", client.organization_id);

    const priceMap: Record<string, number> = {};
    prices?.forEach((p) => {
      const pPrices = p.prices || {};
      let val = pPrices[client.assigned_price_key];
      if (!val) {
        val = pPrices["atacado"] || pPrices["valor_1"] || pPrices["tabela_x"] || pPrices["varejo"];
      }
      if (!val) {
        const availableValues = Object.values(pPrices).filter(
          (v) => typeof v === "number" && v > 0
        ) as number[];
        if (availableValues.length > 0) val = availableValues[0];
      }
      if (val && Number(val) > 0) priceMap[p.sku] = Number(val);
    });

    const { data: sheetConfig } = await supabase
      .from("b2b_sheets_config")
      .select("custom_tables, default_anchor_percent")
      .eq("organization_id", client.organization_id)
      .maybeSingle();

    const defaultMarkup =
      sheetConfig?.default_anchor_percent !== null &&
      sheetConfig?.default_anchor_percent !== undefined
        ? Number(sheetConfig.default_anchor_percent)
        : 30;

    const effectiveMarkup =
      client.anchor_percent !== null && client.anchor_percent !== undefined
        ? Number(client.anchor_percent)
        : defaultMarkup;

    const anchorMap: Record<string, number> = {};
    Object.entries(priceMap).forEach(([sku, b2bPrice]) => {
      if (b2bPrice && b2bPrice > 0) {
        anchorMap[sku] = Number((b2bPrice * (1 + effectiveMarkup / 100)).toFixed(2));
      }
    });

    return NextResponse.json({
      success: true,
      message: "Dispositivo autenticado com sucesso!",
      client,
      prices: priceMap,
      anchorPrices: anchorMap,
    });
  } catch (err: any) {
    console.error("Erro ao validar OTP B2B:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
