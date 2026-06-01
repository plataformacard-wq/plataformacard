-- Migration: Create Master Catalog Notifications and Trigger

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS master_catalog_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  catalog_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create select policy
ALTER TABLE master_catalog_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de notificações para todos" ON master_catalog_notifications;
CREATE POLICY "Permitir leitura de notificações para todos" ON master_catalog_notifications FOR SELECT USING (true);

-- 2. Create trigger function to track master catalog changes
CREATE OR REPLACE FUNCTION log_master_product_change()
RETURNS TRIGGER AS $$
DECLARE
  v_catalog_type TEXT;
  v_catalog_name TEXT;
BEGIN
  -- We only care about products belonging to a platform/master catalog
  IF TG_OP = 'DELETE' THEN
    SELECT c.catalog_type, c.name INTO v_catalog_type, v_catalog_name
    FROM categories cat
    JOIN catalogs c ON cat.catalog_id = c.id
    WHERE cat.id = OLD.category_id;
  ELSE
    SELECT c.catalog_type, c.name INTO v_catalog_type, v_catalog_name
    FROM categories cat
    JOIN catalogs c ON cat.catalog_id = c.id
    WHERE cat.id = NEW.category_id;
  END IF;

  -- If it's a platform catalog, log the change
  IF v_catalog_type = 'platform' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO master_catalog_notifications (action_type, product_id, product_name, catalog_name, details)
      VALUES ('INSERT', NEW.id, NEW.name, v_catalog_name, jsonb_build_object('price', NEW.price));
    ELSIF TG_OP = 'UPDATE' THEN
      -- Log if key fields changed
      IF OLD.name IS DISTINCT FROM NEW.name OR
         OLD.price IS DISTINCT FROM NEW.price OR
         OLD.deleted_at IS DISTINCT FROM NEW.deleted_at OR
         OLD.is_active IS DISTINCT FROM NEW.is_active THEN
         
         IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
           INSERT INTO master_catalog_notifications (action_type, product_id, product_name, catalog_name, details)
           VALUES ('DELETE', NEW.id, NEW.name, v_catalog_name, jsonb_build_object('reason', 'soft_deleted'));
         ELSIF NEW.is_active = false AND OLD.is_active = true THEN
           INSERT INTO master_catalog_notifications (action_type, product_id, product_name, catalog_name, details)
           VALUES ('DELETE', NEW.id, NEW.name, v_catalog_name, jsonb_build_object('reason', 'inactivated'));
         ELSIF OLD.is_active = false AND NEW.is_active = true THEN
           INSERT INTO master_catalog_notifications (action_type, product_id, product_name, catalog_name, details)
           VALUES ('INSERT', NEW.id, NEW.name, v_catalog_name, jsonb_build_object('reason', 'activated'));
         ELSE
           INSERT INTO master_catalog_notifications (action_type, product_id, product_name, catalog_name, details)
           VALUES ('UPDATE', NEW.id, NEW.name, v_catalog_name, jsonb_build_object('old_price', OLD.price, 'new_price', NEW.price));
         END IF;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO master_catalog_notifications (action_type, product_id, product_name, catalog_name, details)
      VALUES ('DELETE', OLD.id, OLD.name, v_catalog_name, jsonb_build_object('reason', 'hard_deleted'));
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind trigger to products table
DROP TRIGGER IF EXISTS trg_log_master_product_change ON products;
CREATE TRIGGER trg_log_master_product_change
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_master_product_change();
