import { GetObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getS3 } from "@/lib/s3";

const types: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(name)) return new NextResponse("Not found", { status: 404 });

  try {
    const { client, bucket } = getS3();
    const object = await client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: `products/${name}`,
    }));
    if (!object.Body) throw new Error("S3 object has no body.");
    const body = await object.Body.transformToByteArray();
    const responseBody = new Uint8Array(body).buffer;
    return new NextResponse(responseBody, {
      headers: {
        "Content-Type": object.ContentType ?? types[name.split(".").pop()!],
        "Cache-Control": object.CacheControl ?? "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Preserve access to images uploaded before S3 was configured.
  }

  try {
    const file = await readFile(path.join(process.cwd(), "uploads", "products", name));
    return new NextResponse(file, { headers: { "Content-Type": types[name.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
