import { Target, Lightbulb, Users, ShieldCheck, Search, PenTool, Rocket, LifeBuoy } from "lucide-react"

const values = [
  {
    icon: Target,
    title: "Compromiso con el resultado",
    description: "Medimos el éxito por el impacto en tu operación, no por las horas trabajadas.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad desde el diseño",
    description: "Autenticación robusta, datos cifrados y buenas prácticas en cada entrega.",
  },
  {
    icon: Lightbulb,
    title: "Innovación aplicada",
    description: "Usamos tecnología actual solo cuando resuelve un problema real.",
  },
  {
    icon: Users,
    title: "Trabajo cercano",
    description: "Un equipo que entiende tu negocio y te acompaña después de la entrega.",
  },
]

const process = [
  { icon: Search, title: "Diagnóstico", text: "Entendemos tu proceso actual y dónde se pierde tiempo." },
  { icon: PenTool, title: "Diseño", text: "Proponemos la solución, el alcance y los tiempos." },
  { icon: Rocket, title: "Implementación", text: "Construimos, probamos con datos reales y desplegamos." },
  { icon: LifeBuoy, title: "Acompañamiento", text: "Monitoreo, ajustes y soporte continuo." },
]

export function AboutSection() {
  return (
    <section id="nosotros" className="relative bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Texto */}
          <div className="lg:sticky lg:top-28">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">Quiénes somos</span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
              Tecnología con criterio de negocio
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              <strong className="font-semibold text-slate-900">AOS</strong> es la marca de desarrollo y automatización
              de <strong className="font-semibold text-slate-900">AOteSoft</strong>. Creamos plataformas web y flujos
              automáticos para empresas que quieren dejar atrás el trabajo manual y repetitivo.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Combinamos desarrollo a medida, integración entre aplicaciones y seguridad para entregar soluciones que
              funcionan desde el primer día y crecen con tu empresa.
            </p>
          </div>

          {/* Valores en mosaico */}
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`group rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  i === 0
                    ? "border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    i === 0 ? "bg-white/20" : "bg-blue-50 group-hover:bg-blue-100"
                  }`}
                >
                  <v.icon className={`h-6 w-6 ${i === 0 ? "text-white" : "text-blue-600"}`} />
                </div>
                <h3 className={`text-lg font-bold ${i === 0 ? "text-white" : "text-slate-900"}`}>{v.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${i === 0 ? "text-blue-50" : "text-slate-500"}`}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo trabajamos */}
        <div className="mt-20">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-blue-600">Cómo trabajamos</h3>
          <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-200 lg:block" />
            {process.map((p, i) => (
              <li key={p.title} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
                  <p.icon className="h-6 w-6 text-blue-600" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h4 className="mt-4 font-bold text-slate-900">{p.title}</h4>
                <p className="mx-auto mt-1.5 max-w-[16rem] text-sm text-slate-500">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
