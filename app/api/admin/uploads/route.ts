import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/security"
import { listUploadedImages } from "@/lib/projects"

// Lista las imágenes ya subidas, para poder reutilizarlas (por ejemplo al recrear un proyecto perdido)
export async function GET(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  return NextResponse.json({ images: await listUploadedImages() })
}
