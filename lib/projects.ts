import { put, list } from "@vercel/blob"
import type { Project } from "./types"

interface ProjectsData {
  projects: Project[]
}

async function getProjectsUrl(): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: "projects.json" })
    if (blobs.length === 0) return null
    return blobs[0].url
  } catch {
    return null
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const url = await getProjectsUrl()
    if (!url) return getLocalProjects()
    const res = await fetch(url, { cache: "no-store" })
    const { projects } = await res.json() as ProjectsData
    return projects
  } catch {
    return getLocalProjects()
  }
}

async function getLocalProjects(): Promise<Project[]> {
  try {
    const { promises: fs } = await import("fs")
    const path = await import("path")
    const DATA_FILE = path.join(process.cwd(), "data", "projects.json")
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const { projects } = JSON.parse(data) as ProjectsData
    return projects
  } catch {
    return []
  }
}

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getProjects()
  return projects.filter((p) => p.status === "published")
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects()
  return projects.find((p) => p.id === id) || null
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await put("projects.json", JSON.stringify({ projects }, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  })
}

export async function createProject(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const projects = await getProjects()
  const newProject: Project = {
    ...projectData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  projects.push(newProject)
  await saveProjects(projects)
  return newProject
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null
  const updatedProject: Project = {
    ...projects[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  }
  projects[index] = updatedProject
  await saveProjects(projects)
  return updatedProject
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  await saveProjects(filtered)
  return true
}
/** Destacados para el carrusel; si no hay ninguno marcado, los más recientes. */
export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  const published = (await getPublishedProjects()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const featured = published.filter((p) => p.featured)
  return (featured.length > 0 ? featured : published).slice(0, limit)
}

export async function getPublishedProjectById(id: string): Promise<Project | null> {
  const project = await getProjectById(id)
  return project && project.status === "published" ? project : null
}
