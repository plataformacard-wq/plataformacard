import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const slug = searchParams.get("slug");

    let query = supabase
      .from("products")
      .select("id, name, sku, price")
      .order("name", { ascending: true });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    } else if (slug) {
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (org) {
        query = query.eq("organization_id", org.id);
      }
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Gerar CSV formatado com Ancoragem de Preço e BOM para compatibilidade
    const headers = ["PRODUTO", "SKU (ID)", "PREÇO SUGERIDO (VAREJO)", "VALOR 1", "VALOR 2", "VALOR 3", "VALOR 4"];
    const rows: string[][] = [];

    if (products && products.length > 0) {
      products.forEach((p) => {
        const skuOrId = p.sku && p.sku.trim() !== "" ? p.sku.trim() : `ID-${p.id.substring(0, 8)}`;
        const sanitizedName = (p.name || "Produto").replace(/"/g, '""');
        const basePrice = p.price ? Number(p.price).toFixed(2) : "";

        rows.push([
          `"${sanitizedName}"`,
          `"${skuOrId}"`,
          basePrice ? `"${basePrice}"` : '""',
          '""',
          '""',
          '""',
          '""',
        ]);
      });
    } else {
      rows.push(
        ['"MOTO ELETRICA MODELO 1"', '"MSKU-001"', '"5490.00"', '"4500.00"', '"4200.00"', '"4000.00"', '"3800.00"'],
        ['"SCOOTER URBANA SPORT"', '"MSKU-002"', '"6290.00"', '"5200.00"', '"4900.00"', '"4700.00"', '"4500.00"'],
        ['"CAPACETE ELETRICO PRO"', '"ID-EXEMPLO"', '"220.00"', '"180.00"', '"160.00"', '"150.00"', '"140.00"']
      );
    }

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="modelo_precos_b2b_ancoragem.csv"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Erro interno ao gerar modelo." }, { status: 500 });
  }
}
