import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import type { Project } from "@/lib/types"

export function isSafeHttpUrl(url?: string) {
  return /^https?:\/\//.test(url || "")
}

export function PublicProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/proyectos/${project.id}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
        {project.mainImage ? (
          <Image
            src={project.mainImage}
            alt={project.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin imagen</div>
        )}
        {project.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
            Destacado
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {project.tags && project.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {t}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-xl font-bold text-slate-900">
          <Link href={`/proyectos/${project.id}`} className="hover:text-blue-600">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{project.shortDescription}</p>
        <div className="mt-5 flex items-center gap-4 text-sm font-medium">
          <Link href={`/proyectos/${project.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
            Ver detalle
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          {isSafeHttpUrl(project.liveUrl) && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
            >
              <ExternalLink className="h-4 w-4" />
              Visitar sitio
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
