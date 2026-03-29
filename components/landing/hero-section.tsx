import Link from "next/link";
import { ArrowRight, Code, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
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
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Soluciones Tecnologicas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mt-2">
              para tu Negocio
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto mb-10">
            Desarrollamos software a medida que impulsa el crecimiento de tu
            empresa. Confiabilidad, innovacion y resultados garantizados.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 h-12"
            >
              <Link href="#contacto">
                Iniciar Proyecto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-12"
            >
              <Link href="#servicios">Ver Servicios</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Code className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Codigo Limpio</p>
                <p className="text-blue-200/60 text-sm">
                  Desarrollo profesional
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Seguridad</p>
                <p className="text-blue-200/60 text-sm">Datos protegidos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Rendimiento</p>
                <p className="text-blue-200/60 text-sm">Alta velocidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
