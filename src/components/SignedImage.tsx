import { useQuery } from "@tanstack/react-query";
import { createSignedUrl, type BucketName } from "@/lib/storage";

export function useSignedUrl(bucket: BucketName, path: string | null | undefined) {
  return useQuery({
    queryKey: ["signed-url", bucket, path],
    queryFn: () => createSignedUrl(bucket, path as string),
    enabled: Boolean(path),
    staleTime: 50 * 60 * 1000,
  });
}

export function SignedImage({
  bucket,
  path,
  alt,
  className,
  fallback,
}: {
  bucket: BucketName;
  path: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const { data: url } = useSignedUrl(bucket, path);
  if (!url) {
    return (
      <div className={`image-placeholder ${className ?? ""}`} aria-hidden="true">
        <span>{fallback ?? "✦"}</span>
      </div>
    );
  }
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
