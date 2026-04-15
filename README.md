# 🎬 Cine-Verse — Sistema de Gestión de Cine

**SENA CNCA – Nodo Tic ADSO17 | Proyecto Final**

Sistema web completo para gestión de cartelera y venta de tiquetes de cine, desarrollado con React + Vite + MUI v5 + Supabase.

---

## 🚀 Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + MUI v5 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Chatbot | Google Gemini AI (gemini-1.5-flash) |
| Emails | EmailJS |
| Gráficas | Chart.js + react-chartjs-2 |
| Routing | React Router v6 |

---

## ⚙️ Configuración inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
El archivo `.env` ya incluye las credenciales de Supabase. **No lo subas a GitHub.**

### 3. Configurar la base de datos en Supabase
1. Abre tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de `database.sql`
4. Para hacer un usuario admin, ejecuta:
   ```sql
   UPDATE public.usuarios SET rol = 'admin' WHERE email = 'TU_EMAIL@gmail.com';
   ```

### 4. Configurar EmailJS
1. Crea cuenta en [emailjs.com](https://emailjs.com) (gratis)
2. Crea un **Email Service** con tu Gmail
3. Crea un **Email Template** con estas variables:
   - `{{nombre}}` — Nombre del cliente
   - `{{pelicula}}` — Título de la película
   - `{{sala}}` — Sala de la función
   - `{{asientos}}` — Asientos comprados
   - `{{codigo}}` — Código único del tiquete
   - `{{total}}` — Valor total pagado
   - `{{fecha}}` — Fecha y hora de la función
4. Edita `src/services/emailService.js` y reemplaza:
   ```js
   const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID_AQUI'
   const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID_AQUI'
   const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI'
   const ADMIN_EMAIL = 'tu_correo@gmail.com'
   ```

### 5. Configurar CineBot (Gemini AI)
1. Obtén tu API Key en [Google AI Studio](https://aistudio.google.com)
2. Edita `src/components/CineBot.jsx` y reemplaza:
   ```js
   const GEMINI_API_KEY = 'TU_API_KEY_AQUI'
   ```

### 6. Ejecutar en desarrollo
```bash
npm run dev
```

---

## 📋 Funcionalidades implementadas

### ✅ Requisitos del PDF — 100% cubiertos
- [x] **Gestión de películas**: CRUD completo (título, género, duración, clasificación, descripción)
- [x] **Programación de funciones**: Crear funciones (fecha y hora) asociadas a sala
- [x] **Gestión de asientos**: Grid visual de exactamente 150 sillas (10 filas × 15 columnas), bloqueo de ocupados, restricción UNIQUE(funcion_id, asiento_numero)
- [x] **Venta de tiquetes**: Selección de película + función + asientos, cálculo automático, código único `CV-XXXX-XXXX-XXXX`, transacción atómica
- [x] **Validación de tiquetes**: Buscar por código, estados: Válido / Usado / Inválido, marcar como "Usado"
- [x] **Panel Admin**: Dashboard con total de ventas, ocupación de sala, gráficas

### ✨ Extras implementados
- [x] **CineBot** con Gemini AI + lectura de cartelera en tiempo real desde Supabase
- [x] **EmailJS** — confirmación de tiquete al cliente y copia al admin
- [x] **Contraseñas seguras** — regex `/^(?=.*[A-Z]).{6,}$/` con indicadores visuales
- [x] **Diseño premium oscuro** — tema cinema con MUI v5
- [x] **Actualización en tiempo real** de asientos con Supabase Realtime
- [x] **RLS en todas las tablas** — seguridad a nivel de fila
- [x] **Trigger automático** para crear perfil al registrarse

---

## 📁 Estructura del proyecto

```
cine-verse/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CineBot.jsx          ← Chatbot IA con Gemini
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx         ← Validación contraseña segura
│   │   ├── Cartelera.jsx
│   │   ├── PeliculaDetalle.jsx
│   │   ├── SeatSelection.jsx    ← Grid 150 asientos
│   │   ├── Checkout.jsx         ← Compra + EmailJS
│   │   ├── ValidarTiquete.jsx
│   │   └── admin/
│   │       ├── AdminLayout.jsx
│   │       ├── Dashboard.jsx    ← Charts de ventas
│   │       ├── Peliculas.jsx    ← CRUD películas
│   │       ├── Funciones.jsx    ← CRUD funciones
│   │       └── Tiquetes.jsx
│   ├── services/
│   │   └── emailService.js      ← EmailJS utility
│   ├── App.jsx
│   ├── main.jsx
│   ├── theme.js                 ← Tema oscuro premium MUI
│   └── supabaseClient.js
├── database.sql                 ← Script SQL completo
├── package.json
├── vite.config.js
└── .env                         ← Credenciales Supabase
```

---

## 🔑 Endpoints del API (Supabase REST)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/rest/v1/peliculas` | Listar películas |
| POST | `/rest/v1/peliculas` | Crear película (admin) |
| PATCH | `/rest/v1/peliculas?id=eq.{id}` | Editar película (admin) |
| DELETE | `/rest/v1/peliculas?id=eq.{id}` | Eliminar película (admin) |
| GET | `/rest/v1/funciones` | Listar funciones |
| POST | `/rest/v1/funciones` | Crear función (admin) |
| GET | `/rest/v1/detalle_tiquete?funcion_id=eq.{id}` | Asientos ocupados por función |
| POST | `/rest/v1/tiquetes` | Crear tiquete (autenticado) |
| POST | `/rest/v1/detalle_tiquete` | Guardar asientos del tiquete |
| GET | `/rest/v1/tiquetes?codigo=eq.{codigo}` | Validar tiquete por código |
| PATCH | `/rest/v1/tiquetes?id=eq.{id}` | Marcar tiquete como usado |

---

## 🛡️ Seguridad

- **Row Level Security (RLS)** habilitada en todas las tablas
- **Contraseña segura** con regex: mínimo 6 caracteres + 1 mayúscula
- **UNIQUE(funcion_id, asiento_numero)** previene doble venta en base de datos
- **Validaciones en frontend y backend**
- **Transacciones** al comprar tiquetes

---

## 📄 Diagrama ER

```
usuarios ←───────────── tiquetes
    │                      │
    │              funcion_id (FK)
    │                      │
peliculas ──→ funciones ───┘
                           │
                    detalle_tiquete
                    (funcion_id, asiento_numero UNIQUE)
```

---

*Desarrollado para SENA CNCA – Nodo Tic ADSO17*
