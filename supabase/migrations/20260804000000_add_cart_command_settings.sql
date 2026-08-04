-- Migration: Add Shopping Cart / WhatsApp Order Command Settings to Catalogs
-- Data: 2026-08-04

ALTER TABLE public.catalogs 
  ADD COLUMN IF NOT EXISTS enable_shopping_cart BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cart_min_order_value NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS cart_delivery_options JSONB DEFAULT '["retirada", "entrega"]'::jsonb,
  ADD COLUMN IF NOT EXISTS cart_payment_methods JSONB DEFAULT '["pix", "cartao", "dinheiro"]'::jsonb;

COMMENT ON COLUMN public.catalogs.enable_shopping_cart IS 'Habilita o recurso de carrinho de compras / comanda WhatsApp multi-produtos no catálogo público';
COMMENT ON COLUMN public.catalogs.cart_min_order_value IS 'Valor mínimo do pedido necessário para finalizar a comanda no WhatsApp';
COMMENT ON COLUMN public.catalogs.cart_delivery_options IS 'Opções de entrega aceitas pelo lojista (ex: retirada, entrega)';
COMMENT ON COLUMN public.catalogs.cart_payment_methods IS 'Formas de pagamento aceitas pelo lojista (ex: pix, cartao, dinheiro)';
