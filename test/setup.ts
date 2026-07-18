import { vi } from 'vitest';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente locais (para acessar o Supabase no teste E2E)
dotenv.config({ path: '.env.local' });

// Mock global para recursos exclusivos do Next.js que quebram no Node/Vitest
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));
