"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Vista general",
  },
  {
    label: "Proyectos",
    href: "/admin/proyectos",
    icon: FolderKanban,
    description: "Gestionar proyectos",
  },
  {
    label: "Configuracion",
    href: "/admin/configuracion",
    icon: Settings,
    description: "Ajustes del sistema",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE", credentials: "include" })
    router.push("/admin/login")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-sidebar-border px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/aoslogoo.png"
            alt="AOS Admin"
            width={160}
            height={50}
            priority
            className="brightness-0 invert"
            style={{ width: 'auto', height: 'auto' }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Menu Principal
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-sidebar-primary" : "bg-sidebar-foreground/10 group-hover:bg-sidebar-foreground/20"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-sidebar-primary-foreground" : ""
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className={cn(
                    "text-xs",
                    isActive ? "text-sidebar-accent-foreground/70" : "text-sidebar-foreground/50"
                  )}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 opacity-0 transition-all",
                  isActive && "opacity-100",
                  "group-hover:opacity-100"
                )} />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground/70 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-foreground/10 transition-colors group-hover:bg-destructive/20">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">Cerrar Sesion</p>
            <p className="text-xs text-sidebar-foreground/50 group-hover:text-destructive/70">
              Salir del panel
            </p>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-5 z-50 h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-lg md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-shrink-0 bg-sidebar md:block">
        <SidebarContent />
      </aside>
    </>
  )
}
