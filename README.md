# Cine-Verse - Supabase Edition 🚀

## 🎥 Full-Stack Movie Ticketing App

**Backend: NONE** - Pure **Supabase** (Auth + Postgres + Realtime + Storage)

## 📦 Setup

1. **Supabase Project:**
   - Create project at supabase.com
   - Copy `.env`:
     ```
     VITE_SUPABASE_URL=your_url
     VITE_SUPABASE_ANON_KEY=your_key
     ```
   - **Run SQL:** `supabase-schema.sql` (all tables/RLS/realtime)

2. **Frontend:**
```
npm install
npm run dev
```
http://localhost:5173

## 🔑 Features

- **Supabase Auth** + usuarios profiles
- **Cartelera** - Movies + funciones (realtime)
- **SeatSelection** - Interactive map + realtime updates
- **Checkout** - Transactions + EmailJS tiquetes
- **ValidarTiquete** - QR/code validation
- **Admin** - Full CRUD (RLS protected)

## 🗑️ Legacy (Deprecated)
- `server/` - Old MongoDB/Express (ignored)

## 📊 Schema
```
usuarios → auth.users | películas | funciones | cines
tiquetes ← detalle_tiquete (asientos UNIQUE)
```

**Live Demo Ready!** Schema deployed = Full app works.
