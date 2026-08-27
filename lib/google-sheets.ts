import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface SheetPriceRow {
  sku: string;
  prices: Record<string, number>;
}

export function extractSheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Função para buscar e sincronizar a planilha do Google Sheets com o Supabase.
 * Suporta o formato exportado em CSV público ou via Google Sheets API.
 */
export async function syncGoogleSheetsPrices(
  organizationId: string, 
  rawSheetInput: string, 
  tabName: string = 'Precos'
): Promise<{ success: boolean; totalSynced: number; customTables?: { key: string; label: string }[]; message: string }> {
  try {
    const sheetId = extractSheetId(rawSheetInput);
    if (!sheetId) {
      return { success: false, totalSynced: 0, message: 'Link ou ID da planilha não informado.' };
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

    const rawHeaders = rows[0].map(h => h.trim());
    const lowerHeaders = rawHeaders.map(h => h.toLowerCase());
    
    // Encontrar índices de colunas chave
    const skuIdx = lowerHeaders.findIndex(h => h.includes('sku') || h.includes('codigo') || h.includes('código') || h === 'id');
    const produtoIdx = lowerHeaders.findIndex(h => h.includes('produto') || h.includes('nome') || h.includes('descri'));

    if (skuIdx === -1 && produtoIdx === -1) {
      return { success: false, totalSynced: 0, message: 'Coluna "SKU" ou "PRODUTO" não encontrada no cabeçalho da planilha.' };
    }

    const effectiveSkuIdx = skuIdx !== -1 ? skuIdx : produtoIdx;

    // Detectar dinamicamente todas as colunas de tabela de preço
    const priceColumns: { key: string; label: string; aliases: string[]; index: number }[] = [];
    const detectedCustomTables: { key: string; label: string }[] = [];

    rawHeaders.forEach((rawLabel, index) => {
      if (index === effectiveSkuIdx || index === produtoIdx || rawLabel.length === 0) return;
      
      const lower = rawLabel.toLowerCase();
      let primaryKey = rawLabel.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const aliases: string[] = [];

      if (lower.includes('sugerido') || lower.includes('mercado') || lower.includes('ancora') || lower.includes('âncora') || lower.includes('referencia') || lower.includes('referência') || lower.includes('pvp') || (lower.includes('varejo') && !lower.includes('atacado'))) {
        primaryKey = 'anchor_price';
        aliases.push('anchor_price', 'varejo', 'sugerido', 'mercado');
      } else if (lower.includes('valor 1') || lower.includes('valor1') || lower.includes('tabela 1') || lower.includes('tabela_1') || lower.includes('tabela x') || lower.includes('tabela_x') || lower === 'x') {
        primaryKey = 'valor_1';
        aliases.push('tabela_x', 'valor_1');
      } else if (lower.includes('valor 2') || lower.includes('valor2') || lower.includes('tabela 2') || lower.includes('tabela_2') || lower.includes('tabela y') || lower.includes('tabela_y') || lower === 'y') {
        primaryKey = 'valor_2';
        aliases.push('tabela_y', 'valor_2');
      } else if (lower.includes('valor 3') || lower.includes('valor3') || lower.includes('tabela 3') || lower.includes('tabela_3') || lower.includes('tabela z') || lower.includes('tabela_z') || lower === 'z' || lower.includes('plus')) {
        primaryKey = 'valor_3';
        aliases.push('tabela_z', 'valor_3');
      } else if (lower.includes('valor 4') || lower.includes('valor4') || lower.includes('tabela 4') || lower.includes('tabela_4')) {
        primaryKey = 'valor_4';
        aliases.push('valor_4');
      } else if (lower.includes('bling') || lower.includes('base')) {
        primaryKey = 'bling';
        aliases.push('bling');
      }

      priceColumns.push({
        key: primaryKey,
        label: rawLabel,
        aliases,
        index,
      });

      // Apenas adiciona aos seletores de tabela se não for a coluna de ancoragem de mercado
      if (primaryKey !== 'anchor_price') {
        detectedCustomTables.push({
          key: primaryKey,
          label: rawLabel,
        });
      }
    });

    if (priceColumns.length === 0) {
      return { success: false, totalSynced: 0, message: 'Nenhuma coluna de preço (ex: Varejo, Atacado, Valor 1) foi identificada na planilha.' };
    }

    const priceUpserts: { organization_id: string; sku: string; prices: Record<string, number>; updated_at: string }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const sku = row[effectiveSkuIdx]?.trim();
      if (!sku) continue;

      const pricesMap: Record<string, number> = {};
      priceColumns.forEach(col => {
        const rawVal = row[col.index];
        if (rawVal) {
          // Limpa formato R$ 1.234,56 -> 1234.56
          const cleanNum = parseFloat(rawVal.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.'));
          if (!isNaN(cleanNum)) {
            pricesMap[col.key] = cleanNum;
            col.aliases.forEach(alias => {
              pricesMap[alias] = cleanNum;
            });
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
      return { success: false, totalSynced: 0, message: 'Nenhum produto com preços válidos foi identificado.' };
    }

    // Upsert dos preços por SKU no Supabase
    const { error: upsertErr } = await supabase
      .from('b2b_sku_prices')
      .upsert(priceUpserts, { onConflict: 'organization_id,sku' });

    if (upsertErr) {
      console.error('Erro ao salvar preços no Supabase:', upsertErr);
      return { success: false, totalSynced: 0, message: `Erro ao salvar no banco: ${upsertErr.message}` };
    }

    // Salvar configuração com as tabelas customizadas detectadas
    const configPayload: any = {
      organization_id: organizationId,
      sheet_id: sheetId,
      tab_name: tabName,
      last_synced_at: new Date().toISOString(),
      custom_tables: detectedCustomTables,
    };

    const { error: configErr } = await supabase
      .from('b2b_sheets_config')
      .upsert(configPayload, { onConflict: 'organization_id' });

    if (configErr) {
      // Se a coluna custom_tables ainda não existir, faz fallback sem custom_tables
      await supabase
        .from('b2b_sheets_config')
        .upsert({
          organization_id: organizationId,
          sheet_id: sheetId,
          tab_name: tabName,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'organization_id' });
    }

    const tableNamesList = detectedCustomTables.map(t => t.label).join(', ');

    return { 
      success: true, 
      totalSynced: priceUpserts.length, 
      customTables: detectedCustomTables,
      message: `Sucesso! ${priceUpserts.length} produtos sincronizados com as tabelas: ${tableNamesList}.` 
    };

  } catch (error: any) {
    console.error('Erro na sincronização Google Sheets:', error);
    return { success: false, totalSynced: 0, message: `Erro inesperado: ${error.message}` };
  }
}

/**
 * Parser de CSV simples e robusto para lidar com aspas e quebras
 */
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  // Normalizar quebras de linha
  const sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const nextChar = sanitized[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // pular aspa dupla escapada
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(current);
      lines.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current || row.length > 0) {
    row.push(current);
    lines.push(row);
  }

  return lines.filter(r => r.some(cell => cell.trim().length > 0));
}
