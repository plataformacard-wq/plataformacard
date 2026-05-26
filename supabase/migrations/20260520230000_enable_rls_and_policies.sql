-- 1. PLANS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'plans') THEN
    ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to plans" ON public.plans;
    CREATE POLICY "Allow public read access to plans" ON public.plans FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Only superadmins can write to plans" ON public.plans;
    CREATE POLICY "Only superadmins can write to plans" ON public.plans FOR ALL USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 2. PLATFORM ADMINS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_admins') THEN
    ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated read to platform_admins" ON public.platform_admins;
    CREATE POLICY "Allow authenticated read to platform_admins" ON public.platform_admins FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS "Only superadmins can write to platform_admins" ON public.platform_admins;
    CREATE POLICY "Only superadmins can write to platform_admins" ON public.platform_admins FOR ALL USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 3. PLATFORM ALERTS LOG
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_alerts_log') THEN
    ALTER TABLE public.platform_alerts_log ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Only superadmins can manage platform_alerts_log" ON public.platform_alerts_log;
    CREATE POLICY "Only superadmins can manage platform_alerts_log" ON public.platform_alerts_log FOR ALL USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 4. ORGANIZATIONS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to organizations" ON public.organizations;
    CREATE POLICY "Allow public read access to organizations" ON public.organizations FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow authenticated users to create organizations during onboarding" ON public.organizations;
    CREATE POLICY "Allow authenticated users to create organizations during onboarding" ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow organization members or superadmins to update organizations" ON public.organizations;
    CREATE POLICY "Allow organization members or superadmins to update organizations" ON public.organizations FOR UPDATE USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and (profiles.organization_id = id or profiles.role::text in ('superadmin', 'super_admin')))
    );
    DROP POLICY IF EXISTS "Allow only superadmins to delete organizations" ON public.organizations;
    CREATE POLICY "Allow only superadmins to delete organizations" ON public.organizations FOR DELETE USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 5. PROFILES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
    CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow users to create their own profile during onboarding" ON public.profiles;
    CREATE POLICY "Allow users to create their own profile during onboarding" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR auth.uid() = id);
    DROP POLICY IF EXISTS "Allow users to update their own profile or superadmins" ON public.profiles;
    CREATE POLICY "Allow users to update their own profile or superadmins" ON public.profiles FOR UPDATE USING (
      auth.uid() = user_id OR auth.uid() = id OR exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('superadmin', 'super_admin'))
    );
    DROP POLICY IF EXISTS "Allow users to delete their own profile or superadmins" ON public.profiles;
    CREATE POLICY "Allow users to delete their own profile or superadmins" ON public.profiles FOR DELETE USING (
      auth.uid() = user_id OR auth.uid() = id OR exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 6. CATALOGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalogs') THEN
    ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to catalogs" ON public.catalogs;
    CREATE POLICY "Allow public read access to catalogs" ON public.catalogs FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow authenticated users to create catalogs" ON public.catalogs;
    CREATE POLICY "Allow authenticated users to create catalogs" ON public.catalogs FOR INSERT TO authenticated WITH CHECK (
      owner_id = auth.uid() OR exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
    DROP POLICY IF EXISTS "Allow owner or superadmins to manage catalogs" ON public.catalogs;
    CREATE POLICY "Allow owner or superadmins to manage catalogs" ON public.catalogs FOR ALL USING (
      owner_id = auth.uid() OR exists (select 1 from public.profiles where profiles.id = auth.uid() and (profiles.organization_id = (select organization_id from public.organization_catalogs oc where oc.catalog_id = id limit 1) or profiles.role::text in ('superadmin', 'super_admin')))
    );
  END IF;
END $$;

-- 7. CATEGORIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
    CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow owners or superadmins to manage categories" ON public.categories;
    CREATE POLICY "Allow owners or superadmins to manage categories" ON public.categories FOR ALL USING (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and (
          profiles.role::text in ('superadmin', 'super_admin')
          or profiles.organization_id = (
            select oc.organization_id
            from public.organization_catalogs oc
            where oc.catalog_id = categories.catalog_id
            limit 1
          )
        )
      )
    );
  END IF;
END $$;

-- 8. PRODUCTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
    CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow members or superadmins to manage products" ON public.products;
    CREATE POLICY "Allow members or superadmins to manage products" ON public.products FOR ALL USING (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and (
          profiles.role::text in ('superadmin', 'super_admin')
          or profiles.organization_id = products.organization_id
        )
      )
    );
  END IF;
