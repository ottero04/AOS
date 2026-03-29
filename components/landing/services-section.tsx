import { 
  Code2, 
  ShoppingCart, 
  Settings2, 
  Wrench,
  Monitor,
  Smartphone,
  Database,
  Headphones
} from "lucide-react"

const services = [
  {
    icon: Code2,
    title: "Software a Medida",
    description: "Soluciones personalizadas para las necesidades de tu negocio.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    description: "Tiendas online optimizadas con pasarelas de pago seguras.",
  },
  {
    icon: Settings2,
    title: "Consultoria Tech",
    description: "Asesoramos en la adopcion de nuevas tecnologias.",
  },
  {
    icon: Wrench,
    title: "Mantenimiento",
    description: "Soporte continuo para mantener tus sistemas optimos.",
  },
  {
    icon: Monitor,
    title: "Apps de Escritorio",
    description: "Aplicaciones nativas para Windows, Mac y Linux.",
  },
  {
    icon: Smartphone,
    title: "Apps Moviles",
    description: "Desarrollo de aplicaciones para iOS y Android.",
  },
  {
    icon: Database,
    title: "Bases de Datos",
    description: "Diseño y optimizacion de bases de datos.",
  },
  {
    icon: Headphones,
    title: "Soporte Tecnico",
    description: "Asistencia tecnica para resolver cualquier problema.",
  },
]

export function ServicesSection() {
  return (
    <section id="servicios" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Nuestros Servicios
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
            Soluciones Integrales para tu Negocio
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Ofrecemos servicios tecnologicos completos para cubrir todas tus necesidades digitales.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group p-6 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-white/20 transition-colors">
                <service.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-white transition-colors">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 group-hover:text-blue-100 transition-colors">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
