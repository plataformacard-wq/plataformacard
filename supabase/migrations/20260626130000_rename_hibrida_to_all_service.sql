-- Remover a constraint antiga primeiro para permitir novos valores
ALTER TABLE "public"."organizations" DROP CONSTRAINT IF EXISTS "organizations_business_model_check";

-- Atualizar HIBRIDA para ALL_SERVICE
UPDATE "public"."organizations"
SET business_model = 'ALL_SERVICE'
WHERE business_model = 'HIBRIDA';

-- Adicionar a nova constraint com os valores atualizados (removendo HIBRIDA e aceitando ALL_SERVICE)
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_business_model_check" CHECK (business_model IN ('B2B', 'B2C', 'CaaS', 'ALL_SERVICE'));
