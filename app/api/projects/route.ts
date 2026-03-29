import { NextResponse } from "next/server"
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/projects"

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Error al obtener proyectos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const project = await createProject({
      title: body.title,
      shortDescription: body.shortDescription || "",
      longDescription: body.longDescription || "",
      mainImage: body.mainImage || "",
      additionalImages: body.additionalImages || [],
      liveUrl: body.liveUrl || "",
      status: body.status || "draft",
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Error al crear proyecto" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: "ID de proyecto requerido" },
        { status: 400 }
      )
    }

    const project = await updateProject(body.id, {
      title: body.title,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription,
      mainImage: body.mainImage,
      additionalImages: body.additionalImages,
      liveUrl: body.liveUrl,
      status: body.status,
    })

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Error al actualizar proyecto" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: "ID de proyecto requerido" },
        { status: 400 }
      )
    }

    const project = await updateProject(body.id, { status: body.status })

    if (!project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error updating project status:", error)
    return NextResponse.json(
      { error: "Error al actualizar estado" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID de proyecto requerido" },
        { status: 400 }
      )
    }

    const deleted = await deleteProject(id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Error al eliminar proyecto" },
      { status: 500 }
    )
  }
}
