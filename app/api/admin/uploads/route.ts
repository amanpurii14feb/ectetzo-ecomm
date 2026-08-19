import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { getS3 } from "@/lib/s3";
import sharp from "sharp";

export const runtime = "nodejs";

const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_EDGE = 1600;

export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const files = form.getAll("files").filter((item): item is File => item instanceof File);
  if (!files.length) return NextResponse.json({ error: "Select at least one image." }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Up to 10 images are allowed." }, { status: 400 });
  for (const file of files) {
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Only PNG, JPG and WEBP images are allowed." }, { status: 400 });
    if (file.size > MAX_INPUT_BYTES) return NextResponse.json({ error: `${file.name} is larger than 10 MB.` }, { status: 400 });
  }
  const urls: string[] = [];
  for (const file of files) {
    let optimized: Buffer;
    try {
      const input = Buffer.from(await file.arrayBuffer());
      optimized = await sharp(input, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({
          width: MAX_OUTPUT_EDGE,
          height: MAX_OUTPUT_EDGE,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4, smartSubsample: true })
        .toBuffer();
    } catch {
      return NextResponse.json({ error: `${file.name} is not a valid image.` }, { status: 400 });
    }

    const name = `${randomUUID()}.webp`;
    try {
      const { client, bucket } = getS3();
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `products/${name}`,
        Body: optimized,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }));
      urls.push(`/api/uploads/${name}`);
    } catch (error) {
      console.error("S3 product image upload failed", error);
      return NextResponse.json(
        { error: "Could not store the image. Check the S3 configuration." },
        { status: 502 },
      );
    }
  }
  return NextResponse.json({ urls }, { status: 201 });
}
