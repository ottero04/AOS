"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, Plus, Star, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Project } from "@/lib/types"

interface ProjectFormProps {
  project?: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (project: Partial<Project>) => Promise<void>
}

type FormState = {
  title: string
  shortDescription: string
  longDescription: string
  mainImage: string
  additionalImages: string[]
  liveUrl: string
  featured: boolean
  tags: string
}

const EMPTY: FormState = {
  title: "",
  shortDescription: "",
  longDescription: "",
  mainImage: "",
  additionalImages: [],
  liveUrl: "",
  featured: false,
  tags: "",
}

function fromProject(p: Project): FormState {
  return {
    title: p.title ?? "",
    shortDescription: p.shortDescription ?? "",
    longDescription: p.longDescription ?? "",
    mainImage: p.mainImage ?? "",
    additionalImages: p.additionalImages ?? [],
    liveUrl: p.liveUrl ?? "",
    featured: Boolean(p.featured),
    tags: (p.tags ?? []).join(", "),
  }
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append("file", file)
  const res = await fetch("/api/upload", { method: "POST", body, credentials: "include" })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen")
  return data.url
}

export function ProjectForm({ project, open, onOpenChange, onSave }: ProjectFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState<"draft" | "published" | null>(null)
  const [uploading, setUploading] = useState<"main" | "extra" | null>(null)
  const [error, setError] = useState("")
  const mainInput = useRef<HTMLInputElement>(null)
  const extraInput = useRef<HTMLInputElement>(null)

  // Cada vez que se abre el formulario, se cargan los datos del proyecto (o se limpia si es nuevo)
  useEffect(() => {
    if (open) {
      setForm(project ? fromProject(project) : EMPTY)
      setError("")
    }
  }, [open, project])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function handleMain(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading("main")
    setError("")
    try {
      set("mainImage", await uploadImage(file))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(null)
    }
  }

  async function handleExtra(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - form.additionalImages.length)
    e.target.value = ""
    if (files.length === 0) return
    setUploading("extra")
    setError("")
    try {
      const urls: string[] = []
      for (const f of files) urls.push(await uploadImage(f))
      setForm((prev) => ({ ...prev, additionalImages: [...prev.additionalImages, ...urls] }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(null)
    }
  }

  async function submit(status: "draft" | "published") {
    if (!form.title.trim()) {
      setError("El título es obligatorio")
      return
    }
    setSaving(status)
    setError("")
    try {
      await onSave({
        id: project?.id,
        title: form.title,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        mainImage: form.mainImage,
        additionalImages: form.additionalImages,
        liveUrl: form.liveUrl,
        featured: form.featured,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status,
      })
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar")
    } finally {
      setSaving(null)
    }
  }

  const busy = saving !== null || uploading !== null

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">{project ? "Editar proyecto" : "Nuevo proyecto"}</DialogTitle>
          <DialogDescription>
            {project
              ? `Estado actual: ${project.status === "published" ? "publicado" : "borrador"}. Cambia lo que necesites y guarda.`
              : "Añade un nuevo proyecto a tu portafolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del proyecto *</Label>
            <Input id="title" maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descripción corta</Label>
            <Input
              id="shortDescription"
              maxLength={300}
              placeholder="Una línea que aparece en la tarjeta del proyecto"
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Descripción completa</Label>
            <Textarea
              id="longDescription"
              rows={5}
              maxLength={5000}
              placeholder="Qué problema resolvió, qué incluye, tecnologías usadas... Se muestra en la página del proyecto."
              value={form.longDescription}
              onChange={(e) => set("longDescription", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Enlace del sitio</Label>
              <Input id="liveUrl" type="url" placeholder="https://..." value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
              <Input id="tags" placeholder="Landing page, E-commerce, Next.js" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagen principal</Label>
            <div
              onClick={() => !busy && mainInput.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center transition-colors hover:border-muted-foreground/50"
            >
              {uploading === "main" ? (
                <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" /> Subiendo...
                </div>
              ) : form.mainImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image src={form.mainImage} alt="Imagen principal" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      set("mainImage", "")
                    }}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 hover:bg-white"
                    aria-label="Quitar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">Clic para cambiar</span>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Haz clic para subir una imagen (JPG, PNG o WebP, máx. 5 MB)</span>
                </div>
              )}
            </div>
            <input ref={mainInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleMain} className="hidden" />
          </div>

          <div className="space-y-2">
            <Label>Galería (hasta 6 imágenes)</Label>
            <div className="flex flex-wrap gap-3">
              {form.additionalImages.map((url, i) => (
                <div key={url + i} className="relative h-20 w-28 overflow-hidden rounded-lg border">
                  <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => set("additionalImages", form.additionalImages.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 hover:bg-white"
                    aria-label="Quitar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {form.additionalImages.length < 6 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => extraInput.current?.click()}
                  className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 text-xs text-muted-foreground hover:border-muted-foreground/50"
                >
                  {uploading === "extra" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  Agregar
                </button>
              )}
            </div>
            <input ref={extraInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleExtra} className="hidden" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold">Proyecto destacado</p>
                <p className="text-xs text-muted-foreground">Aparece en el carrusel de la página principal (se recomiendan 4).</p>
              </div>
            </div>
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>

          {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="button" variant="outline" onClick={() => submit("draft")} disabled={busy}>
              {saving === "draft" ? "Guardando..." : "Guardar como borrador"}
            </Button>
            <Button
              type="button"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => submit("published")}
              disabled={busy}
            >
              {saving === "published" ? "Guardando..." : project?.status === "published" ? "Guardar cambios" : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
