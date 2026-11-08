import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, FolderCheck, Mail, ShieldCheck, Workflow, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SiteContent, SiteStats } from "@/lib/content"

const pillars = ["Desarrollo a medida", "Automatización de procesos", "Seguridad desde el diseño"]

const runSteps = [
  { icon: Mail, label: "Correo recibido", detail: "Radicado nuevo detectado" },
  { icon: Workflow, label: "Clasificado", detail: "Departamento · Municipio" },
  { icon: FileText, label: "PDF generado", detail: "Nombre estandarizado" },
  { icon: FolderCheck, label: "Archivado en Drive", detail: "Carpeta del expediente" },
]

export function HeroSection({ content, stats }: { content: SiteContent; stats: SiteStats }) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-slate-950 pt-20"
    >
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-28">
        {/* Texto */}
        <div>
          <Link
            href="#automatizacion"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 py-1 pl-1 pr-4 text-sm text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <span className="rounded-full bg-cyan-400 px-2.5 py-0.5 text-xs font-bold text-slate-950">Nuevo</span>
            AOS Flow: automatización de informes
            <ArrowRight className="h-4 w-4" />
          </Link>

          <h1 className="mt-8 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            {content.heroTitle}
            {content.heroHighlight && (
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                {content.heroHighlight}
              </span>
            )}
          </h1>

          {content.heroSubtitle && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{content.heroSubtitle}</p>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-cyan-400 px-7 font-semibold text-slate-950 hover:bg-cyan-300">
              <Link href="#contacto">
                Iniciar un proyecto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/20 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/proyectos">Ver proyectos</Link>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {pillars.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Panel ilustrativo de un flujo AOS */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 to-blue-600/20 blur-2xl" />
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AOS Flow</p>
                  <p className="text-xs text-slate-400">Ejemplo de ejecución</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                En ejecución
              </span>
            </div>

            <ol className="mt-6 space-y-3">
              {runSteps.map((s, i) => (
                <li
                  key={s.label}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                    <s.icon className="h-4.5 w-4.5 text-cyan-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{s.label}</p>
                    <p className="truncate text-xs text-slate-400">{s.detail}</p>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 ${i < 3 ? "text-emerald-400" : "text-cyan-300 animate-pulse"}`} />
                </li>
              ))}
            </ol>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-2xl font-bold text-white">
                  {stats.reports > 0 ? stats.reports.toLocaleString("es-CO") : "Auto"}
                </p>
                <p className="text-xs text-slate-400">
                  {stats.reports > 0 ? "documentos generados" : "sin intervención manual"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="flex items-center gap-2 text-2xl font-bold text-white">
                  <ShieldCheck className="h-6 w-6 text-cyan-300" />
                  {stats.activeAutomations > 0 ? stats.activeAutomations : "24/7"}
                </p>
                <p className="text-xs text-slate-400">
                  {stats.activeAutomations > 0 ? "flujos activos" : "operación continua"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
