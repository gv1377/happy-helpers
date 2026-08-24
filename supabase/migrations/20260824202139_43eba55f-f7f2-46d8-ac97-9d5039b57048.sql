CREATE POLICY "fiorella_storage_select_own_folder"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('avatars','clothing','originals','processed-clothing','detected-items','references','try-on-results','wishlist','outfit-sharing')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "fiorella_storage_insert_own_folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('avatars','clothing','originals','processed-clothing','detected-items','references','try-on-results','wishlist','outfit-sharing')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "fiorella_storage_update_own_folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id IN ('avatars','clothing','originals','processed-clothing','detected-items','references','try-on-results','wishlist','outfit-sharing')
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('avatars','clothing','originals','processed-clothing','detected-items','references','try-on-results','wishlist','outfit-sharing')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "fiorella_storage_delete_own_folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN ('avatars','clothing','originals','processed-clothing','detected-items','references','try-on-results','wishlist','outfit-sharing')
  AND (storage.foldername(name))[1] = auth.uid()::text
);