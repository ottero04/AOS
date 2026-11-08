import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request)
    if (denied) return denied

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no válido' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es demasiado grande (máx. 5MB)' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    }
    const extension = extensions[file.type]
    const filename = `projects/${timestamp}.${extension}`

    // Upload to Vercel Blob (public access for images)
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
