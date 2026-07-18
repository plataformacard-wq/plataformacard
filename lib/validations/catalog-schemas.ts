import { z } from "zod";

export const setActiveCatalogSchema = z.object({
  targetOrgId: z.string().uuid("ID da organização alvo inválido"),
  profileId: z.string().uuid("ID do perfil inválido"),
  orgCatalogId: z.string().uuid("ID do catálogo da organização inválido"),
});

export const createCatalogSchema = z.object({
  name: z.string().min(3, "O nome do catálogo deve ter no mínimo 3 caracteres").max(100, "O nome do catálogo é muito longo"),
  description: z.string().max(500, "A descrição não pode ultrapassar 500 caracteres").optional().nullable(),
  isPlatform: z.boolean({
    message: "A flag isPlatform é obrigatória e deve ser um booleano"
  }),
});
