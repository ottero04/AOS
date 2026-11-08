import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedProjects, getPublishedProjects } from "@/lib/projects"
import { ProjectsCarousel } from "./projects-carousel"

export async function ProjectsSection() {
  // Se leen los proyectos guardados desde el panel (Vercel Blob),
  // con respaldo en data/projects.json si no hay conexión.
  const [featured, all] = await Promise.all([getFeaturedProjects(6), getPublishedProjects()])

  return (
    <section id="proyectos" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Portafolio</span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Proyectos destacados</h2>
            <p className="mt-4 text-lg text-slate-600">Algunos de los proyectos que hemos diseñado y desarrollado.</p>
          </div>
          {all.length > 0 && (
            <Button asChild variant="outline" className="h-11 shrink-0 gap-2 border-slate-300 bg-white px-5">
              <Link href="/proyectos">
                Ver todos los proyectos ({all.length})
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {featured.length > 0 ? (
          <ProjectsCarousel projects={featured} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-slate-500">Próximamente nuevos proyectos</p>
          </div>
        )}
      </div>
    </section>
  )
}
