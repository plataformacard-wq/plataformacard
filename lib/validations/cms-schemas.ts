import { z } from "zod";

export const updateSettingsSchema = z.object({
  hero_headline: z.string().min(5, "Título principal muito curto").max(200, "Título principal muito longo"),
  hero_subtitle: z.string().min(5, "Subtítulo muito curto").max(500, "Subtítulo muito longo"),
  seo_title: z.string().min(5, "Título SEO muito curto").max(100, "Título SEO muito longo"),
  base_users: z.number().int().nonnegative("Número deve ser positivo"),
  base_catalogs: z.number().int().nonnegative("Número deve ser positivo"),
});

export const upsertTestimonialSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  initials: z.string().min(1, "Iniciais são obrigatórias").max(3, "Iniciais devem ter até 3 letras"),
  color: z.string().min(3, "Cor obrigatória").max(50, "Classe de cor muito longa"),
  text: z.string().min(10, "Depoimento muito curto").max(1000, "Depoimento muito longo"),
  stars: z.number().int().min(1, "Mínimo de 1 estrela").max(5, "Máximo de 5 estrelas"),
  is_active: z.boolean({ message: "O valor is_active deve ser um booleano" }),
});

export const upsertPartnerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  image_url: z.string().url("A URL da imagem é inválida").refine(val => val.startsWith("http://") || val.startsWith("https://"), { message: "A URL deve ser segura (http ou https)" }),
  is_active: z.boolean({ message: "O valor is_active deve ser um booleano" }),
});
