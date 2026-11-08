"use client"

import { useEffect, useState } from "react"
import { Inbox, Mail, Trash2, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  nombre: string
  email: string
  mensaje: string
  created_at: string
  read_at: string | null
}

export default function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<"todos" | "sin_leer">("todos")

  async function load() {
    try {
      const res = await fetch("/api/admin/messages")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cargar")
      setMessages(data.messages)
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

  async function markRead(m: Message, read = true) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, read }),
    })
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read_at: read ? new Date().toISOString() : null } : x)))
  }

  async function remove(m: Message) {
    if (!confirm(`¿Eliminar el mensaje de ${m.nombre}?`)) return
    await fetch(`/api/admin/messages?id=${encodeURIComponent(m.id)}`, { method: "DELETE" })
    setSelected(null)
    load()
  }

  function open(m: Message) {
    setSelected(m.id === selected ? null : m.id)
    if (!m.read_at) markRead(m)
  }

  const unread = messages.filter((m) => !m.read_at).length
  const list = filter === "sin_leer" ? messages.filter((m) => !m.read_at) : messages

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mensajes</h1>
        <p className="mt-1 text-muted-foreground">
          Lo que te escriben desde el formulario de contacto · {unread} sin leer
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1">
        {(["todos", "sin_leer"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "todos" ? "Todos" : `Sin leer (${unread})`}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">{error}</div>}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-secondary" />
          <p className="mt-4 font-medium text-foreground">No hay mensajes</p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {list.map((m) => (
            <div key={m.id}>
              <button
                onClick={() => open(m)}
                className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/40"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.read_at ? "bg-transparent" : "bg-secondary"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${m.read_at ? "text-foreground" : "font-semibold text-foreground"}`}>
                    {m.nombre} <span className="font-normal text-muted-foreground">· {m.email}</span>
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{m.mensaje}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </button>
              {selected === m.id && (
                <div className="bg-muted/30 px-6 pb-6 pt-2">
                  {/* El texto se muestra como texto plano: React escapa cualquier código */}
                  <p className="whitespace-pre-wrap rounded-2xl bg-background p-4 text-sm text-foreground">{m.mensaje}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" asChild className="gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: tu mensaje a AOS")}`}>
                        <Reply className="h-4 w-4" />
                        Responder
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => markRead(m, false)} className="gap-1.5">
                      <Mail className="h-4 w-4" />
                      Marcar sin leer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(m)} className="gap-1.5 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
