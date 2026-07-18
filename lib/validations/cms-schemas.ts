import { z } from "zod";

export const updateSettingsSchema = z.object({
  hero_headline: z.string().min(5, "Título principal muito curto").max(200, "Título principal muito longo"),
  hero_subtitle: z.string().min(5, "Subtítulo muito curto").max(500, "Subtítulo muito longo"),
  seo_title: z.string().min(5, "Título SEO muito curto").max(100, "Título SEO muito longo"),
  base_users: z.number().int().nonnegative("Número deve ser positivo"),
  base_catalogs: z.number().int().nonnegative("Número deve ser positivo"),
  hero_mockup_url: z.string().url().nullable().optional().or(z.literal("")),
  social_instagram: z.string().url().nullable().optional().or(z.literal("")),
  social_facebook: z.string().url().nullable().optional().or(z.literal("")),
  social_linkedin: z.string().url().nullable().optional().or(z.literal("")),
  social_youtube: z.string().url().nullable().optional().or(z.literal("")),
  social_tiktok: z.string().url().nullable().optional().or(z.literal("")),
  social_x: z.string().url().nullable().optional().or(z.literal("")),
});

export const upsertTestimonialSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  initials: z.string().min(1, "Iniciais são obrigatórias").max(3, "Iniciais devem ter até 3 letras"),
  color: z.string().min(3, "Cor obrigatória").max(50, "Classe de cor muito longa"),
  text: z.string().max(1000, "Depoimento muito longo").optional(),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  stars: z.number().int().min(1, "Mínimo de 1 estrela").max(5, "Máximo de 5 estrelas"),
  is_active: z.boolean({ message: "O valor is_active deve ser um booleano" }),
});

export const upsertPartnerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  image_url: z.string().url("A URL da imagem é inválida").refine(val => val.startsWith("http://") || val.startsWith("https://"), { message: "A URL deve ser segura (http ou https)" }),
  is_active: z.boolean({ message: "O valor is_active deve ser um booleano" }),
});

export const upsertFaqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(5, "Pergunta muito curta").max(300, "Pergunta muito longa"),
  answer: z.string().min(5, "Resposta muito curta").max(1000, "Resposta muito longa"),
  display_order: z.number().int().default(0),
  is_active: z.boolean(),
});

export const upsertPlanSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome curto").max(100, "Nome longo"),
  price_text: z.string().min(1, "Preço obrigatório").max(50, "Preço longo"),
  subtitle: z.string().min(5, "Subtítulo curto").max(200, "Subtítulo longo"),
  badge_text: z.string().max(100).nullable().optional(),
  theme: z.enum(["dark", "green"]),
  features: z.array(z.string().max(300, "Feature longa")).max(30, "Muitas features"),
  button_text: z.string().min(2, "Botão curto").max(50, "Botão longo"),
  button_url: z.string().min(1, "URL obrigatória").max(500, "URL longa"),
  display_order: z.number().int().default(0),
  is_active: z.boolean(),
});
