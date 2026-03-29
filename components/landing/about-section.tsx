import { Target, Lightbulb, Users, Award } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Compromiso",
    description: "Nos comprometemos con cada proyecto.",
  },
  {
    icon: Lightbulb,
    title: "Innovacion",
    description: "Tecnologias avanzadas del mercado.",
  },
  {
    icon: Users,
    title: "Colaboracion",
    description: "Trabajamos de la mano contigo.",
  },
  {
    icon: Award,
    title: "Excelencia",
    description: "Calidad en cada linea de codigo.",
  },
]

export function AboutSection() {
  return (
    <section id="nosotros" className="py-20 lg:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Content */}
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Quienes Somos
          </span>
          
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Expertos en Transformacion Digital
          </h2>
          
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            En <strong className="text-slate-900">AOS</strong>, una empresa de AOteSoft, 
            transformamos ideas en soluciones tecnologicas que impulsan el crecimiento 
            de tu negocio.
          </p>
          
          <p className="mt-4 text-slate-600 leading-relaxed">
            Nuestro equipo esta comprometido con la excelencia, utilizando 
            las ultimas tecnologias para entregar productos de alta calidad.
          </p>

          {/* Values Grid */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <value.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
