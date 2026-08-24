-- =========================================================
-- Fiorella Closet AI — fundação de dados
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------- profiles -------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  preferred_style TEXT,
  top_size TEXT,
  bottom_size TEXT,
  shoe_size TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------- clothing_items -------------------------
CREATE TABLE public.clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  color TEXT,
  secondary_color TEXT,
  brand TEXT,
  size TEXT,
  material TEXT,
  season TEXT,
  occasion TEXT,
  price NUMERIC(10,2) CHECK (price IS NULL OR price >= 0),
  purchase_date DATE,
  image_url TEXT,
  original_image_url TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  last_used_at TIMESTAMPTZ,
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clothing_items TO authenticated;
GRANT ALL ON public.clothing_items TO service_role;
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clothing_items_select_own" ON public.clothing_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "clothing_items_insert_own" ON public.clothing_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clothing_items_update_own" ON public.clothing_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clothing_items_delete_own" ON public.clothing_items FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER clothing_items_set_updated_at BEFORE UPDATE ON public.clothing_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_clothing_items_user ON public.clothing_items(user_id);
CREATE INDEX idx_clothing_items_user_category ON public.clothing_items(user_id, category);
CREATE INDEX idx_clothing_items_user_favorite ON public.clothing_items(user_id, is_favorite);
CREATE INDEX idx_clothing_items_last_used ON public.clothing_items(user_id, last_used_at DESC NULLS LAST);

-- ------------------------- outfits -------------------------
CREATE TABLE public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  season TEXT,
  cover_image_url TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ai')),
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfits TO authenticated;
GRANT ALL ON public.outfits TO service_role;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outfits_select_own" ON public.outfits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "outfits_insert_own" ON public.outfits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outfits_update_own" ON public.outfits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "outfits_delete_own" ON public.outfits FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER outfits_set_updated_at BEFORE UPDATE ON public.outfits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_outfits_user ON public.outfits(user_id);
CREATE INDEX idx_outfits_user_favorite ON public.outfits(user_id, is_favorite);

-- ------------------------- outfit_items -------------------------
CREATE TABLE public.outfit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0 AND position < 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (outfit_id, clothing_item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfit_items TO authenticated;
GRANT ALL ON public.outfit_items TO service_role;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outfit_items_select_own" ON public.outfit_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid()));
CREATE POLICY "outfit_items_insert_own" ON public.outfit_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.clothing_items c WHERE c.id = clothing_item_id AND c.user_id = auth.uid())
  );
CREATE POLICY "outfit_items_update_own" ON public.outfit_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid()));
CREATE POLICY "outfit_items_delete_own" ON public.outfit_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid()));
CREATE INDEX idx_outfit_items_outfit ON public.outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_clothing ON public.outfit_items(clothing_item_id);

CREATE OR REPLACE FUNCTION public.enforce_outfit_item_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  item_count INTEGER;
BEGIN
  SELECT count(*) INTO item_count FROM public.outfit_items WHERE outfit_id = NEW.outfit_id;
  IF item_count >= 6 THEN
    RAISE EXCEPTION 'Um look pode ter no maximo 6 pecas';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER outfit_items_limit BEFORE INSERT ON public.outfit_items FOR EACH ROW EXECUTE FUNCTION public.enforce_outfit_item_limit();

-- ------------------------- wear_history -------------------------
CREATE TABLE public.wear_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  worn_on DATE NOT NULL DEFAULT CURRENT_DATE,
  occasion TEXT,
  weather TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wear_history_target_present CHECK (clothing_item_id IS NOT NULL OR outfit_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wear_history TO authenticated;
GRANT ALL ON public.wear_history TO service_role;
ALTER TABLE public.wear_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wear_history_select_own" ON public.wear_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wear_history_insert_own" ON public.wear_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wear_history_update_own" ON public.wear_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wear_history_delete_own" ON public.wear_history FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER wear_history_set_updated_at BEFORE UPDATE ON public.wear_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_wear_history_user_date ON public.wear_history(user_id, worn_on DESC);
CREATE INDEX idx_wear_history_item ON public.wear_history(clothing_item_id);
CREATE INDEX idx_wear_history_outfit ON public.wear_history(outfit_id);

-- ------------------------- collections -------------------------
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections_select_own" ON public.collections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "collections_insert_own" ON public.collections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own" ON public.collections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_delete_own" ON public.collections FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER collections_set_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_collections_user ON public.collections(user_id);

CREATE TABLE public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (collection_id, clothing_item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_items TO authenticated;
GRANT ALL ON public.collection_items TO service_role;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collection_items_select_own" ON public.collection_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));
CREATE POLICY "collection_items_insert_own" ON public.collection_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.clothing_items ci WHERE ci.id = clothing_item_id AND ci.user_id = auth.uid())
  );
CREATE POLICY "collection_items_update_own" ON public.collection_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));
CREATE POLICY "collection_items_delete_own" ON public.collection_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.user_id = auth.uid()));
CREATE INDEX idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_clothing ON public.collection_items(clothing_item_id);

