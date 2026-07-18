import { z } from "zod";

export const bootstrapMainAdminSchema = z.object({
  secret: z.string().min(1, "A chave secreta é obrigatória"),
  email: z.string().email("O e-mail fornecido é inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  fullName: z.string().min(3, "O nome completo deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
});
