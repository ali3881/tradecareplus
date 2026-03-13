import { S3Client } from "@aws-sdk/client-s3";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, "");
}

export function hasS3StorageConfig() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID !== "replace_me" &&
      process.env.AWS_SECRET_ACCESS_KEY !== "replace_me" &&
      process.env.S3_BUCKET !== "replace_me"
  );
}

export function createStorageClient() {
  if (!hasS3StorageConfig()) {
    return null;
  }

  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT;
  const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || "false").toLowerCase() === "true";

  return new S3Client({
    region: process.env.AWS_REGION!,
    endpoint: endpoint || undefined,
    forcePathStyle,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export function getStoragePublicUrl(key: string) {
  const normalizedKey = trimLeadingSlash(key);
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT;

  if (publicBaseUrl) {
    const base = trimTrailingSlash(publicBaseUrl);
    const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || "false").toLowerCase() === "true";
    return forcePathStyle
      ? `${base}/${process.env.S3_BUCKET}/${normalizedKey}`
      : `${base}/${normalizedKey}`;
  }

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${normalizedKey}`;
}

export function buildStorageKey(path: string) {
  const normalizedPath = trimLeadingSlash(path);
  return normalizedPath.startsWith("uploads/") ? normalizedPath : `uploads/${normalizedPath}`;
}
