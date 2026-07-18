import { z } from "zod";

export const toggleInvoiceStatusSchema = z.object({
  invoiceId: z.string().uuid("ID da fatura inválido"),
  newStatus: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"], {
    message: "Status inválido",
  }),
});

export const generateManualInvoiceSchema = z.object({
  orgId: z.string().uuid("ID da organização inválido"),
  amount: z.number().positive("O valor deve ser positivo"),
  description: z.string().min(3, "A descrição deve ter no mínimo 3 caracteres").max(255, "Descrição muito longa"),
  dueDate: z.date({
    message: "Data de vencimento é obrigatória e deve ser uma data válida"
  }),
});

export const toggleAutoUpsellSchema = z.object({
  orgId: z.string().uuid("ID da organização inválido"),
  enabled: z.boolean({
    message: "O valor deve ser um booleano (true/false)"
  }),
});
