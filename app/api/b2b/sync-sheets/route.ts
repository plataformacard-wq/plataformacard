import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleSheetsPrices } from '@/lib/google-sheets';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, sheetId, tabName } = body;

    if (!organizationId || !sheetId) {
      return NextResponse.json({ success: false, error: 'organizationId e sheetId são obrigatórios.' }, { status: 400 });
    }

    const result = await syncGoogleSheetsPrices(organizationId, sheetId, tabName || 'Precos');

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno no servidor.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'organizationId é obrigatório.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('b2b_sheets_config')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, config: data || null });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
