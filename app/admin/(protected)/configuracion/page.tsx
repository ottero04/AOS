"use client"

import { useEffect, useState } from "react"
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  MonitorSmartphone,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SecurityInfo {
  hasDb: boolean
  hasSessionSecret: boolean
  hasResend: boolean
  resetFlagActive: boolean
  twoFactorEnabled: boolean
  twoFactorSince?: string | null
  failed24h?: number
  sessions: { id: string; created_at: string; last_seen_at: string; ip: string; user_agent: string; current: boolean }[]
  attempts: { id: number; ip: string; username: string; success: boolean; reason: string; user_agent: string; created_at: string }[]
}

function device(ua: string) {
  if (!ua) return "Dispositivo desconocido"
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Otro"
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : /curl|python|bot/i.test(ua) ? "Script/bot" : "Navegador"
  return `${br} en ${os}`
}

const fmt = (d: string) => new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })

const REASONS: Record<string, string> = {
  ok: "Correcto",
  ok_2fa: "Correcto con 2FA",
  credenciales: "Usuario o contraseña incorrectos",
  codigo_2fa: "Código 2FA incorrecto",
}

function Check({ ok, label, help }: { ok: boolean; label: string; help: string }) {
  return (
    <li className="flex gap-3">
      {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {!ok && <p className="text-sm text-muted-foreground">{help}</p>}
      </div>
    </li>
  )
}

function SecurityTab() {
  const [info, setInfo] = useState<SecurityInfo | null>(null)
  const [error, setError] = useState("")
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function load() {
    const res = await fetch("/api/admin/security")
    const data = await res.json()
    if (!res.ok) return setError(data.error || "Error")
    setInfo(data)
  }
  useEffect(() => {
    load()
  }, [])

  async function act(body: Record<string, unknown>) {
    setBusy(true)
    setError("")
    setMsg("")
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error")
      return data
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setBusy(false)
    }
  }

  if (!info) {
    return error ? <p className="text-sm text-destructive">{error}</p> : (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {info.resetFlagActive && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          La variable <code>ADMIN_RESET_2FA</code> está activa en Vercel: la verificación en dos pasos está desactivada.
          Bórrala de Vercel y vuelve a desplegar en cuanto recuperes el acceso.
        </div>
      )}

      {/* Estado general */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Estado de seguridad</h2>
        <ul className="mt-4 space-y-3">
          <Check ok={info.hasDb} label="Base de datos conectada" help="Conéctala en Vercel → Storage para activar sesiones revocables, registro de accesos y 2FA." />
          <Check ok={info.hasSessionSecret} label="Clave de sesión propia (SESSION_SECRET)" help="Agrega en Vercel la variable SESSION_SECRET con un texto largo y aleatorio, marcada como Sensitive." />
          <Check ok={info.twoFactorEnabled} label="Verificación en dos pasos" help="Actívala abajo: además de la contraseña te pedirá un código de tu celular." />
          <Check ok={info.hasResend} label="Avisos por correo de mensajes nuevos" help="Opcional: agrega RESEND_API_KEY en Vercel para recibir cada mensaje en tu correo." />
        </ul>
      </div>

      {/* 2FA */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${info.twoFactorEnabled ? "bg-emerald-100" : "bg-amber-100"}`}>
            {info.twoFactorEnabled ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <ShieldAlert className="h-6 w-6 text-amber-600" />}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Verificación en dos pasos (2FA)</h2>
            <p className="text-sm text-muted-foreground">
              {info.twoFactorEnabled
                ? `Activa desde ${info.twoFactorSince ? fmt(info.twoFactorSince) : "—"}. Aunque alguien tenga tu contraseña, no puede entrar sin tu celular.`
                : "Usa una app como Google Authenticator, Microsoft Authenticator o Authy."}
            </p>
          </div>
        </div>

        {!info.twoFactorEnabled && !setup && (
          <Button
            className="mt-5 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={busy || !info.hasDb}
            onClick={async () => {
              const d = await act({ action: "start2fa" })
              if (d) setSetup(d)
            }}
          >
            <Smartphone className="h-4 w-4" />
            Activar 2FA
          </Button>
        )}

        {setup && (
          <div className="mt-6 grid gap-6 rounded-2xl bg-muted/40 p-5 sm:grid-cols-[auto_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qr} alt="Código QR para tu app autenticadora" className="h-44 w-44 rounded-xl bg-white p-2" />
            <div className="space-y-3 text-sm">
              <p><strong>1.</strong> Abre tu app autenticadora y escanea el código QR.</p>
              <p className="text-muted-foreground">
                ¿No puedes escanear? Escribe esta clave a mano:
                <code className="mt-1 block break-all rounded-lg bg-background p-2 font-mono text-xs text-foreground">{setup.secret}</code>
              </p>
              <p><strong>2.</strong> Escribe el código de 6 dígitos que aparece:</p>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="max-w-[10rem] text-center text-lg tracking-widest"
                />
                <Button
                  disabled={busy || code.length !== 6}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={async () => {
                    const d = await act({ action: "confirm2fa", code })
                    if (d) {
                      setSetup(null)
                      setCode("")
                      setMsg("¡Listo! La verificación en dos pasos quedó activa y se cerraron las demás sesiones.")
                      load()
                    }
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}

        {info.twoFactorEnabled && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Código actual"
              className="max-w-[10rem] text-center"
            />
            <Button
              variant="outline"
              disabled={busy || code.length !== 6}
              onClick={async () => {
                if (!confirm("¿Seguro que quieres desactivar la verificación en dos pasos? Tu panel quedará menos protegido.")) return
                const d = await act({ action: "disable2fa", code })
                if (d) {
                  setCode("")
                  setMsg("Verificación en dos pasos desactivada.")
                  load()
                }
              }}
            >
              Desactivar 2FA
            </Button>
          </div>
        )}

        {msg && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p>}
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>

      {/* Sesiones */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sesiones abiertas</h2>
            <p className="text-sm text-muted-foreground">Dispositivos con acceso al panel en este momento</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            disabled={busy || info.sessions.length <= 1}
            onClick={async () => {
              if (!confirm("¿Cerrar la sesión en todos los demás dispositivos?")) return
              const d = await act({ action: "revokeOthers" })
              if (d) load()
            }}
          >
            <LogOut className="h-4 w-4" />
            Cerrar las demás
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {info.sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-4 py-3">
              <MonitorSmartphone className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium text-foreground">
                  {device(s.user_agent)}{" "}
                  {s.current && <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Esta sesión</span>}
                </p>
                <p className="text-muted-foreground">IP {s.ip} · activa {fmt(s.last_seen_at)}</p>
              </div>
              {!s.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={busy}
                  onClick={async () => {
                    const d = await act({ action: "revoke", id: s.id })
                    if (d) load()
                  }}
                >
                  Cerrar
                </Button>
              )}
            </li>
          ))}
          {info.sessions.length === 0 && <li className="py-3 text-sm text-muted-foreground">Sin datos (requiere base de datos)</li>}
        </ul>
      </div>

      {/* Registro de accesos */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Registro de inicios de sesión</h2>
        <p className="text-sm text-muted-foreground">
          Últimos 30 intentos{typeof info.failed24h === "number" ? ` · ${info.failed24h} fallidos en 24 h` : ""}. Tras 5 fallos seguidos, esa IP queda bloqueada 15 minutos.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Resultado</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">IP</th>
                <th className="py-2 pr-4">Usuario intentado</th>
                <th className="py-2">Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {info.attempts.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 pr-4">
                    <span className={`inline-flex items-center gap-1 ${a.success ? "text-emerald-700" : "text-red-600"}`}>
                      {a.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {REASONS[a.reason] ?? a.reason}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-2 pr-4 text-muted-foreground">{fmt(a.created_at)}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{a.ip}</td>
                  <td className="py-2 pr-4">{a.username}</td>
                  <td className="py-2 text-muted-foreground">{device(a.user_agent)}</td>
                </tr>
              ))}
              {info.attempts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-muted-foreground">Sin registros todavía</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const FIELDS: { key: string; label: string; textarea?: boolean; placeholder?: string; group: string }[] = [
  { key: "heroTitle", label: "Título principal", group: "Portada" },
  { key: "heroHighlight", label: "Título destacado (en color)", group: "Portada" },
  { key: "heroSubtitle", label: "Descripción", textarea: true, group: "Portada" },
  { key: "whatsappNumber", label: "WhatsApp (con indicativo, ej. 573001234567)", group: "Contacto" },
  { key: "whatsappMessage", label: "Mensaje inicial de WhatsApp", textarea: true, group: "Contacto" },
  { key: "email", label: "Correo de contacto", group: "Contacto" },
  { key: "location", label: "Ubicación", group: "Contacto" },
  { key: "facebookUrl", label: "Facebook (enlace a tu página)", placeholder: "https://facebook.com/tu-pagina", group: "Redes sociales" },
  { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/tu-cuenta", group: "Redes sociales" },
  { key: "xUrl", label: "X (Twitter)", placeholder: "https://x.com/tu-cuenta", group: "Redes sociales" },
]

function ContentTab() {
  const [content, setContent] = useState<Record<string, string> | null>(null)
  const [hasDb, setHasDb] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content)
        setHasDb(d.hasDb)
      })
  }, [])

  async function save() {
    setSaving(true)
    setMsg("")
    setError("")
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Error al guardar")
      setContent(d.content)
      setMsg("Guardado. La página pública ya muestra los cambios.")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!content) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    )
  }

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)))

  return (
    <div className="space-y-6">
      {!hasDb && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Conecta la base de datos para poder guardar cambios.
        </div>
      )}
      {groups.map((g) => (
        <div key={g} className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{g}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.filter((f) => f.group === g).map((f) => (
              <div key={f.key} className={f.textarea ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-sm font-medium">{f.label}</label>
                {f.textarea ? (
                  <Textarea rows={3} value={content[f.key] ?? ""} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} />
                ) : (
                  <Input value={content[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          {g === "Redes sociales" && (
            <p className="mt-3 text-xs text-muted-foreground">Deja vacía una red para ocultar su ícono en la página.</p>
          )}
        </div>
      ))}
      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={saving || !hasDb} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}

export default function ConfiguracionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>
        <p className="mt-1 text-muted-foreground">Seguridad del panel y contenido de tu página</p>
      </div>
      <Tabs defaultValue="seguridad">
        <TabsList className="mb-6">
          <TabsTrigger value="seguridad" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="contenido">Contenido del sitio</TabsTrigger>
        </TabsList>
        <TabsContent value="seguridad">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="contenido">
          <ContentTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
