import Link from "next/link"
import {
  Code2,
  ShoppingCart,
  Compass,
  Wrench,
  Monitor,
  Smartphone,
  Database,
  Workflow,
  Globe,
  ArrowRight,
} from "lucide-react"

const services = [
  { icon: Code2, title: "Software a medida", description: "Plataformas web y sistemas diseñados alrededor de tus procesos." },
  { icon: Globe, title: "Sitios web corporativos", description: "Sitios y landing pages rápidos, seguros y optimizados para buscadores." },
  { icon: ShoppingCart, title: "E-commerce", description: "Tiendas en línea con pasarelas de pago seguras y gestión de inventario." },
  { icon: Smartphone, title: "Apps móviles", description: "Aplicaciones para iOS y Android conectadas a tus sistemas." },
  { icon: Monitor, title: "Apps de escritorio", description: "Aplicaciones para Windows, Mac y Linux." },
  { icon: Database, title: "Bases de datos", description: "Diseño, migración y optimización de bases de datos." },
  { icon: Compass, title: "Consultoría tecnológica", description: "Te ayudamos a elegir la tecnología correcta y planear la hoja de ruta." },
  { icon: Wrench, title: "Mantenimiento y soporte", description: "Monitoreo, actualizaciones y soporte continuo de tus sistemas." },
]

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Nuestros servicios</span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Soluciones integrales para tu negocio</h2>
          <p className="mt-4 text-lg text-slate-600">
            Desde la idea hasta la operación: diseñamos, construimos y acompañamos la tecnología de tu empresa.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Servicio destacado */}
          <Link
            href="#automatizacion"
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:col-span-2 lg:row-span-2"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/30 blur-3xl transition-transform duration-500 group-hover:scale-125" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-300">Nuevo · AOS Flow</span>
              </div>
              <h3 className="mt-6 text-2xl font-bold sm:text-3xl">Automatización de procesos e informes</h3>
              <p className="mt-3 max-w-md text-slate-300">
                Flujos que capturan, clasifican y archivan documentos, y generan informes programados sobre tus
                herramientas actuales.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap items-center gap-2">
              {["Gestión documental", "Reportería", "Integraciones", "Alertas"].map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                  {t}
                </span>
              ))}
              <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-cyan-300">
                Conocer más
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/5"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-gradient-to-br group-hover:from-cyan-400 group-hover:to-blue-500">
                <s.icon className="h-5 w-5 text-slate-700 transition-colors group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
