import { 
  Code2, 
  ShoppingCart, 
  Settings2, 
  Wrench,
  Monitor,
  Smartphone,
  Database,
  Workflow
} from "lucide-react"

const services = [
  {
    icon: Code2,
    title: "Software a medida",
    description: "Soluciones personalizadas para las necesidades de tu negocio.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    description: "Tiendas en línea con pasarelas de pago seguras.",
  },
  {
    icon: Settings2,
    title: "Consultoría tecnológica",
    description: "Te asesoramos en la adopción de nuevas tecnologías.",
  },
  {
    icon: Wrench,
    title: "Mantenimiento y Soporte",
    description: "Soporte continuo y asistencia para mantener tus sistemas óptimos.",
  },
  {
    icon: Monitor,
    title: "Apps de escritorio",
    description: "Aplicaciones nativas para Windows, Mac y Linux.",
  },
  {
    icon: Smartphone,
    title: "Apps móviles",
    description: "Aplicaciones para iOS y Android.",
  },
  {
    icon: Database,
    title: "Bases de datos",
    description: "Diseño y optimización de bases de datos.",
  },
  {
    icon: Workflow,
    title: "Automatización",
    description: "Tus correos, informes y documentos se procesan solos.",
    href: "#automatizacion",
    highlight: true,
  },
]

export function ServicesSection() {
  return (
    <section id="servicios" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Nuestros servicios
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">
            Soluciones integrales para tu negocio
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Ofrecemos servicios tecnológicos completos para cubrir todas tus necesidades digitales.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service: any) => {
            const Wrapper: any = service.href ? "a" : "div"
            return (
            <Wrapper
              key={service.title}
              {...(service.href ? { href: service.href } : {})}
              className={`group relative p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-blue-600 hover:border-blue-600 ${
                service.highlight ? "bg-cyan-50 border-cyan-300 ring-1 ring-cyan-200" : "bg-slate-50 border-slate-200"
              }`}
            >
              {service.highlight && (
                <span className="absolute right-4 top-4 rounded-full bg-cyan-500 px-2.5 py-0.5 text-xs font-semibold text-white group-hover:bg-white group-hover:text-blue-600">
                  Nuevo
                </span>
              )}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-white/20 transition-colors">
                <service.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-white transition-colors">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 group-hover:text-blue-100 transition-colors">
                {service.description}
              </p>
            </Wrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
