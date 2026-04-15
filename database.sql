-- ============================================================
--  CINE-VERSE — Script SQL para Supabase (PostgreSQL)
--  SENA CNCA - Nodo Tic ADSO17
--  Autor: Equipo Cine-Verse
-- ============================================================
-- Ejecutar en: Supabase → SQL Editor → Run
-- ============================================================

-- 1. TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  rol         TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Admins pueden ver todos los usuarios
CREATE POLICY "admin_select_all_usuarios" ON public.usuarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- 2. TABLA: peliculas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.peliculas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  duracion     INTEGER NOT NULL CHECK (duracion > 0),       -- minutos
  genero       TEXT NOT NULL,
  clasificacion TEXT NOT NULL,                               -- TP, G, PG, +13, +18, R
  imagen_url   TEXT,
  trailer_url  TEXT,
  estado       TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.peliculas ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer películas activas
CREATE POLICY "peliculas_public_read" ON public.peliculas
  FOR SELECT USING (true);

-- Solo admins pueden crear, editar y eliminar
CREATE POLICY "peliculas_admin_write" ON public.peliculas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- 3. TABLA: funciones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.funciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pelicula_id UUID NOT NULL REFERENCES public.peliculas(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora        TIME NOT NULL,
  sala        TEXT NOT NULL DEFAULT 'Sala Principal',
  precio      NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  estado      TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'cancelada')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.funciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funciones_public_read" ON public.funciones
  FOR SELECT USING (true);

CREATE POLICY "funciones_admin_write" ON public.funciones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- 4. TABLA: tiquetes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tiquetes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          TEXT NOT NULL UNIQUE,                     -- Código único: CV-XXXX-XXXX-XXXX
  usuario_id      UUID REFERENCES public.usuarios(id),
  funcion_id      UUID NOT NULL REFERENCES public.funciones(id),
  nombre_cliente  TEXT,
  email_cliente   TEXT,
  total           NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  estado          TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'usado', 'cancelado')),
  fecha_uso       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tiquetes ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden crear y ver sus propios tiquetes
CREATE POLICY "tiquetes_insert_auth" ON public.tiquetes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tiquetes_select_own" ON public.tiquetes
  FOR SELECT USING (
    auth.uid() = usuario_id
    OR EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "tiquetes_update_admin" ON public.tiquetes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
    OR auth.uid() IS NOT NULL  -- para validación (marcar como usado)
  );

-- Lectura por código (para validación sin login)
CREATE POLICY "tiquetes_select_by_codigo" ON public.tiquetes
  FOR SELECT USING (true);

-- ============================================================
-- 5. TABLA: detalle_tiquete
-- (Relación muchos a muchos entre tiquete y asientos)
-- RESTRICCIÓN ÚNICA: un asiento NO puede venderse dos veces
-- para la misma función → UNIQUE(funcion_id, asiento_numero)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.detalle_tiquete (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tiquete_id       UUID NOT NULL REFERENCES public.tiquetes(id) ON DELETE CASCADE,
  funcion_id       UUID NOT NULL REFERENCES public.funciones(id),
  asiento_numero   TEXT NOT NULL,                            -- Ej: 'A1', 'B12', 'J15'
  precio_unitario  NUMERIC(10, 2) NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  -- ⚡ REGLA CRÍTICA: previene doble venta del mismo asiento en la misma función
  UNIQUE(funcion_id, asiento_numero)
);

ALTER TABLE public.detalle_tiquete ENABLE ROW LEVEL SECURITY;

CREATE POLICY "detalle_tiquete_insert_auth" ON public.detalle_tiquete
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "detalle_tiquete_select" ON public.detalle_tiquete
  FOR SELECT USING (true);

