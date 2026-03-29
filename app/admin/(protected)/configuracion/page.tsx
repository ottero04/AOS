"use client"

import { Settings, Palette, Bell, Globe } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Configuracion</h1>
        <p className="mt-1 text-muted-foreground">Ajustes y preferencias del sistema</p>
      </div>
      
      {/* Coming Soon Card */}
      <div className="rounded-3xl border border-border bg-card p-12 text-center lg:p-16">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10">
          <Settings className="h-10 w-10 text-secondary" />
        </div>
        
        <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
          Proximamente
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Las opciones de configuracion estaran disponibles en una proxima actualizacion. 
          Podras personalizar tu experiencia y ajustar las preferencias del sistema.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            <Palette className="h-4 w-4" />
            Temas y apariencia
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            Notificaciones
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            Idioma y region
          </div>
        </div>
      </div>
    </div>
  )
}
