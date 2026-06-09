# 👁️ Specialists Dashboard

Dashboard estilo Notion para gestión de tareas de especialistas, con conexión a Google Sheets via SheetDB.

---

## 📁 Estructura de archivos

```
specialists-dashboard/
├── index.html    ← Estructura HTML
├── styles.css    ← Estilos Notion-like
├── app.js        ← Lógica JS + conexión SheetDB
└── README.md     ← Este archivo
```

---

## 🗂️ Columnas requeridas en Google Sheets

Crea una hoja de cálculo con exactamente estas columnas (en la **fila 1**, respetando mayúsculas/minúsculas y tildes):

| # | Nombre de la columna          |
|---|-------------------------------|
| 1 | Tipo de trabajo               |
| 2 | TASKS                         |
| 3 | Vertical                      |
| 4 | Brief Description             |
| 5 | Specialists                   |
| 6 | Fecha de Inicio y Fin         |
| 7 | Estado                        |
| 8 | Calidad                       |
| 9 | Rondas de revisión            |
| 10| Comments                      |
| 11| Deadline 1                    |
| 12| Deadline 2                    |
| 13| Deadline 3                    |
| 14| Deadline 4                    |
| 15| Noryley                       |
| 16| Roxangel                      |
| 17| Ailil                         |
| 18| Asdrubal                      |
| 19| Norilys                       |
| 20| Victor                        |
| 21| Melisa                        |
| 22| AI Summary                    |

---

## ⚙️ Conectar SheetDB

1. Ve a [sheetdb.io](https://sheetdb.io) y crea una cuenta.
2. Conecta tu Google Sheet y copia la URL de la API (ej: `https://sheetdb.io/api/v1/abc123xyz`).
3. Abre `app.js` y reemplaza la línea 5:
   ```js
   const SHEETDB_URL = "https://sheetdb.io/api/v1/TU_ID_AQUI";
   ```

---

## 🚀 Despliegue en Vercel

1. Sube los 3 archivos (`index.html`, `styles.css`, `app.js`) a un repositorio GitHub.
2. Ve a [vercel.com](https://vercel.com), importa el repositorio.
3. En la configuración del proyecto:
   - **Framework Preset:** Other
   - **Output Directory:** `.` (raíz del proyecto)
4. Haz clic en **Deploy** — listo.

---

## 🏷️ Valores válidos por columna

### Tipo de trabajo
- `PROJECT`
- `PERPETUAL`
- `ON-DEMAND`

### Vertical
- `Academy`
- `School`
- `E-MOA`
- `Afterschool`
- `In-Company`

### Estado
- `Not started`
- `In progress`
- `Stand By`
- `Blocked`
- `Done`
- `Delayed Done`

### Calidad
- `Revisado y aprobado`
- `En revisión por especialistas`
- `Sin revisión de otros especialistas`
- `Pendiente de revisión`

---

## 💡 Mientras no configures SheetDB

El dashboard muestra 5 registros de prueba automáticamente hasta que coloques la URL real.
