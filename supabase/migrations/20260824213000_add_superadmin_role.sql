ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'superadmin'));

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'superadmin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'clothing_items', 'outfits', 'outfit_items', 'wear_history',
    'collections', 'collection_items', 'wishlist', 'events', 'trips', 'trip_items',
    'ai_recommendations', 'detected_clothing', 'user_reference_images', 'virtual_tryons'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS superadmin_full_access ON public.%I', table_name);
    EXECUTE format(
      'CREATE POLICY superadmin_full_access ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_superadmin())) WITH CHECK ((SELECT public.is_superadmin()))',
      table_name
    );
  END LOOP;
END $$;

-- The initial superadmin is promoted only when the matching auth user exists.
UPDATE public.profiles
SET role = 'superadmin', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users
  WHERE lower(email) = lower('fiorellapellin@gmail.com')
  LIMIT 1
);
