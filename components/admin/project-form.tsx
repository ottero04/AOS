"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, ImageIcon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Project } from "@/lib/types"

interface ProjectFormProps {
  project?: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (project: Partial<Project>) => Promise<void>
}

export function ProjectForm({ project, open, onOpenChange, onSave }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: project?.title || "",
    shortDescription: project?.shortDescription || "",
    longDescription: project?.longDescription || "",
    mainImage: project?.mainImage || "",
    additionalImages: project?.additionalImages || [],
    liveUrl: project?.liveUrl || "",
    status: project?.status || "draft",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(project?.mainImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to blob storage
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      })

      if (response.ok) {
        const { url } = await response.json()
        setFormData({ ...formData, mainImage: url })
      }
    } catch (error) {
      console.error("Upload error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave({
        ...formData,
        id: project?.id,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      shortDescription: "",
      longDescription: "",
      mainImage: "",
      additionalImages: [],
      liveUrl: "",
      status: "draft",
    })
    setImagePreview(null)
    onOpenChange(false)
  }

  // Reset form when project changes
  useState(() => {
    if (project) {
      setFormData({
        title: project.title,
        shortDescription: project.shortDescription,
        longDescription: project.longDescription,
        mainImage: project.mainImage,
        additionalImages: project.additionalImages,
        liveUrl: project.liveUrl,
        status: project.status,
      })
      setImagePreview(project.mainImage)
    }
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {project ? "Editar Proyecto" : "Add Project Flow"}
          </DialogTitle>
          <DialogDescription>
            {project ? "Modifica los datos del proyecto" : "Añade un nuevo proyecto a tu portafolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Proyecto</Label>
            <Input
              id="title"
              placeholder="Título del Proyecto"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Descripción Larga (Editor de Texto)</Label>
            <Textarea
              id="longDescription"
              placeholder="Descripción detallada del proyecto..."
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Descripción Corta</Label>
            <Input
              id="shortDescription"
              placeholder="Breve descripción del proyecto"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Imagen Principal (Uploader)</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors hover:border-muted-foreground/50"
            >
              {imagePreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg" style={{ position: 'relative' }}>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImagePreview(null)
                      setFormData({ ...formData, mainImage: "" })
                    }}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1 hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Haz clic para subir una imagen</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label>Imágenes Adicionales (Multi-uploader)</Label>
            <div className="flex items-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <button
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50"
              >
                <Upload className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveUrl">Link de Funcionamiento (URL)</Label>
            <Input
              id="liveUrl"
              type="url"
              placeholder="https://ejemplo.com"
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "draft" | "published") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Guardar Borrador
            </Button>
            <Button
              type="submit"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
