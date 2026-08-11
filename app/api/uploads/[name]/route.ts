import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const types: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(name)) return new NextResponse("Not found", { status: 404 });
  try {
    const file = await readFile(path.join(process.cwd(), "uploads", "products", name));
    return new NextResponse(file, { headers: { "Content-Type": types[name.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
