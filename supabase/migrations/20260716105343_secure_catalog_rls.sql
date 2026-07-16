-- Migration: Secure Catalog RLS Policies based on Granular Permissions
-- Date: 2026-07-16

-- PRODUCTS: Split "FOR ALL" into explicit INSERT, UPDATE, DELETE to check granular permissions
DROP POLICY IF EXISTS "Allow members or main_admins to manage products" ON public.products;

-- 1. INSERT for products
CREATE POLICY "Allow members or main_admins to insert products" ON public.products FOR INSERT WITH CHECK (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id = products.organization_id
        and (
          profiles.role::text != 'seller'
          or coalesce((profiles.granular_permissions->'catalog'->>'create')::boolean, true)
        )
      )
    )
  )
);

-- 2. UPDATE for products
CREATE POLICY "Allow members or main_admins to update products" ON public.products FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id = products.organization_id
        and (
          profiles.role::text != 'seller'
          or coalesce((profiles.granular_permissions->'catalog'->>'edit')::boolean, true)
        )
      )
    )
  )
);

-- 3. DELETE for products
CREATE POLICY "Allow members or main_admins to delete products" ON public.products FOR DELETE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id = products.organization_id
        and (
          profiles.role::text != 'seller'
          or coalesce((profiles.granular_permissions->'catalog'->>'delete')::boolean, true)
        )
      )
    )
  )
);

-- CATEGORIES: Split "FOR ALL" into explicit INSERT, UPDATE, DELETE to check granular permissions
DROP POLICY IF EXISTS "Allow owners or main_admins to manage categories" ON public.categories;

-- 1. INSERT for categories
CREATE POLICY "Allow owners or main_admins to insert categories" ON public.categories FOR INSERT WITH CHECK (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id in (
          select oc.organization_id from public.organization_catalogs oc
          where oc.catalog_id = categories.catalog_id
        )
        and (
          profiles.role::text != 'seller'
          or coalesce((profiles.granular_permissions->'catalog'->>'create')::boolean, true)
        )
      )
    )
  )
);

-- 2. UPDATE for categories
CREATE POLICY "Allow owners or main_admins to update categories" ON public.categories FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id in (
          select oc.organization_id from public.organization_catalogs oc
          where oc.catalog_id = categories.catalog_id
        )
        and (
          profiles.role::text != 'seller'
          or coalesce((profiles.granular_permissions->'catalog'->>'edit')::boolean, true)
        )
      )
    )
  )
);

-- 3. DELETE for categories
CREATE POLICY "Allow owners or main_admins to delete categories" ON public.categories FOR DELETE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id in (
          select oc.organization_id from public.organization_catalogs oc
          where oc.catalog_id = categories.catalog_id
        )
        and (
          profiles.role::text != 'seller'
          or coalesce((profiles.granular_permissions->'catalog'->>'delete')::boolean, true)
        )
      )
    )
  )
);
