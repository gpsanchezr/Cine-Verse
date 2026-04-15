-- 🎬 CINE-VERSE SUPABASE SCHEMA - VERSIÓN FINAL CORREGIDA
-- Ejecuta esto para limpiar y crear todo correctamente.

-- 0. Limpieza (Opcional, por si hay tablas viejas con errores)
DROP TABLE IF EXISTS public.detalle_tiquete CASCADE;
DROP TABLE IF EXISTS public.tiquetes CASCADE;
DROP TABLE IF EXISTS public.funciones CASCADE;
DROP TABLE IF EXISTS public.cines CASCADE;
DROP TABLE IF EXISTS public.peliculas CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- 1. TABLA DE USUARIOS (Corregida: PRIMARY KEY antes de REFERENCES)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('cliente', 'admin')) DEFAULT 'cliente',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PELÍCULAS
CREATE TABLE public.peliculas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  duracion INTEGER NOT NULL CHECK (duracion > 0),
  genero TEXT,
  clasificacion TEXT NOT NULL,
  imagen_url TEXT,
  trailer_url TEXT,
  estado TEXT DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CINES
CREATE TABLE public.cines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  capacidad INTEGER DEFAULT 150 CHECK (capacidad > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FUNCIONES
CREATE TABLE public.funciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelicula_id UUID NOT NULL REFERENCES public.peliculas(id) ON DELETE CASCADE,
  cine_id UUID REFERENCES public.cines(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  sala TEXT DEFAULT 'Principal',
  precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
  estado TEXT DEFAULT 'disponible',
  asientos_disponibles INTEGER DEFAULT 150 CHECK (asientos_disponibles >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TIQUETES
CREATE TABLE public.tiquetes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  funcion_id UUID NOT NULL REFERENCES public.funciones(id) ON DELETE CASCADE,
  nombre_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo','usado','cancelado')),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DETALLE_TIQUETE
CREATE TABLE public.detalle_tiquete (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tiquete_id UUID NOT NULL REFERENCES public.tiquetes(id) ON DELETE CASCADE,
  funcion_id UUID NOT NULL REFERENCES public.funciones(id) ON DELETE CASCADE,
  asiento_numero TEXT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  UNIQUE(funcion_id, asiento_numero)
);

-- SEGURIDAD RLS (Activar para todas)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peliculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_tiquete ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS BÁSICAS (Para que la web pueda leer datos)
CREATE POLICY "Lectura publica peliculas" ON public.peliculas FOR SELECT USING (true);
CREATE POLICY "Lectura publica funciones" ON public.funciones FOR SELECT USING (true);
CREATE POLICY "Lectura publica detalle" ON public.detalle_tiquete FOR SELECT USING (true);

-- DATOS INICIALES
INSERT INTO public.cines (nombre, ubicacion, capacidad) 
VALUES ('CineVerse Premium', 'Barranquilla', 150)
ON CONFLICT DO NOTHING;