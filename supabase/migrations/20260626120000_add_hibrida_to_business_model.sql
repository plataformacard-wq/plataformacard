-- Atualizar constraint de business_model para permitir HIBRIDA
ALTER TABLE "public"."organizations" DROP CONSTRAINT IF EXISTS "organizations_business_model_check";
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_business_model_check" CHECK (business_model IN ('B2B', 'B2C', 'CaaS', 'HIBRIDA'));
