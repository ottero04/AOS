# AOS — Página web y panel de administración

Next.js en Vercel. Panel privado en `/admin/login` (cualquier otra ruta de `/admin` sin sesión responde 404).

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `ADMIN_USERNAME` | Sí | Usuario del panel |
| `ADMIN_PASSWORD` | Sí | Contraseña del panel (mín. 16 caracteres). Marcar **Sensitive** |
| `SESSION_SECRET` | Sí (para 2FA) | Texto largo y aleatorio que firma las sesiones y cifra el 2FA. Marcar **Sensitive**. Si se cambia, se cierran todas las sesiones y hay que volver a activar el 2FA |
| `DATABASE_URL` | Sí | La pone Vercel al conectar la base de datos (Storage → Neon) |
| `BLOB_READ_WRITE_TOKEN` | Sí | La pone Vercel al conectar Blob (imágenes de proyectos) |
| `RESEND_API_KEY` | Opcional | Envía a tu correo cada mensaje del formulario de contacto |
| `CONTACT_TO_EMAIL` | Opcional | Correo de respaldo para los avisos (lo normal es configurarlo en el panel → Configuración → Contenido → Notificaciones) |
| `CONTACT_FROM_EMAIL` | Opcional | Remitente verificado en Resend, ej. `AOS Web <web@aotesoft.com>` |

Las tablas de la base de datos se crean solas la primera vez.

## Seguridad incluida

- Sesiones firmadas y guardadas en la base de datos: se pueden ver y cerrar desde Configuración.
- Verificación en dos pasos (código de 6 dígitos de Google Authenticator / Authy). Un código no se puede usar dos veces.
- 5 intentos fallidos desde una misma IP → bloqueo de 15 minutos. Registro de todos los intentos.
- Protección CSRF (las acciones del panel solo se aceptan desde tu propio dominio) y cookies `SameSite=Strict`.
- Validación y límites de tamaño en todo lo que entra; enlaces `javascript:` bloqueados.
- Formulario de contacto con campo trampa anti-robots y máximo 3 mensajes cada 10 minutos por IP.
- Cabeceras de seguridad: CSP, HSTS, X-Frame-Options, nosniff, etc.
- Si la base de datos falla, la página pública sigue funcionando y el panel se bloquea (falla cerrada).

## Emergencias

**Perdí el celular con el 2FA:** en Vercel agrega `ADMIN_RESET_2FA` = `true`, haz Redeploy, entra solo con usuario y contraseña, y en Configuración vuelve a activar el 2FA. Después **borra** `ADMIN_RESET_2FA` y haz Redeploy otra vez.

**Creo que alguien entró:** cambia `ADMIN_PASSWORD` y `SESSION_SECRET` en Vercel y haz Redeploy (eso invalida todas las sesiones). Revisa Configuración → Registro de inicios de sesión.

**Me están atacando con tráfico:** Vercel → proyecto → Firewall → activar *Attack Mode*.
