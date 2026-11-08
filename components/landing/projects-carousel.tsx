"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import type { Project } from "@/lib/types"
import { PublicProjectCard } from "./project-card-public"

export function ProjectsCarousel({ projects }: { projects: Project[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)
  const [snaps, setSnaps] = useState<number[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!api) return
    const update = () => {
      setSelected(api.selectedScrollSnap())
      setSnaps(api.scrollSnapList())
    }
    update()
    api.on("select", update)
    api.on("reInit", update)
    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  // Avance automático cada 5 s (se pausa al pasar el mouse)
  useEffect(() => {
    if (!api || paused || snaps.length <= 1) return
    const id = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, 5000)
    return () => clearInterval(id)
  }, [api, paused, snaps.length])

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-6">
          {projects.map((p, i) => (
            <CarouselItem key={p.id} className="pl-6 sm:basis-1/2 lg:basis-1/3">
              <PublicProjectCard project={p} priority={i < 3} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {snaps.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!api?.canScrollPrev()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === selected ? "w-8 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!api?.canScrollNext()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
