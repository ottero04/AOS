"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/#nosotros", id: "nosotros", label: "Nosotros" },
  { href: "/#servicios", id: "servicios", label: "Servicios" },
  { href: "/#automatizacion", id: "automatizacion", label: "AOS Flow", badge: true },
  { href: "/proyectos", id: "proyectos", label: "Proyectos" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>("")

  // Fondo transparente sobre la portada oscura; sólido al bajar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Resalta la sección visible en la página principal
  useEffect(() => {
    if (pathname !== "/") {
      setActive(pathname.startsWith("/proyectos") ? "proyectos" : "")
      return
    }
    const ids = [...navLinks.map((l) => l.id), "contacto"]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [pathname])

  // Bloquea el scroll con el menú móvil abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const solid = scrolled || mobileOpen

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        mobileOpen
          ? "border-b border-slate-200 bg-white"
          : solid
            ? "border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn("flex items-center justify-between transition-all duration-300", solid ? "h-16" : "h-20")}>
          <Link href="/" className="flex items-center" aria-label="AOS — Inicio" onClick={() => setMobileOpen(false)}>
            <Image
              src="/images/aoslogoo.png"
              alt="AOS"
              width={110}
              height={36}
              priority
              className={cn("h-8 w-auto transition-all duration-300", !solid && "brightness-0 invert")}
            />
          </Link>

          {/* Escritorio */}
          <nav
            className={cn(
              "hidden items-center gap-1 rounded-full p-1 lg:flex",
              solid ? "bg-slate-100/80" : "border border-white/10 bg-white/5 backdrop-blur"
            )}
            aria-label="Principal"
          >
            {navLinks.map((link) => {
              const isActive = active === link.id
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    solid
                      ? isActive
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                      : isActive
                        ? "bg-white/15 text-white"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                  {link.badge && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden />}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/#contacto"
              className={cn(
                "text-sm font-medium transition-colors",
                solid ? "text-slate-600 hover:text-slate-900" : "text-slate-200 hover:text-white"
              )}
            >
              Contacto
            </Link>
            <Button asChild className="h-10 gap-2 rounded-full bg-cyan-500 px-5 font-semibold text-white hover:bg-cyan-600">
              <Link href="/#contacto">
                Solicitar cotización
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Móvil */}
          <button
            type="button"
            className={cn(
              "rounded-xl p-2 transition-colors lg:hidden",
              solid ? "text-slate-800 hover:bg-slate-100" : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-6" aria-label="Menú móvil">
            {[{ href: "/", id: "inicio", label: "Inicio" }, ...navLinks, { href: "/#contacto", id: "contacto", label: "Contacto" }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-semibold transition-colors",
                    active === link.id ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                  <ArrowRight className="h-5 w-5 text-slate-300" />
                </Link>
              )
            )}
            <Button asChild className="mt-6 h-12 rounded-2xl bg-cyan-500 text-base font-semibold text-white hover:bg-cyan-600">
              <Link href="/#contacto" onClick={() => setMobileOpen(false)}>
                Solicitar cotización
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
