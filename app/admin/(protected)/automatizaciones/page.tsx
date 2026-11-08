"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Workflow,
  Pencil,
  Trash2,
  FolderOpen,
  FilePlus2,
  Globe,
  Lock,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Automation {
  id: string
  title: string
  client: string
  category: string
  description: string
  status: string
  driveUrl: string
  reportsCount: number
  lastReportAt: string | null
  isPublic: boolean
  publicTitle: string
  publicSummary: string
}

const EMPTY: Omit<Automation, "id" | "lastReportAt"> = {
  title: "",
  client: "",
  category: "correo",
  description: "",
  status: "en_desarrollo",
  driveUrl: "",
  reportsCount: 0,
  isPublic: false,
  publicTitle: "",
  publicSummary: "",
}

const STATUS: Record<string, { label: string; cls: string }> = {
  activa: { label: "Activa", cls: "bg-emerald-100 text-emerald-700" },
  pausada: { label: "Pausada", cls: "bg-amber-100 text-amber-700" },
  en_desarrollo: { label: "En desarrollo", cls: "bg-blue-100 text-blue-700" },
}

const CATEGORIES: Record<string, string> = {
  correo: "Correo y adjuntos",
  informes: "Informes",
  documentos: "Documentos",
  notificaciones: "Notificaciones",
  otro: "Otro",
}

const selectCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

export default function AutomatizacionesPage() {
  const [items, setItems] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function load() {
    try {
      const res = await fetch("/api/admin/automations")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cargar")
      setItems(data.automations)
      setError("")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditingId(null)
    setForm(EMPTY)
    setFormError("")
    setOpen(true)
  }

  function openEdit(a: Automation) {
    setEditingId(a.id)
    const { id, lastReportAt, ...rest } = a
    setForm(rest)
    setFormError("")
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    setFormError("")
    try {
      const res = await fetch("/api/admin/automations", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo guardar")
      setOpen(false)
      load()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(a: Automation) {
    if (!confirm(`¿Eliminar "${a.title}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/admin/automations?id=${encodeURIComponent(a.id)}`, { method: "DELETE" })
    load()
  }

  async function addReport(a: Automation) {
    const value = prompt(`¿Cuántos informes nuevos generó "${a.title}"?`, "1")
    if (value === null) return
    const count = Math.floor(Number(value))
    if (!count || count < 1) return
    await fetch("/api/admin/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report", id: a.id, count }),
    })
    load()
  }

  const filtered = items.filter((a) =>
    `${a.title} ${a.client}`.toLowerCase().includes(search.toLowerCase())
  )
  const totalReports = items.reduce((acc, a) => acc + a.reportsCount, 0)

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Automatizaciones</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? "flujo" : "flujos"} · {totalReports.toLocaleString("es-CO")} informes generados
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Plus className="h-4 w-4" />
          Nueva automatización
        </Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">{error}</div>}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Workflow className="mx-auto h-10 w-10 text-secondary" />
          <p className="mt-4 font-medium text-foreground">
            {items.length === 0 ? "Registra tu primera automatización" : "Sin resultados"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Por ejemplo: "Radicados Ley Ángel → PDF en Drive" o "Informe de tránsito semanal".
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((a) => (
            <div key={a.id} className="flex flex-col rounded-3xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.client || "Sin cliente"} · {CATEGORIES[a.category] ?? a.category}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS[a.status]?.cls ?? ""}`}>
                  {STATUS[a.status]?.label ?? a.status}
                </span>
              </div>

              {a.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>}

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold text-foreground">{a.reportsCount.toLocaleString("es-CO")}</p>
                  <p className="text-xs text-muted-foreground">
                    informes
                    {a.lastReportAt && ` · último ${new Date(a.lastReportAt).toLocaleDateString("es-CO")}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    a.isPublic ? "bg-cyan-100 text-cyan-800" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {a.isPublic ? "Visible en AOS Flow" : "Privada"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" onClick={() => addReport(a)} className="gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <FilePlus2 className="h-4 w-4" />
                  Registrar informes
                </Button>
                {a.driveUrl && (
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a href={a.driveUrl} target="_blank" rel="noopener noreferrer">
                      <FolderOpen className="h-4 w-4" />
                      Drive
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => openEdit(a)} className="gap-1.5">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(a)} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar automatización" : "Nueva automatización"}</DialogTitle>
            <DialogDescription>Los datos del cliente son privados; solo tú los ves.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nombre *</label>
              <Input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Radicados Ley Ángel → PDF en Drive" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Cliente</label>
                <Input value={form.client} maxLength={120} onChange={(e) => setForm({ ...form, client: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tipo</label>
                <select className={selectCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CATEGORIES).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Estado</label>
                <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(STATUS).map(([v, s]) => (
                    <option key={v} value={v}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Informes generados</label>
                <Input type="number" min={0} value={form.reportsCount} onChange={(e) => setForm({ ...form, reportsCount: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Carpeta de Drive (enlace)</label>
              <Input value={form.driveUrl} onChange={(e) => setForm({ ...form, driveUrl: e.target.value })} placeholder="https://drive.google.com/..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Notas internas</label>
              <Textarea rows={3} maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Qué hace, filtros que usa, a quién se le entrega..." />
            </div>

            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Mostrar como caso en la página</p>
                  <p className="text-xs text-muted-foreground">Aparece en AOS Flow con el título y resumen públicos. Nunca se muestra el cliente.</p>
                </div>
                <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
              </div>
              {form.isPublic && (
                <div className="mt-4 space-y-3">
                  <Input value={form.publicTitle} maxLength={120} onChange={(e) => setForm({ ...form, publicTitle: e.target.value })} placeholder="Título público, ej. Archivo automático de radicados para un despacho jurídico" />
                  <Textarea rows={2} maxLength={400} value={form.publicSummary} onChange={(e) => setForm({ ...form, publicSummary: e.target.value })} placeholder="Resumen público sin datos del cliente" />
                </div>
              )}
            </div>

            {formError && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
