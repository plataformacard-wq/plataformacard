-- Migration: Bulk Price Adjustments & Promotions

-- 1. Apply Promotion / Price Adjustment
CREATE OR REPLACE FUNCTION apply_bulk_price_adjustment(
  p_catalog_id UUID,
  p_category_id UUID DEFAULT NULL,
  p_product_id UUID DEFAULT NULL,
  p_adjustment_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
  p_value NUMERIC DEFAULT 0, -- e.g., -10 for 10% discount, +10 for 10% increase
  p_is_promotion BOOLEAN DEFAULT false
) RETURNS VOID AS $$
BEGIN
  -- Validations
  IF p_catalog_id IS NULL THEN
    RAISE EXCEPTION 'p_catalog_id is required';
  END IF;

  IF p_adjustment_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'p_adjustment_type must be percentage or fixed';
  END IF;

  -- Update Logic
  UPDATE products p
  SET 
    -- If it's a promotion, we save the current price to compare_at_price ONLY IF it doesn't already have one
    -- This prevents overwriting the original price if multiple discounts are applied consecutively.
    compare_at_price = CASE 
      WHEN p_is_promotion = true AND p.compare_at_price IS NULL THEN p.price
      WHEN p_is_promotion = false THEN p.compare_at_price
      ELSE p.compare_at_price
    END,
    price = CASE
      WHEN p_adjustment_type = 'percentage' THEN GREATEST(0, p.price * (1 + (p_value / 100.0)))
      WHEN p_adjustment_type = 'fixed' THEN GREATEST(0, p.price + p_value)
      ELSE p.price
    END,
    updated_at = NOW()
  FROM categories c
  WHERE p.category_id = c.id
    AND c.catalog_id = p_catalog_id
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_product_id IS NULL OR p.id = p_product_id)
    AND p.price IS NOT NULL;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Revert Promotion
CREATE OR REPLACE FUNCTION revert_bulk_promotions(
  p_catalog_id UUID,
  p_category_id UUID DEFAULT NULL,
  p_product_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF p_catalog_id IS NULL THEN
    RAISE EXCEPTION 'p_catalog_id is required';
  END IF;

  UPDATE products p
  SET 
    price = p.compare_at_price,
    compare_at_price = NULL,
    updated_at = NOW()
  FROM categories c
  WHERE p.category_id = c.id
    AND c.catalog_id = p_catalog_id
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_product_id IS NULL OR p.id = p_product_id)
    AND p.compare_at_price IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
