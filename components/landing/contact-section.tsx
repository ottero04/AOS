"use client"

import { useState } from "react"
import { MessageCircle, Send, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { SiteContent } from "@/lib/content"
import { SocialLinks, getSocialLinks } from "./social-links"

export function ContactSection({ content }: { content: SiteContent }) {
  const [formData, setFormData] = useState({ nombre: "", email: "", mensaje: "", website: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const whatsapp = `https://wa.me/${content.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(content.whatsappMessage)}`

  const contactInfo = [
    { icon: Mail, label: "Email", value: content.email, href: `mailto:${content.email}` },
    ...(content.location ? [{ icon: MapPin, label: "Ubicación", value: content.location, href: "" }] : []),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "No se pudo enviar el mensaje. Intenta por WhatsApp.")
        return
      }
      setSubmitted(true)
      setFormData({ nombre: "", email: "", mensaje: "", website: "" })
    } catch {
      setError("Error de conexión. Intenta de nuevo o escríbenos por WhatsApp.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Contacto</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900">Hablemos de tu proyecto</h2>
          <p className="mt-4 text-lg text-slate-600">Estamos listos para convertir tu idea en realidad.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-slate-50 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Mensaje enviado</h3>
                <p className="mt-2 text-slate-600">Gracias por contactarnos. Te responderemos pronto.</p>
                <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo trampa anti-spam: oculto para personas */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    No llenar
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </label>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      maxLength={100}
                      className="h-12 bg-white border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      maxLength={160}
                      className="h-12 bg-white border-slate-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje</label>
                  <Textarea
                    placeholder="Cuéntanos sobre tu proyecto..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    required
                    maxLength={4000}
                    rows={5}
                    className="bg-white border-slate-200 focus:border-blue-500"
                  />
                </div>
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </form>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Contacto rápido</h3>
              <p className="text-slate-600 mb-4">Escríbenos por WhatsApp para una respuesta inmediata.</p>
              <Button asChild className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700 text-white">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Escribir por WhatsApp
                </a>
              </Button>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info) => {
                const inner = (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <info.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{info.label}</p>
                      <p className="font-medium text-slate-900">{info.value}</p>
                    </div>
                  </>
                )
                return info.href ? (
                  <a key={info.label} href={info.href} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    {inner}
                  </a>
                ) : (
                  <div key={info.label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    {inner}
                  </div>
                )
              })}
            </div>

            {getSocialLinks(content).length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-slate-500">Síguenos</p>
                <SocialLinks content={content} variant="light" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
