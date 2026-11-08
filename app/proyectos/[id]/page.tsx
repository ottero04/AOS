import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { isSafeHttpUrl } from "@/components/landing/project-card-public"
import { getPublishedProjectById } from "@/lib/projects"
import { getSiteContent, whatsappUrl } from "@/lib/content"

export const revalidate = 60

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const project = await getPublishedProjectById(id)
  if (!project) return { title: "Proyecto no encontrado" }
  return { title: project.title, description: project.shortDescription }
}

export default async function ProyectoPage({ params }: Params) {
  const { id } = await params
  const [project, content] = await Promise.all([getPublishedProjectById(id), getSiteContent()])
  if (!project) notFound()

  const gallery = (project.additionalImages ?? []).filter(isSafeHttpUrl)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-950 pb-14 pt-36">
          <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link href="/proyectos" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Todos los proyectos
            </Link>
            {project.tags && project.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">{project.title}</h1>
            {project.shortDescription && <p className="mt-4 max-w-3xl text-lg text-slate-300">{project.shortDescription}</p>}
            {isSafeHttpUrl(project.liveUrl) && (
              <Button asChild size="lg" className="mt-8 h-12 gap-2 bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  Visitar el sitio
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {project.mainImage && (
              <div className="relative -mt-24 aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl">
                <Image src={project.mainImage} alt={project.title} fill priority sizes="(min-width: 1024px) 960px, 100vw" className="object-cover" />
              </div>
            )}

            {project.longDescription && (
              <div className="mx-auto mt-14 max-w-3xl">
                <h2 className="text-2xl font-bold text-slate-900">Sobre el proyecto</h2>
                <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-600">{project.longDescription}</p>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl font-bold text-slate-900">Galería</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {gallery.map((src, i) => (
                    <div key={src + i} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <Image src={src} alt={`${project.title} — imagen ${i + 1}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-10 text-center text-white">
              <h2 className="text-2xl font-bold sm:text-3xl">¿Quieres algo así para tu empresa?</h2>
              <p className="max-w-xl text-blue-50">Cuéntanos tu idea y te proponemos la mejor forma de construirla.</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 gap-2 bg-white text-blue-700 hover:bg-blue-50">
                  <a href={whatsappUrl(content)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Escribir por WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link href="/#contacto">Enviar un mensaje</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer content={content} />
    </div>
  )
}
