import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface SheetPriceRow {
  sku: string;
  prices: Record<string, number>;
}

/**
 * Função para buscar e sincronizar a planilha do Google Sheets com o Supabase.
 * Suporta o formato exportado em CSV público ou via Google Sheets API.
 */
export async function syncGoogleSheetsPrices(organizationId: string, sheetId: string, tabName: string = 'Precos'): Promise<{ success: boolean; totalSynced: number; message: string }> {
  try {
    if (!sheetId) {
      return { success: false, totalSynced: 0, message: 'ID da planilha não informado.' };
    }

    // URL de exportação direta do Google Sheets em CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) {
      return { 
        success: false, 
        totalSynced: 0, 
        message: `Não foi possível acessar a planilha. Verifique se a planilha está pública (Qualquer pessoa com o link pode ver). HTTP ${response.status}` 
      };
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return { success: false, totalSynced: 0, message: 'A planilha está vazia ou não possui cabeçalho válido.' };
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    // Encontrar índices de colunas chave
    const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('codigo') || h.includes('código'));
    if (skuIdx === -1) {
      return { success: false, totalSynced: 0, message: 'Coluna "SKU" ou "Codigo" não encontrada no cabeçalho da planilha.' };
    }

    const priceColumns: { key: string; index: number }[] = [];
    headers.forEach((header, index) => {
      if (index === skuIdx) return;
      if (header.includes('bling') || header.includes('base') || header.includes('varejo')) {
        priceColumns.push({ key: 'bling', index });
      } else if (header.includes('tabela x') || header.includes('tabela_x') || header === 'x') {
        priceColumns.push({ key: 'tabela_x', index });
      } else if (header.includes('tabela y') || header.includes('tabela_y') || header === 'y') {
        priceColumns.push({ key: 'tabela_y', index });
      } else if (header.includes('tabela z') || header.includes('tabela_z') || header === 'z' || header.includes('plus')) {
        priceColumns.push({ key: 'tabela_z', index });
      }
    });

    if (priceColumns.length === 0) {
      // Se não encontrou cabeçalhos com nomes específicos, usa as colunas numéricas encontradas
      headers.forEach((header, index) => {
        if (index !== skuIdx && header.length > 0) {
          const cleanKey = header.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
          priceColumns.push({ key: cleanKey, index });
        }
      });
    }

    const priceUpserts: { organization_id: string; sku: string; prices: Record<string, number>; updated_at: string }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const sku = row[skuIdx]?.trim();
      if (!sku) continue;

      const pricesMap: Record<string, number> = {};
      priceColumns.forEach(col => {
        const rawVal = row[col.index];
        if (rawVal) {
          // Limpa formato R$ 1.234,56 -> 1234.56
          const cleanNum = parseFloat(rawVal.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.'));
          if (!isNaN(cleanNum)) {
            pricesMap[col.key] = cleanNum;
          }
        }
      });

      if (Object.keys(pricesMap).length > 0) {
        priceUpserts.push({
          organization_id: organizationId,
          sku,
          prices: pricesMap,
          updated_at: new Date().toISOString()
        });
      }
    }

    if (priceUpserts.length === 0) {
      return { success: false, totalSynced: 0, message: 'Nenhum SKU válido com preços foi identificado.' };
    }

    // Upsert no Supabase
    const { error } = await supabase
      .from('b2b_sku_prices')
      .upsert(priceUpserts, { onConflict: 'organization_id,sku' });

    if (error) {
      console.error('Erro ao salvar preços no Supabase:', error);
      return { success: false, totalSynced: 0, message: `Erro ao salvar no banco: ${error.message}` };
    }

    // Atualizar registro de sincronização
    await supabase
      .from('b2b_sheets_config')
      .upsert({
        organization_id: organizationId,
        sheet_id: sheetId,
        tab_name: tabName,
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'organization_id' });

    return { 
      success: true, 
      totalSynced: priceUpserts.length, 
      message: `${priceUpserts.length} SKUs sincronizados com sucesso!` 
    };

  } catch (err: any) {
    console.error('Falha na sincronização do Google Sheets:', err);
    return { success: false, totalSynced: 0, message: err?.message || 'Erro interno na sincronização.' };
  }
}

/**
 * Utilitário para parsear texto CSV simples lidando com aspas
 */
function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.replace(/^"|"$/g, '').trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.replace(/^"|"$/g, '').trim());
    result.push(row);
  }

  return result;
}
