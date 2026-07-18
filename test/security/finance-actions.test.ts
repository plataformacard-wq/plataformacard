import { describe, it, expect } from 'vitest';
import { generateManualInvoice, toggleInvoiceStatus } from '@/lib/finance-actions';

describe('Security: Finance Actions Input Validation', () => {
  it('Deve bloquear a criação de fatura com ID de organização forjado/inválido', async () => {
    const result = await generateManualInvoice('sql-injection-or-invalid-id', 100, 'Teste', new Date());
    
    // Como a action usa Zod, ela deve retornar { success: false, error: ... }
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.error).toContain('ID da organização inválido');
  });

  it('Deve bloquear a criação de fatura com valor negativo', async () => {
    const fakeValidUUID = '123e4567-e89b-12d3-a456-426614174000';
    const result = await generateManualInvoice(fakeValidUUID, -500, 'Tentativa de Hack', new Date());
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('O valor deve ser positivo');
  });

  it('Deve bloquear alteração de status com payload desconhecido', async () => {
    const fakeValidUUID = '123e4567-e89b-12d3-a456-426614174000';
    // Cast to any to bypass TS compilation error in test, simulating a JS runtime attack
    const result = await toggleInvoiceStatus(fakeValidUUID, 'HACKED_STATUS' as any);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid option');
  });
});
