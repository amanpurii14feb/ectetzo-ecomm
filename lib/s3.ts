import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | undefined;

export function getS3() {
  const region = process.env.S3_REGION ?? process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!region || !bucket) {
    throw new Error("S3 region and bucket name must be configured.");
  }

  if ((accessKeyId && !secretAccessKey) || (!accessKeyId && secretAccessKey)) {
    throw new Error("Both S3 access-key variables must be configured together.");
  }

  client ??= new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
  return { client, bucket };
}
