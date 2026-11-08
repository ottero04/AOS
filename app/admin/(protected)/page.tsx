import Link from "next/link"
import {
  FolderKanban,
  Workflow,
  FileText,
  Inbox,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Activity,
} from "lucide-react"
import { getProjects } from "@/lib/projects"
import { hasDb, sql } from "@/lib/db"
import { getTotpSetting } from "@/lib/auth"
import { ReportsChart } from "@/components/admin/reports-chart"

export const dynamic = "force-dynamic"

const ACTION_LABELS: Record<string, string> = {
  login: "Inicio de sesión",
  proyecto_creado: "Proyecto creado",
  proyecto_editado: "Proyecto editado",
  proyecto_publicado: "Proyecto publicado",
  proyecto_ocultado: "Proyecto ocultado",
  proyecto_eliminado: "Proyecto eliminado",
  automatizacion_creada: "Automatización creada",
  automatizacion_editada: "Automatización editada",
  automatizacion_eliminada: "Automatización eliminada",
  informe_registrado: "Informe registrado",
  mensaje_recibido: "Mensaje recibido",
  contenido_actualizado: "Contenido actualizado",
  "2fa_activada": "2FA activada",
  "2fa_desactivada": "2FA desactivada",
  sesiones_cerradas: "Sesiones cerradas",
  sesion_cerrada: "Sesión cerrada",
}

function timeAgo(date: string | Date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return "hace un momento"
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86400)} d`
}

async function loadData() {
  const projects = await getProjects().catch(() => [])
  const base = {
    projectsTotal: projects.length,
    projectsPublished: projects.filter((p) => p.status === "published").length,
    automationsActive: 0,
    automationsTotal: 0,
    reportsTotal: 0,
    unreadMessages: 0,
    failed24h: 0,
    twoFactor: false,
    chart: [] as { name: string; informes: number }[],
    activity: [] as { action: string; detail: string; created_at: string }[],
    dbError: false,
  }
  if (!hasDb()) return base
  try {
    const [autos, msgs, failed, activity, totp] = await Promise.all([
      sql<any>("SELECT title, status, reports_count FROM automations ORDER BY reports_count DESC"),
      sql<{ n: string }>("SELECT count(*) AS n FROM contact_messages WHERE read_at IS NULL"),
      sql<{ n: string }>(
        "SELECT count(*) AS n FROM login_attempts WHERE success = false AND created_at > now() - interval '24 hours'"
      ),
      sql<any>("SELECT action, detail, created_at FROM activity_log ORDER BY created_at DESC LIMIT 8"),
      getTotpSetting(),
    ])
    return {
      ...base,
      automationsTotal: autos.length,
      automationsActive: autos.filter((a) => a.status === "activa").length,
      reportsTotal: autos.reduce((acc, a) => acc + Number(a.reports_count), 0),
      unreadMessages: Number(msgs[0]?.n ?? 0),
      failed24h: Number(failed[0]?.n ?? 0),
      twoFactor: Boolean(totp),
      chart: autos
        .filter((a) => Number(a.reports_count) > 0)
        .slice(0, 8)
        .map((a) => ({ name: a.title.length > 22 ? a.title.slice(0, 21) + "…" : a.title, informes: Number(a.reports_count) })),
      activity,
    }
  } catch (e) {
    console.error("dashboard error", e)
    return { ...base, dbError: true }
  }
}

export default async function AdminDashboard() {
  const d = await loadData()

  const stats = [
    { label: "Proyectos publicados", value: `${d.projectsPublished}/${d.projectsTotal}`, icon: FolderKanban, href: "/admin/proyectos", tone: "bg-primary text-primary-foreground" },
    { label: "Automatizaciones activas", value: `${d.automationsActive}/${d.automationsTotal}`, icon: Workflow, href: "/admin/automatizaciones", tone: "bg-secondary text-secondary-foreground" },
    { label: "Informes generados", value: d.reportsTotal.toLocaleString("es-CO"), icon: FileText, href: "/admin/automatizaciones", tone: "bg-cyan-500 text-white" },
    { label: "Mensajes sin leer", value: d.unreadMessages, icon: Inbox, href: "/admin/mensajes", tone: d.unreadMessages > 0 ? "bg-amber-500 text-white" : "bg-muted text-foreground" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Resumen de tu página, automatizaciones y seguridad</p>
      </div>

      {!hasDb() && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          La base de datos no está conectada. Conéctala desde Vercel → Storage para activar mensajes, automatizaciones y la seguridad avanzada.
        </div>
      )}
      {d.dbError && (
        <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          No se pudo leer la base de datos en este momento. La página pública sigue funcionando.
        </div>
      )}

      {/* Seguridad */}
      <Link
        href="/admin/configuracion"
        className={`mb-6 flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
          d.twoFactor ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70" : "border-amber-300 bg-amber-50 hover:bg-amber-100/70"
        }`}
      >
        {d.twoFactor ? (
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />
        ) : (
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-600" />
        )}
        <div className="flex-1 text-sm">
          <p className="font-semibold text-foreground">
            {d.twoFactor ? "Verificación en dos pasos activa" : "Activa la verificación en dos pasos"}
          </p>
          <p className="text-muted-foreground">
            {d.failed24h > 0
              ? `${d.failed24h} intento(s) fallido(s) de inicio de sesión en las últimas 24 horas.`
              : "Sin intentos fallidos de inicio de sesión en las últimas 24 horas."}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">{s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Informes por automatización</h2>
              <p className="text-sm text-muted-foreground">Total generado por cada flujo</p>
            </div>
            <Link href="/admin/automatizaciones" className="text-sm font-medium text-secondary hover:underline">
              Gestionar
            </Link>
          </div>
          <ReportsChart data={d.chart} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">Actividad reciente</h2>
          </div>
          {d.activity.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Sin actividad registrada todavía</p>
          ) : (
            <ul className="space-y-3">
              {d.activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{ACTION_LABELS[a.action] ?? a.action}</p>
                    {a.detail && <p className="truncate text-muted-foreground">{a.detail}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
