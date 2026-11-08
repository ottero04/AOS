import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PublicProjectCard } from "@/components/landing/project-card-public"
import { getPublishedProjects } from "@/lib/projects"
import { getSiteContent } from "@/lib/content"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Portafolio de proyectos de desarrollo web y automatización realizados por AOS.",
}

export default async function ProyectosPage() {
  const [projects, content] = await Promise.all([getPublishedProjects(), getSiteContent()])
  const sorted = [...projects].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-950 pb-16 pt-36">
          <div className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/#proyectos" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
            <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">Proyectos</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Plataformas, sitios y automatizaciones que hemos construido. {projects.length} proyecto
              {projects.length === 1 ? "" : "s"} publicados.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {sorted.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((p, i) => (
                  <PublicProjectCard key={p.id} project={p} priority={i < 3} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-slate-500">Próximamente nuevos proyectos</p>
            )}
          </div>
        </section>
      </main>
      <Footer content={content} />
    </div>
  )
}
