"use server";

import { createClient } from "@/lib/supabase/server";

interface SyncResult {
  success: boolean;
  message: string;
  updatedCount?: number;
  notFoundCount?: number;
}

export async function syncBlingStock(organizationId: string): Promise<SyncResult> {
  try {
    const supabase = await createClient();

    // 1. Verifica autenticação e RLS da organização
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("bling_access_token, bling_refresh_token, bling_token_expires_at")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      return { success: false, message: "Organização não encontrada ou sem permissão." };
    }

    if (!org.bling_access_token || !org.bling_refresh_token) {
      return { success: false, message: "Bling não está conectado. Conecte sua conta na aba Empresa." };
    }

    let accessToken = org.bling_access_token;
    
    // 2. Renova o token se expirado
    const expiresAt = new Date(org.bling_token_expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      const clientId = process.env.BLING_CLIENT_ID;
      const clientSecret = process.env.BLING_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return { success: false, message: "Credenciais do sistema não configuradas." };
      }

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: org.bling_refresh_token,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        return { success: false, message: "Sessão do Bling expirou. Por favor, desconecte e conecte novamente." };
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokenData.expires_in);

      await supabase
        .from("organizations")
        .update({
          bling_access_token: tokenData.access_token,
          bling_refresh_token: tokenData.refresh_token,
          bling_token_expires_at: newExpiresAt.toISOString(),
        })
        .eq("id", organizationId);
    }

    // 3. Busca produtos da plataforma que tenham SKU
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, sku")
      .eq("organization_id", organizationId)
      .not("sku", "is", null)
      .neq("sku", "");

    if (prodError || !products || products.length === 0) {
      return { success: false, message: "Nenhum produto com SKU configurado." };
    }

    let updatedCount = 0;
    let notFoundCount = 0;

    // 4. Sincroniza cada produto consultando a API do Bling
    for (const product of products) {
      const res = await fetch(`https://www.bling.com.br/Api/v3/produtos?codigo=${product.sku}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const blingProduct = data.data[0];
          const saldoRes = await fetch(`https://www.bling.com.br/Api/v3/estoques/saldos?idsProdutos[]=${blingProduct.id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            }
          });

          if (saldoRes.ok) {
            const saldoData = await saldoRes.json();
            if (saldoData.data && saldoData.data.length > 0) {
              const saldoFisico = saldoData.data[0].saldoFisicoTotal || 0;
              const inStock = saldoFisico > 0;

              await supabase
                .from("products")
                .update({ is_in_stock: inStock })
                .eq("id", product.id);
              
              updatedCount++;
              continue;
            }
          }
        }
      }

      // Se falhou ou não encontrou no Bling, marca como fora de estoque
      await supabase
        .from("products")
        .update({ is_in_stock: false })
        .eq("id", product.id);
      
      notFoundCount++;
    }

    return { 
      success: true, 
      message: "Sincronização concluída com sucesso.",
      updatedCount,
      notFoundCount
    };

  } catch (error: any) {
    console.error("Erro na sincronização Bling:", error);
    return { success: false, message: "Ocorreu um erro interno na sincronização." };
  }
}
