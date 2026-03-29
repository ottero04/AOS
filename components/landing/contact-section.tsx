"use client"

import { useState } from "react"
import { MessageCircle, Send, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const WHATSAPP_URL = "https://wa.me/573177300185?text=Hola,%20estoy%20interesado%20en%20crear%20una%20página%20web%20y%20quisiera%20recibir%20una%20cotización"

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contactanos@aotesoft.com",
    href: "mailto:contactanos@aotesoft.com",
  },
  {
    icon: MapPin,
    label: "Ubicacion",
    value: "Colombia",
    href: "#",
  },
]

export function ContactSection() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ nombre: "", email: "", mensaje: "" })
  }

  const handleWhatsAppClick = () => {
    window.open(WHATSAPP_URL, "_blank")
  }

  return (
    <section id="contacto" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Contacto
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
            Hablemos de tu Proyecto
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Estamos listos para convertir tu idea en realidad.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-slate-50 rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Mensaje Enviado</h3>
                <p className="mt-2 text-slate-600">
                  Gracias por contactarnos. Te responderemos pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre
                    </label>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="h-12 bg-white border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12 bg-white border-slate-200 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mensaje
                  </label>
                  <Textarea
                    placeholder="Cuentanos sobre tu proyecto..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    required
                    rows={5}
                    className="bg-white border-slate-200 focus:border-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center">
            {/* WhatsApp */}
            <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Contacto Rapido
              </h3>
              <p className="text-slate-600 mb-4">
                Escribenos por WhatsApp para una respuesta inmediata.
              </p>
              <Button
                onClick={handleWhatsAppClick}
                className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-5 w-5" />
                Escribir por WhatsApp
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <info.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{info.label}</p>
                    <p className="font-medium text-slate-900">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
