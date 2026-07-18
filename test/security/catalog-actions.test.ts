import { describe, it, expect } from 'vitest';
import { setActiveCatalog } from '@/app/dashboard/catalogo/gerenciador/actions';

describe('Security: Catalog Actions Input Validation', () => {
  it('Deve bloquear a troca de catálogo se parâmetros não forem UUIDs válidos', async () => {
    // Simulando uma tentativa de ataque com strings vazias ou maliciosas
    const result = await setActiveCatalog('', 'not-a-uuid', 'drop-table-payload');
    
    // Zod schema deve capturar isso
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    
    // Pelo menos uma das mensagens de erro do Zod será de "inválido"
    expect(result.error).toMatch(/inválido/i);
  });
});
