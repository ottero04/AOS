import { promises as fs } from "fs"
import path from "path"
import type { Project } from "./types"

const DATA_FILE = path.join(process.cwd(), "data", "projects.json")

interface ProjectsData {
  projects: Project[]
}

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8")
    const { projects } = JSON.parse(data) as ProjectsData
    return projects
  } catch (error) {
    console.error("Error reading projects:", error)
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
  try {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify({ projects }, null, 2),
      "utf-8"
    )
  } catch (error) {
    console.error("Error saving projects:", error)
    throw error
  }
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
    id, // Ensure ID doesn't change
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