END $$;

-- 9. LEADS TRACKING
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads_tracking') THEN
    ALTER TABLE public.leads_tracking ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow members or superadmins to read leads" ON public.leads_tracking;
    CREATE POLICY "Allow members or superadmins to read leads" ON public.leads_tracking FOR SELECT USING (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and (
          profiles.role::text in ('superadmin', 'super_admin')
          or profiles.organization_id = leads_tracking.organization_id
        )
      )
    );
    DROP POLICY IF EXISTS "Allow anyone to create leads" ON public.leads_tracking;
    CREATE POLICY "Allow anyone to create leads" ON public.leads_tracking FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Only superadmins can update/delete leads" ON public.leads_tracking;
    CREATE POLICY "Only superadmins can update/delete leads" ON public.leads_tracking FOR ALL USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 10. ANALYTICS EVENTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_events') THEN
    ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow members or superadmins to read analytics_events" ON public.analytics_events;
    CREATE POLICY "Allow members or superadmins to read analytics_events" ON public.analytics_events FOR SELECT USING (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and (
          profiles.role::text in ('superadmin', 'super_admin')
          or profiles.organization_id = analytics_events.organization_id
        )
      )
    );
    DROP POLICY IF EXISTS "Allow anyone to insert analytics_events" ON public.analytics_events;
    CREATE POLICY "Allow anyone to insert analytics_events" ON public.analytics_events FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Only superadmins can update/delete analytics_events" ON public.analytics_events;
    CREATE POLICY "Only superadmins can update/delete analytics_events" ON public.analytics_events FOR ALL USING (
      exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;

-- 11. ANALYTICS CHECKPOINTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'analytics_checkpoints') THEN
    ALTER TABLE public.analytics_checkpoints ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow members or superadmins to manage analytics_checkpoints" ON public.analytics_checkpoints;
    CREATE POLICY "Allow members or superadmins to manage analytics_checkpoints" ON public.analytics_checkpoints FOR ALL USING (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and (
          profiles.role::text in ('superadmin', 'super_admin')
          or profiles.organization_id = analytics_checkpoints.organization_id
        )
      )
    );
  END IF;
END $$;

-- 12. ORGANIZATION CATALOGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_catalogs') THEN
    ALTER TABLE public.organization_catalogs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to organization_catalogs" ON public.organization_catalogs;
    CREATE POLICY "Allow public read access to organization_catalogs" ON public.organization_catalogs FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow members or superadmins to manage organization_catalogs" ON public.organization_catalogs;
    CREATE POLICY "Allow members or superadmins to manage organization_catalogs" ON public.organization_catalogs FOR ALL USING (
      exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and (
          profiles.role::text in ('superadmin', 'super_admin')
          or profiles.organization_id = organization_catalogs.organization_id
        )
      )
    );
  END IF;
END $$;

-- 13. PROFILE CATALOGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_catalogs') THEN
    ALTER TABLE public.profile_catalogs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access to profile_catalogs" ON public.profile_catalogs;
    CREATE POLICY "Allow public read access to profile_catalogs" ON public.profile_catalogs FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow profile owner or superadmins to manage profile_catalogs" ON public.profile_catalogs;
    CREATE POLICY "Allow profile owner or superadmins to manage profile_catalogs" ON public.profile_catalogs FOR ALL USING (
      profile_id = auth.uid() OR exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role::text in ('superadmin', 'super_admin'))
    );
  END IF;
END $$;
