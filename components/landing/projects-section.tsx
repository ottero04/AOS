"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import projectsData from "@/data/projects.json";

export function ProjectsSection() {
  const publishedProjects = projectsData.projects.filter(
    (project) => project.status === "published",
  );

  return (
    <section id="proyectos" className="py-20 lg:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Portafolio
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
            Proyectos Destacados
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Conoce algunos de los proyectos que hemos desarrollado.
          </p>
        </div>

        {/* Projects Grid */}
        {publishedProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedProjects.map((project) => (
              <article
                key={project.id}
                className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {project.mainImage ? (
                    <Image
                      src={project.mainImage}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-slate-500 text-sm line-clamp-2">
                    {project.shortDescription}
                  </p>

                  {project.liveUrl && (
                    <Button
                      asChild
                      variant="outline"
                      className="mt-4 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Proyecto
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">Proximamente nuevos proyectos</p>
          </div>
        )}
      </div>
    </section>
  );
}
