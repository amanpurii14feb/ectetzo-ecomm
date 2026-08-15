import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
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
  const directory = path.join(process.cwd(), "uploads", "products");
  await mkdir(directory, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const optimized = await sharp(input, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({
          width: MAX_OUTPUT_EDGE,
          height: MAX_OUTPUT_EDGE,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4, smartSubsample: true })
        .toBuffer();
      const name = `${randomUUID()}.webp`;
      await writeFile(path.join(directory, name), optimized);
      urls.push(`/api/uploads/${name}`);
    } catch {
      return NextResponse.json({ error: `${file.name} is not a valid image.` }, { status: 400 });
    }
  }
  return NextResponse.json({ urls }, { status: 201 });
}
