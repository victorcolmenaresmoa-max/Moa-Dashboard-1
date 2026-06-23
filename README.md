# MOA Specialists Dashboard — v2 (Auth + RBAC)

Dashboard de gestión de tareas para el equipo de MOA Education.  
Esta versión agrega **Google OAuth**, **RBAC por roles**, y un **proxy seguro** para SheetDB.

---

## Arquitectura

```
Browser
  │
  ├── GET  /            → public/index.html  (SPA estática)
  ├── GET  /api/auth/login     → redirige a Google
  ├── GET  /api/auth/callback  → intercambia código, setea cookie
  ├── GET  /api/auth/logout    → borra cookie
  ├── GET  /api/auth/me        → devuelve usuario actual
  ├── GET  /api/data           → proxy GET SheetDB (autenticado)
  ├── POST /api/data/create    → proxy POST SheetDB (autenticado)
  ├── PATCH /api/data/update   → proxy PATCH SheetDB (RBAC server-side)
  └── DELETE /api/data/delete  → proxy DELETE SheetDB (solo admin)
```

Las credenciales de SheetDB **nunca llegan al navegador**.  
El RBAC se aplica tanto en el cliente (UX) como en el servidor (seguridad real).

---

## 1. Google Cloud — Crear credenciales OAuth

1. Ve a [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Crea un proyecto nuevo o usa uno existente.
3. Haz clic en **+ Create Credentials** → **OAuth client ID**.
4. Tipo de aplicación: **Web application**.
5. En **Authorized redirect URIs** agrega:
   - `https://TU-PROYECTO.vercel.app/api/auth/callback`
   - `http://localhost:3000/api/auth/callback` (para desarrollo local)
6. Copia el **Client ID** y el **Client Secret**.

> Si tu organización usa Google Workspace, considera activar la restricción de dominio con `GOOGLE_ALLOWED_DOMAIN`.

---

## 2. Variables de entorno en Vercel

En el dashboard de Vercel → tu proyecto → **Settings** → **Environment Variables**:

| Variable | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | El Client ID de Google |
| `GOOGLE_CLIENT_SECRET` | El Client Secret de Google |
| `NEXT_PUBLIC_BASE_URL` | `https://tu-proyecto.vercel.app` |
| `GOOGLE_ALLOWED_DOMAIN` | `moaeducation.com` (o vacío para cualquier cuenta) |
| `SESSION_SECRET` | String aleatorio 32+ chars (`openssl rand -base64 32`) |
| `SHEETDB_URL` | `https://sheetdb.io/api/v1/TU_ID` |
| `ADMIN_EMAILS` | `victor.colmenares@moaeducation.com,luis.sumoza@moaeducation.com` |
| `SPECIALIST_EMAILS` | Lista separada por comas de todos los especialistas |

**Copia `.env.example` a `.env.local`** para desarrollo local. Nunca hagas commit de `.env.local`.

---

## 3. Mapeo email → columna de Google Sheets

En `api/auth/callback.js`, la función `getSpecialistKey()` mapea el email de Google Workspace al nombre exacto de la columna en la hoja.  
**Actualiza este mapeo si cambian los emails del equipo.**

```js
function getSpecialistKey(email) {
  const map = {
    "victor.colmenares@moaeducation.com":  "Victor Colmenares",
    "luis.sumoza@moaeducation.com":        "Dirección Académica",
    "roxangel.rodriguez@moaeducation.com": "Roxangel Rodriguez",
    // ...
  };
  return map[email.toLowerCase()] || null;
}
```

---

## 4. Despliegue en Vercel

```bash
# Instala la CLI de Vercel (una sola vez)
npm i -g vercel

# Desde la carpeta del proyecto:
vercel deploy --prod
```

O conecta el repositorio en [vercel.com](https://vercel.com) para despliegue automático en cada push a `main`.

---

## 5. Desarrollo local

```bash
npm install
cp .env.example .env.local
# Edita .env.local con tus valores

vercel dev
# El dashboard estará en http://localhost:3000
```

---

## Reglas de negocio RBAC

### Administradores (`ADMIN_EMAILS`)
Victor Colmenares y Luis Fernando Sumoza (Dirección Académica)

- Acceso total de lectura y edición en todas las columnas.
- **Exclusivo**: son los únicos que pueden establecer **Calidad = "Revisado y aprobado"**.
- **Exclusivo**: son los únicos que pueden modificar los **Deadline 1–4**.
- Pueden eliminar tareas desde la vista Backlog.

### Especialistas (`SPECIALIST_EMAILS`)
Resto del equipo

- Solo pueden editar la celda de notas de **su propia columna** personal.
- Solo pueden cambiar el campo **Estado** en tareas donde su nombre aparece en la columna **Specialists**.
- No pueden tocar Deadlines ni aprobar en Calidad.
- No pueden eliminar tareas.

> Las reglas se aplican **en el servidor** (`api/data/update.js`). El frontend solo las refleja en la UI como feedback inmediato.

---

## Estructura de archivos

```
moa-dashboard/
├── api/
│   ├── auth/
│   │   ├── callback.js   ← OAuth callback, asigna rol
│   │   ├── login.js      ← Redirige a Google
│   │   ├── logout.js     ← Borra cookie
│   │   └── me.js         ← Devuelve usuario autenticado
│   └── data/
│       ├── index.js      ← GET  /api/data
│       ├── create.js     ← POST /api/data/create
│       ├── update.js     ← PATCH /api/data/update  (RBAC aquí)
│       └── delete.js     ← DELETE /api/data/delete (solo admin)
├── lib/
│   └── session.js        ← Firma y verifica cookies con HMAC-SHA256
├── public/
│   ├── index.html        ← SPA principal
│   ├── app.js            ← Lógica del dashboard (auth-aware)
│   └── styles.css        ← Estilos
├── .env.example          ← Plantilla de variables de entorno
├── package.json
├── vercel.json           ← Rutas y configuración de Vercel
└── README.md
```
