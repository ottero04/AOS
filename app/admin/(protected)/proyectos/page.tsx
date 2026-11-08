"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, FolderKanban, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/admin/project-card"
import { ProjectForm } from "@/components/admin/project-form"
import type { Project } from "@/lib/types"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setFormOpen(true)
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm("Estas seguro de que deseas eliminar este proyecto?")) return

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchProjects()
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const handleToggleStatus = async (projectId: string, status: "draft" | "published") => {
    try {
      const response = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, status }),
      })
      if (response.ok) {
        fetchProjects()
      }
    } catch (error) {
      console.error("Error updating project status:", error)
    }
  }

  const handleSave = async (projectData: Partial<Project>) => {
    try {
      const method = projectData.id ? "PUT" : "POST"
      const response = await fetch("/api/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "No se pudo guardar el proyecto")
      }
      fetchProjects()
    } catch (error) {
      console.error("Error saving project:", error)
      throw error
    }
  }

  const handleToggleFeatured = async (projectId: string, featured: boolean) => {
    const response = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: projectId, featured }),
    })
    if (response.ok) fetchProjects()
  }

  const handleAddNew = () => {
    setSelectedProject(null)
    setFormOpen(true)
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const publishedCount = projects.filter(p => p.status === "published").length
  const draftCount = projects.filter(p => p.status === "draft").length

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Proyectos</h1>
            <p className="mt-1 text-muted-foreground">Gestiona los proyectos de tu portafolio</p>
          </div>
          <Button
            onClick={handleAddNew}
            size="lg"
            className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="h-5 w-5" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Proyectos</p>
          <p className="mt-2 font-sans text-4xl font-bold tracking-tight text-foreground">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Publicados</p>
          <p className="mt-2 font-sans text-4xl font-bold tracking-tight text-secondary">{publishedCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Borradores</p>
          <p className="mt-2 font-sans text-4xl font-bold tracking-tight text-muted-foreground">{draftCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-xl border-border bg-card pl-12 text-base"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {searchTerm ? "No se encontraron proyectos" : "No hay proyectos aun"}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Intenta con otro termino de busqueda" : "Crea tu primer proyecto para comenzar"}
          </p>
          {!searchTerm && (
            <Button
              onClick={handleAddNew}
              className="mt-6 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Plus className="h-4 w-4" />
              Crear Proyecto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onToggleFeatured={handleToggleFeatured}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <ProjectForm
        project={selectedProject}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  )
}
