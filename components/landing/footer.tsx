import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, X } from "lucide-react"
import type { SiteContent } from "@/lib/content"

const footerLinks = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Servicios", href: "/#servicios" },
  { label: "AOS Flow", href: "/#automatizacion" },
  { label: "Proyectos", href: "/#proyectos" },
  { label: "Contacto", href: "/#contacto" },
]

export function Footer({ content }: { content: SiteContent }) {
  const socialLinks = [
    { icon: Facebook, href: content.facebookUrl, label: "Facebook" },
    { icon: X, href: content.xUrl, label: "X" },
    { icon: Instagram, href: content.instagramUrl, label: "Instagram" },
  ].filter((s) => s.href)

  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/images/aoslogoo.png"
                alt="AOS"
                width={120}
                height={40}
                className="brightness-0 invert"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Tecnología en la que puedes confiar. Soluciones digitales que impulsan tu negocio.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Navegación</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${content.email}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {content.email}
                </a>
              </li>
              {content.location && (
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="h-4 w-4" />
                  {content.location}
                </li>
              )}
            </ul>
          </div>

          {socialLinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-4">Síguenos</h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} AOS by AOteSoft. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
