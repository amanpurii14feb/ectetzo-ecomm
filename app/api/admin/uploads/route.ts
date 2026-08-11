import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

const allowed = new Map([["image/png", "png"], ["image/jpeg", "jpg"], ["image/webp", "webp"]]);

export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const files = form.getAll("files").filter((item): item is File => item instanceof File);
  if (!files.length) return NextResponse.json({ error: "Select at least one image." }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Up to 10 images are allowed." }, { status: 400 });
  for (const file of files) {
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Only PNG, JPG and WEBP images are allowed." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: `${file.name} is larger than 10 MB.` }, { status: 400 });
  }
  const directory = path.join(process.cwd(), "uploads", "products");
  await mkdir(directory, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    const name = `${randomUUID()}.${allowed.get(file.type)}`;
    await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/api/uploads/${name}`);
  }
  return NextResponse.json({ urls }, { status: 201 });
}
