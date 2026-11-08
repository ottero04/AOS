import Link from "next/link";
import { ArrowRight, Code, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/lib/content";

const features = [
  { icon: Code, title: "Codigo Limpio", text: "Desarrollo profesional" },
  { icon: Shield, title: "Seguridad", text: "Datos protegidos" },
  { icon: Zap, title: "Automatizacion", text: "Procesos que se hacen solos" },
];

export function HeroSection({ content }: { content: SiteContent }) {
  return (
    <section
      id="inicio"
      className="relative pt-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge novedad */}
          <Link
            href="#automatizacion"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-bold text-slate-950">Nuevo</span>
            AOS Flow: automatiza tus correos e informes
            <ArrowRight className="h-4 w-4" />
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {content.heroTitle}
            {content.heroHighlight && (
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mt-2">
                {content.heroHighlight}
              </span>
            )}
          </h1>

          {content.heroSubtitle && (
            <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10">
              {content.heroSubtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 h-12">
              <Link href="#contacto">
                Iniciar Proyecto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-12">
              <Link href="#automatizacion">Automatizar mi negocio</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <f.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{f.title}</p>
                  <p className="text-blue-200/60 text-sm">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
