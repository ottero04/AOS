"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FolderKanban, Eye, FileEdit, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/types"

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
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
    }
    fetchProjects()
  }, [])

  const publishedCount = projects.filter(p => p.status === "published").length
  const draftCount = projects.filter(p => p.status === "draft").length

  const stats = [
    {
      label: "Total Proyectos",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-primary text-primary-foreground",
    },
    {
      label: "Publicados",
      value: publishedCount,
      icon: Eye,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Borradores",
      value: draftCount,
      icon: FileEdit,
      color: "bg-muted text-foreground",
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 font-sans text-muted-foreground">Bienvenido al panel de administracion</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-sans text-5xl font-bold tracking-tight text-foreground">
                  {isLoading ? "-" : stat.value}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm text-secondary">
              <TrendingUp className="h-4 w-4" />
              <span>Activo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="rounded-3xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">Proyectos Recientes</h2>
            <p className="text-sm text-muted-foreground">Ultimos proyectos agregados</p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/proyectos">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No hay proyectos aun</p>
              <Button asChild className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link href="/admin/proyectos">Crear primer proyecto</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                      <FolderKanban className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.shortDescription}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    project.status === "published"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {project.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/proyectos"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:border-secondary hover:shadow-lg"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 transition-colors group-hover:bg-secondary">
            <FolderKanban className="h-7 w-7 text-secondary transition-colors group-hover:text-secondary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Gestionar Proyectos</p>
            <p className="text-sm text-muted-foreground">Crear y editar proyectos</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
