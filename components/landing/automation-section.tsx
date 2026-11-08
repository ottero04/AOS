import Link from "next/link"
import {
  Inbox,
  GitBranch,
  FileCog,
  Archive,
  FolderKanban,
  LineChart,
  Plug,
  ShieldAlert,
  Gauge,
  ScrollText,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CATEGORY_LABELS, whatsappUrl, type PublicAutomation, type SiteContent } from "@/lib/content"

const steps = [
  { icon: Inbox, title: "Captura", text: "Correos, adjuntos, formularios y hojas de cálculo entran al flujo sin intervención." },
  { icon: GitBranch, title: "Clasificación", text: "Reglas de negocio por remitente, asunto, cliente, entidad o ubicación." },
  { icon: FileCog, title: "Procesamiento", text: "Generación de PDF e informes con nomenclatura y formato estandarizados." },
  { icon: Archive, title: "Entrega y archivo", text: "Distribución a responsables y archivo estructurado en la nube." },
]

const capabilities = [
  {
    icon: FolderKanban,
    title: "Gestión documental automatizada",
    text: "Captura, clasificación y archivo de documentos entrantes —radicados, notificaciones, soportes— con reglas de negocio y estructura de carpetas por expediente, entidad o territorio.",
    tags: ["Gmail / Outlook", "Google Drive", "PDF"],
  },
  {
    icon: LineChart,
    title: "Reportería e informes programados",
    text: "Consolidación de datos desde hojas de cálculo, formularios y sistemas internos para producir informes periódicos listos para revisión y envío.",
    tags: ["Google Sheets", "Excel", "Programación"],
  },
  {
    icon: Plug,
    title: "Integración entre aplicaciones",
    text: "Conectamos las herramientas que ya usas mediante APIs para eliminar la doble digitación y mantener la información sincronizada.",
    tags: ["Google Workspace", "Microsoft 365", "APIs"],
  },
  {
    icon: ShieldAlert,
    title: "Control de plazos y alertas",
    text: "Seguimiento de vencimientos y eventos críticos con notificaciones automáticas y una bitácora que deja trazabilidad de cada acción.",
    tags: ["Notificaciones", "Bitácora", "Trazabilidad"],
  },
]

const benefits = [
  { icon: Gauge, title: "Menos carga operativa", text: "El equipo deja de descargar, renombrar y ordenar a mano." },
  { icon: ScrollText, title: "Trazabilidad completa", text: "Cada documento procesado queda registrado y es fácil de ubicar." },
  { icon: Layers, title: "Sobre tu ecosistema", text: "Implementamos sobre tus herramientas actuales, sin migraciones." },
]

export function AutomationSection({ content, cases }: { content: SiteContent; cases: PublicAutomation[] }) {
  const totalReports = cases.reduce((acc, c) => acc + c.reportsCount, 0)

  return (
    <section
      id="automatizacion"
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm font-semibold text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Nuevo · AOS Flow
          </span>
          <h2 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Automatización de procesos{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              e informes
            </span>
          </h2>
          <p className="mt-5 text-lg text-blue-100/75">
            Diseñamos flujos que capturan, procesan y organizan la información de tu operación de forma
            automática, para que tu equipo dedique su tiempo a decisiones y no a tareas repetitivas.
          </p>
        </div>

        {/* Flujo */}
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent lg:block" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/30 bg-slate-900/80 shadow-lg shadow-cyan-500/10 backdrop-blur">
                  <step.icon className="h-9 w-9 text-cyan-300" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold text-white">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[15rem] text-sm text-blue-100/60">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Casos reales (se gestionan desde el panel → Automatizaciones) */}
        {cases.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">Casos reales</h3>
              {totalReports > 0 && (
                <p className="text-3xl font-bold text-white">
                  {totalReports.toLocaleString("es-CO")}{" "}
                  <span className="text-lg font-medium text-blue-100/70">documentos e informes generados automáticamente</span>
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              {cases.map((c) => (
                <article
                  key={c.id}
                  className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.84rem)] rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-600/5 p-6"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-200">
                      {CATEGORY_LABELS[c.category] ?? "Automatización"}
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="En funcionamiento" />
                  </div>
                  <h4 className="mt-4 font-semibold text-white">{c.title}</h4>
                  {c.summary && <p className="mt-2 text-sm leading-relaxed text-blue-100/65">{c.summary}</p>}
                  {c.reportsCount > 0 && (
                    <p className="mt-4 text-sm font-medium text-cyan-300">
                      {c.reportsCount.toLocaleString("es-CO")} generados
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Capacidades */}
        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">Capacidades</h3>
            <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">Soluciones a la medida de tu operación</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all hover:border-cyan-400/40 hover:bg-white/[0.07]"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
                  <c.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="mt-5 text-lg font-bold text-white">{c.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-blue-100/70">{c.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-100/80">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficios + CTA */}
        <div className="mt-16 grid items-center gap-10 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-3">
                <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                <div>
                  <p className="font-semibold text-white">{b.title}</p>
                  <p className="mt-1 text-sm text-blue-100/60">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild size="lg" className="h-12 bg-cyan-400 px-7 font-semibold text-slate-950 hover:bg-cyan-300">
              <a
                href={whatsappUrl(content, "Hola, quiero automatizar procesos de mi negocio con AOS Flow")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Solicitar diagnóstico
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 text-blue-100 hover:bg-white/10 hover:text-white">
              <Link href="#contacto">Escribir por correo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
