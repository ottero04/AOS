"use client"

import Image from "next/image"
import { MoreVertical, Pencil, Trash2, Globe, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onToggleStatus: (projectId: string, status: "draft" | "published") => void
  onToggleFeatured?: (projectId: string, featured: boolean) => void
}

export function ProjectCard({ project, onEdit, onDelete, onToggleStatus, onToggleFeatured }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted" style={{ position: 'relative' }}>
        {project.mainImage ? (
          <Image
            src={project.mainImage}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        {onToggleFeatured && (
          <button
            type="button"
            onClick={() => onToggleFeatured(project.id, !project.featured)}
            title={project.featured ? "Quitar de destacados" : "Marcar como destacado"}
            className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-colors ${
              project.featured ? "bg-amber-400 text-amber-950" : "bg-white/85 text-slate-600 hover:bg-white"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${project.featured ? "fill-current" : ""}`} />
            {project.featured ? "Destacado" : "Destacar"}
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 bg-white/80 hover:bg-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(project.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onToggleStatus(
                project.id, 
                project.status === "published" ? "draft" : "published"
              )}
            >
              <Globe className="mr-2 h-4 w-4" />
              {project.status === "published" ? "Despublicar" : "Publicar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-primary line-clamp-2">{project.title}</h3>
          <Badge 
            variant={project.status === "published" ? "default" : "secondary"}
            className={project.status === "published" 
              ? "bg-green-100 text-green-700 hover:bg-green-100" 
              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
            }
          >
            {project.status === "published" ? "Publicado" : "Borrador"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.shortDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(project.id)}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            Eliminar
          </Button>
          <Button
            size="sm"
            onClick={() => onToggleStatus(
              project.id, 
              project.status === "published" ? "draft" : "published"
            )}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {project.status === "published" ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
