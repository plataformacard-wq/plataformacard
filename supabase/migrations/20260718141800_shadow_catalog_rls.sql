-- Migration: Shadow RLS Policies for Catalogs
-- Description: Creates strict versions of existing catalog policies without dropping the old ones.
-- This allows testing and logging before enforcing strictly.

-- 1. SHADOW INSERT for products
CREATE POLICY "strict_allow_members_insert_products" ON public.products FOR INSERT WITH CHECK (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id = products.organization_id
        and (
          profiles.role::text != 'seller'
          or (profiles.granular_permissions->'catalog'->>'create')::boolean = true
        )
      )
    )
  )
);

-- 2. SHADOW UPDATE for products
CREATE POLICY "strict_allow_members_update_products" ON public.products FOR UPDATE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id = products.organization_id
        and (
          profiles.role::text != 'seller'
          or (profiles.granular_permissions->'catalog'->>'edit')::boolean = true
        )
      )
    )
  )
);

-- 3. SHADOW DELETE for products
CREATE POLICY "strict_allow_members_delete_products" ON public.products FOR DELETE USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and (
      profiles.role::text = 'main_admin'
      or (
        profiles.organization_id = products.organization_id
        and (
          profiles.role::text != 'seller'
          or (profiles.granular_permissions->'catalog'->>'delete')::boolean = true
        )
      )
    )
  )
);

-- 4. SHADOW INSERT for categories
CREATE POLICY "strict_allow_owners_insert_categories" ON public.categories FOR INSERT WITH CHECK (
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
          or (profiles.granular_permissions->'catalog'->>'create')::boolean = true
        )
      )
    )
  )
);

-- 5. SHADOW UPDATE for categories
CREATE POLICY "strict_allow_owners_update_categories" ON public.categories FOR UPDATE USING (
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
          or (profiles.granular_permissions->'catalog'->>'edit')::boolean = true
        )
      )
    )
  )
);

-- 6. SHADOW DELETE for categories
CREATE POLICY "strict_allow_owners_delete_categories" ON public.categories FOR DELETE USING (
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
          or (profiles.granular_permissions->'catalog'->>'delete')::boolean = true
        )
      )
    )
  )
);
