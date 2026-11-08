import { Pool } from "pg"

// Conexión a Postgres (Neon). Solo se usa desde el servidor; el navegador nunca la ve.
// Vercel define DATABASE_URL al conectar la base de datos desde la pestaña Storage.

let pool: Pool | null = null
let schemaReady: Promise<void> | null = null

export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    })
  }
  return pool
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip TEXT,
  user_agent TEXT,
  revoked_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT,
  username TEXT,
  success BOOLEAN NOT NULL,
  reason TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_time ON login_attempts (ip, created_at);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS contact_messages_ip_time ON contact_messages (ip, created_at);
CREATE TABLE IF NOT EXISTS automations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'correo',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'en_desarrollo',
  drive_url TEXT NOT NULL DEFAULT '',
  reports_count INTEGER NOT NULL DEFAULT 0,
  last_report_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_title TEXT NOT NULL DEFAULT '',
  public_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null
        throw err
      })
  }
  return schemaReady
}

/** Consulta parametrizada. Usar SIEMPRE $1, $2... para los valores (evita inyección SQL). */
export async function sql<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema()
  const result = await getPool().query(text, params as any[])
  return result.rows as T[]
}

export async function logActivity(action: string, detail = ""): Promise<void> {
  if (!hasDb()) return
  try {
    await sql("INSERT INTO activity_log (action, detail) VALUES ($1, $2)", [action, detail.slice(0, 300)])
  } catch (e) {
    console.error("activity log error", e)
  }
}

export async function getSetting<T>(key: string): Promise<T | null> {
  if (!hasDb()) return null
  const rows = await sql<{ value: T }>("SELECT value FROM settings WHERE key = $1", [key])
  return rows[0]?.value ?? null
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await sql(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  )
}

export async function deleteSetting(key: string): Promise<void> {
  await sql("DELETE FROM settings WHERE key = $1", [key])
}
