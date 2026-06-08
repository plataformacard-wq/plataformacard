-- Migration: SQL functions for bulk price adjustments in CaaS (Catalog as a Service)

-- 1. Apply Promotion / Price Adjustment for CaaS (Saves overrides)
CREATE OR REPLACE FUNCTION apply_bulk_price_adjustment_caas(
  p_org_id UUID,
  p_catalog_id UUID, -- O catálogo master
  p_category_id UUID DEFAULT NULL, -- categoria master
  p_product_id UUID DEFAULT NULL, -- produto master
  p_adjustment_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
  p_value NUMERIC DEFAULT 0, -- e.g., -10 for 10% discount, +10 for 10% increase
  p_is_promotion BOOLEAN DEFAULT false,
  p_target_channel TEXT DEFAULT 'both' -- 'b2c', 'b2b', 'both'
) RETURNS VOID AS $$
BEGIN
  -- Validations
  IF p_org_id IS NULL THEN
    RAISE EXCEPTION 'p_org_id is required';
  END IF;

  IF p_catalog_id IS NULL THEN
    RAISE EXCEPTION 'p_catalog_id is required';
  END IF;

  IF p_adjustment_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'p_adjustment_type must be percentage or fixed';
  END IF;

  IF p_target_channel NOT IN ('b2c', 'b2b', 'both') THEN
    RAISE EXCEPTION 'p_target_channel must be b2c, b2b or both';
  END IF;

  -- Upsert override values
  INSERT INTO public.organization_product_overrides (
    organization_id,
    product_id,
    price_b2c,
    price_b2b,
    compare_at_price,
    is_available,
    is_in_stock
  )
  SELECT
    p_org_id,
    p.id,
    -- New price_b2c (retail)
    CASE 
      WHEN p_target_channel IN ('b2c', 'both') AND p.price IS NOT NULL THEN
        CASE
          WHEN p_adjustment_type = 'percentage' THEN GREATEST(0, COALESCE(o.price_b2c, p.price) * (1 + (p_value / 100.0)))
          WHEN p_adjustment_type = 'fixed' THEN GREATEST(0, COALESCE(o.price_b2c, p.price) + p_value)
          ELSE COALESCE(o.price_b2c, p.price)
        END
      ELSE o.price_b2c
    END,
    -- New price_b2b (wholesale)
    CASE 
      WHEN p_target_channel IN ('b2b', 'both') AND p.wholesale_price IS NOT NULL THEN
        CASE
          WHEN p_adjustment_type = 'percentage' THEN GREATEST(0, COALESCE(o.price_b2b, p.wholesale_price) * (1 + (p_value / 100.0)))
          WHEN p_adjustment_type = 'fixed' THEN GREATEST(0, COALESCE(o.price_b2b, p.wholesale_price) + p_value)
          ELSE COALESCE(o.price_b2b, p.wholesale_price)
        END
      ELSE o.price_b2b
    END,
    -- New compare_at_price (only for B2C promotion)
    CASE
      WHEN p_target_channel IN ('b2c', 'both') AND p.price IS NOT NULL THEN
        CASE 
          WHEN p_is_promotion = true AND COALESCE(o.compare_at_price, p.compare_at_price) IS NULL THEN COALESCE(o.price_b2c, p.price)
          ELSE COALESCE(o.compare_at_price, p.compare_at_price)
        END
      ELSE o.compare_at_price
    END,
    COALESCE(o.is_available, true),
    COALESCE(o.is_in_stock, true)
  FROM public.products p
  JOIN public.categories c ON p.category_id = c.id
  LEFT JOIN public.organization_product_overrides o ON o.product_id = p.id AND o.organization_id = p_org_id
  WHERE c.catalog_id = p_catalog_id
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_product_id IS NULL OR p.id = p_product_id)
    AND p.is_active = true
    AND p.deleted_at IS NULL
  ON CONFLICT (organization_id, product_id) DO UPDATE SET
    price_b2c = EXCLUDED.price_b2c,
    price_b2b = EXCLUDED.price_b2b,
    compare_at_price = EXCLUDED.compare_at_price,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Revert Promotion for CaaS (Restores overrides price from compare_at_price)
CREATE OR REPLACE FUNCTION revert_bulk_promotions_caas(
  p_org_id UUID,
  p_catalog_id UUID, -- O catálogo master
  p_category_id UUID DEFAULT NULL, -- categoria master
  p_product_id UUID DEFAULT NULL -- produto master
) RETURNS VOID AS $$
BEGIN
  -- Validations
  IF p_org_id IS NULL THEN
    RAISE EXCEPTION 'p_org_id is required';
  END IF;

  IF p_catalog_id IS NULL THEN
    RAISE EXCEPTION 'p_catalog_id is required';
  END IF;

  -- Revert B2C prices to compare_at_price and set compare_at_price to null
  UPDATE public.organization_product_overrides o
  SET 
    price_b2c = o.compare_at_price,
    compare_at_price = NULL,
    updated_at = NOW()
  FROM public.products p
  JOIN public.categories c ON p.category_id = c.id
  WHERE o.product_id = p.id
    AND o.organization_id = p_org_id
    AND c.catalog_id = p_catalog_id
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_product_id IS NULL OR p.id = p_product_id)
    AND o.compare_at_price IS NOT NULL;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
