import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | undefined;

export function getS3() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  if (!region || !bucket) {
    throw new Error("AWS_REGION and AWS_S3_BUCKET_NAME must be configured.");
  }

  client ??= new S3Client({ region });
  return { client, bucket };
}