-- ------------------------- wishlist -------------------------
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  color TEXT,
  price NUMERIC(10,2) CHECK (price IS NULL OR price >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  store_url TEXT,
  image_url TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status TEXT NOT NULL DEFAULT 'wanted' CHECK (status IN ('wanted','purchased','discarded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_select_own" ON public.wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wishlist_insert_own" ON public.wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_update_own" ON public.wishlist FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_delete_own" ON public.wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER wishlist_set_updated_at BEFORE UPDATE ON public.wishlist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);

-- ------------------------- events -------------------------
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  location TEXT,
  dress_code TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_own" ON public.events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "events_insert_own" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_update_own" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_events_user_start ON public.events(user_id, starts_at);

CREATE OR REPLACE FUNCTION public.validate_event_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NEW.starts_at THEN
    RAISE EXCEPTION 'A data final nao pode ser anterior a inicial';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER events_validate_dates BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.validate_event_dates();

-- ------------------------- trips -------------------------
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  destination TEXT,
  notes TEXT,
  starts_on DATE NOT NULL,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips_select_own" ON public.trips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "trips_insert_own" ON public.trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_update_own" ON public.trips FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trips_delete_own" ON public.trips FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trips_set_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_trips_user_start ON public.trips(user_id, starts_on DESC);

CREATE OR REPLACE FUNCTION public.validate_trip_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ends_on IS NOT NULL AND NEW.ends_on < NEW.starts_on THEN
    RAISE EXCEPTION 'A data final nao pode ser anterior a inicial';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trips_validate_dates BEFORE INSERT OR UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.validate_trip_dates();

CREATE TABLE public.trip_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  packed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT trip_items_target_present CHECK (clothing_item_id IS NOT NULL OR outfit_id IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_items TO authenticated;
GRANT ALL ON public.trip_items TO service_role;
ALTER TABLE public.trip_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_items_select_own" ON public.trip_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE POLICY "trip_items_insert_own" ON public.trip_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE POLICY "trip_items_update_own" ON public.trip_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE POLICY "trip_items_delete_own" ON public.trip_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.user_id = auth.uid()));
CREATE INDEX idx_trip_items_trip ON public.trip_items(trip_id);

-- ------------------------- IA (preparadas, sem uso ainda) -------------------------
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'outfit',
  prompt TEXT,
  response JSONB,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.ai_recommendations TO service_role;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_recommendations_select_own" ON public.ai_recommendations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ai_recommendations_insert_own" ON public.ai_recommendations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_recommendations_update_own" ON public.ai_recommendations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_recommendations_delete_own" ON public.ai_recommendations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER ai_recommendations_set_updated_at BEFORE UPDATE ON public.ai_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ai_recommendations_user ON public.ai_recommendations(user_id, created_at DESC);

CREATE TABLE public.detected_clothing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_image_url TEXT NOT NULL,
  cropped_image_url TEXT,
  detected_category TEXT,
  detected_color TEXT,
  confidence NUMERIC(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  bounding_box JSONB,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','discarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.detected_clothing TO authenticated;
GRANT ALL ON public.detected_clothing TO service_role;
ALTER TABLE public.detected_clothing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detected_clothing_select_own" ON public.detected_clothing FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "detected_clothing_insert_own" ON public.detected_clothing FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "detected_clothing_update_own" ON public.detected_clothing FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "detected_clothing_delete_own" ON public.detected_clothing FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER detected_clothing_set_updated_at BEFORE UPDATE ON public.detected_clothing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_detected_clothing_user ON public.detected_clothing(user_id, created_at DESC);

CREATE TABLE public.user_reference_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  label TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_reference_images TO authenticated;
GRANT ALL ON public.user_reference_images TO service_role;
ALTER TABLE public.user_reference_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_reference_images_select_own" ON public.user_reference_images FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_reference_images_insert_own" ON public.user_reference_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_reference_images_update_own" ON public.user_reference_images FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_reference_images_delete_own" ON public.user_reference_images FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER user_reference_images_set_updated_at BEFORE UPDATE ON public.user_reference_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_user_reference_images_user ON public.user_reference_images(user_id);

CREATE TABLE public.virtual_tryons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reference_image_id UUID REFERENCES public.user_reference_images(id) ON DELETE SET NULL,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE SET NULL,
  result_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.virtual_tryons TO authenticated;
GRANT ALL ON public.virtual_tryons TO service_role;
ALTER TABLE public.virtual_tryons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "virtual_tryons_select_own" ON public.virtual_tryons FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "virtual_tryons_insert_own" ON public.virtual_tryons FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "virtual_tryons_update_own" ON public.virtual_tryons FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "virtual_tryons_delete_own" ON public.virtual_tryons FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER virtual_tryons_set_updated_at BEFORE UPDATE ON public.virtual_tryons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_virtual_tryons_user ON public.virtual_tryons(user_id, created_at DESC);