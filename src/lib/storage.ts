import { supabase } from "@/integrations/supabase/client";

export const BUCKETS = {
  avatars: "avatars",
  clothing: "clothing",
  originals: "originals",
  processed: "processed-clothing",
  detected: "detected-items",
  references: "references",
  tryOn: "try-on-results",
  wishlist: "wishlist",
  outfitSharing: "outfit-sharing",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return (fromType ?? "jpg").toLowerCase();
}

/** Uploads into the caller's own folder — the first path segment MUST be the user id. */
export async function uploadUserFile(
  bucket: BucketName,
  userId: string,
  file: File,
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${extensionOf(file)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export async function removeUserFile(bucket: BucketName, path: string | null | undefined) {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}

export async function createSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 60 * 60,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