CREATE POLICY "detalle_tiquete_admin" ON public.detalle_tiquete
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- ÍNDICES para mejorar rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_funciones_pelicula ON public.funciones(pelicula_id);
CREATE INDEX IF NOT EXISTS idx_funciones_fecha ON public.funciones(fecha);
CREATE INDEX IF NOT EXISTS idx_tiquetes_codigo ON public.tiquetes(codigo);
CREATE INDEX IF NOT EXISTS idx_tiquetes_funcion ON public.tiquetes(funcion_id);
CREATE INDEX IF NOT EXISTS idx_detalle_funcion ON public.detalle_tiquete(funcion_id);
CREATE INDEX IF NOT EXISTS idx_detalle_asiento ON public.detalle_tiquete(asiento_numero);

-- ============================================================
-- TRIGGER: auto-crear perfil al registrarse un usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    'cliente'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- DATOS DE PRUEBA — Películas y funciones iniciales
-- ============================================================
INSERT INTO public.peliculas (titulo, descripcion, duracion, genero, clasificacion, imagen_url, estado)
VALUES
  (
    'Dune: Parte Dos',
    'Paul Atreides se une a los Fremen y emprende un viaje de venganza contra los conspiradores que destruyeron a su familia. Mientras se enfrenta a una elección entre el amor de su vida y el destino del universo conocido.',
    166, 'Ciencia Ficción', '+13',
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&q=80',
    'activa'
  ),
  (
    'Kung Fu Panda 4',
    'Po debe entrenar a un nuevo guerrero dragón, mientras se embarca en una aventura para encontrar un nuevo hogar y enfrentarse a un nuevo villano.',
    94, 'Animación', 'TP',
    'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=500&q=80',
    'activa'
  ),
  (
    'Deadpool & Wolverine',
    'Deadpool y Wolverine se unen en una aventura loca a través del multiverso con acción, humor y sorpresas para todos los fans de Marvel.',
    127, 'Acción', '+18',
    'https://images.unsplash.com/photo-1608889175157-4a2e08ecabb7?w=500&q=80',
    'activa'
  )
ON CONFLICT DO NOTHING;

-- Funciones de ejemplo (se insertan con fechas relativas)
INSERT INTO public.funciones (pelicula_id, fecha, hora, sala, precio, estado)
SELECT
  p.id,
  (CURRENT_DATE + INTERVAL '1 day')::DATE,
  '14:30',
  'Sala Principal',
  18000,
  'disponible'
FROM public.peliculas p WHERE p.titulo = 'Dune: Parte Dos'
ON CONFLICT DO NOTHING;

INSERT INTO public.funciones (pelicula_id, fecha, hora, sala, precio, estado)
SELECT
  p.id,
  (CURRENT_DATE + INTERVAL '1 day')::DATE,
  '19:00',
  'Sala Principal',
  18000,
  'disponible'
FROM public.peliculas p WHERE p.titulo = 'Dune: Parte Dos'
ON CONFLICT DO NOTHING;

INSERT INTO public.funciones (pelicula_id, fecha, hora, sala, precio, estado)
SELECT
  p.id,
  (CURRENT_DATE + INTERVAL '2 days')::DATE,
  '16:00',
  'Sala Principal',
  15000,
  'disponible'
FROM public.peliculas p WHERE p.titulo = 'Kung Fu Panda 4'
ON CONFLICT DO NOTHING;

INSERT INTO public.funciones (pelicula_id, fecha, hora, sala, precio, estado)
SELECT
  p.id,
  (CURRENT_DATE + INTERVAL '3 days')::DATE,
  '20:30',
  'Sala Principal',
  22000,
  'disponible'
FROM public.peliculas p WHERE p.titulo = 'Deadpool & Wolverine'
ON CONFLICT DO NOTHING;

-- ============================================================
-- USUARIO ADMIN INICIAL
-- Para crear un admin: 
-- 1. Regístrate normalmente en la app
-- 2. Ejecuta este UPDATE con tu email:
-- ============================================================
-- UPDATE public.usuarios SET rol = 'admin' WHERE email = 'TU_EMAIL_ADMIN@gmail.com';

-- ============================================================
-- VERIFICACIÓN: Confirmar estructura creada correctamente
-- ============================================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') as columnas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('usuarios', 'peliculas', 'funciones', 'tiquetes', 'detalle_tiquete')
ORDER BY table_name;
