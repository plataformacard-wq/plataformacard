-- Atualiza o plano Starter (Start)
UPDATE public.plans
SET 
  name = 'Start',
  max_products = 20,
  max_users = 2,
  max_images_per_product = 1
WHERE id = '32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0';

-- Atualiza o plano Pro (Basic)
UPDATE public.plans
SET 
  name = 'Basic',
  max_products = 100,
  max_users = 10,
  max_images_per_product = 3
WHERE id = '6f3dfe4e-905c-486e-923f-2cfb6e5d3e62';

-- Atualiza o plano Business (Enterprise)
UPDATE public.plans
SET 
  name = 'Enterprise',
  max_products = 0, -- 0 significa ilimitado na lógica de front-end
  max_users = 0,
  max_images_per_product = 10
WHERE id = 'd35c09c2-51a0-4f38-b5d9-dcc3526e7d26';
