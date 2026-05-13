import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

// Allowed MIME types for document uploads
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

// ─── Generate a presigned PUT URL for the client to upload directly to S3 ────
// The client uploads directly — never proxied through your server.

export async function getUploadPresignedUrl(
  folder: "certifications" | "deal-docs" | "logos",
  contentType: string,
  fileSizeBytes: number
): Promise<{ uploadUrl: string; s3Key: string }> {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error(`File type ${contentType} not allowed`);
  }
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds 20 MB limit`);
  }

  const ext = contentType.split("/")[1].replace("jpeg", "jpg");
  const s3Key = `${folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ContentType: contentType,
    ContentLength: fileSizeBytes,
    // server-side encryption
    ServerSideEncryption: "AES256",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
  return { uploadUrl, s3Key };
}

// ─── Generate a presigned GET URL for secure document download ────────────────

export async function getDownloadPresignedUrl(
  s3Key: string,
  fileName: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });
  return getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min
}

// ─── Delete a file from S3 ────────────────────────────────────────────────────

export async function deleteS3Object(s3Key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }));
}

// ─── Build a permanent S3 URI for internal reference ─────────────────────────

export function s3Uri(s3Key: string): string {
  return `s3://${BUCKET}/${s3Key}`;
}
