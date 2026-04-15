-- Updated Supabase Schema for Cine-Verse (with tiquetes + RLS)
-- Run in Supabase SQL Editor (full replace)

-- Enable pg_cron if needed for cleanup
-- Full tables: usuarios, películas, funciones, cines, tiquetes, detalle_tiquete

-- Users profile
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('cliente', 'admin')) DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON usuarios FOR ALL USING (auth.uid()::uuid = id);
CREATE POLICY "Admin all usuarios" ON usuarios FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Películas
CREATE TABLE IF NOT EXISTS public.películas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  duracion INTEGER NOT NULL,
  genero TEXT,
  clasificacion TEXT NOT NULL,
  imagen_url TEXT,
  trailer_url TEXT,
  estado TEXT DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE películas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read películas" ON películas FOR SELECT USING (true);
CREATE POLICY "Admin CRUD películas" ON películas FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Funciones
CREATE TABLE IF NOT EXISTS public.funciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelicula_id UUID REFERENCES películas(id) ON DELETE CASCADE NOT NULL,
  cines_id UUID REFERENCES cines(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  sala TEXT,
  precio DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'disponible',
  asientos_disponibles INTEGER DEFAULT 150,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE funciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read funciones" ON funciones FOR SELECT USING (true);
CREATE POLICY "Admin CRUD funciones" ON funciones FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Cines
CREATE TABLE IF NOT EXISTS public.cines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  capacidad INTEGER DEFAULT 150,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE cines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cines" ON cines FOR SELECT USING (true);
CREATE POLICY "Admin CRUD cines" ON cines FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Tiquetes (main ticket)
CREATE TABLE IF NOT EXISTS public.tiquetes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  funcion_id UUID REFERENCES funciones(id) ON DELETE SET NULL NOT NULL,
  nombre_cliente TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'usado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE tiquetes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User own tiquetes" ON tiquetes FOR SELECT USING (auth.uid()::uuid = usuario_id);
CREATE POLICY "Admin all tiquetes" ON tiquetes FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Detalle tiquete (asientos)
CREATE TABLE IF NOT EXISTS public.detalle_tiquete (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tiquete_id UUID REFERENCES tiquetes(id) ON DELETE CASCADE NOT NULL,
  funcion_id UUID REFERENCES funciones(id) ON DELETE SET NULL NOT NULL,
  asiento_numero TEXT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  UNIQUE(funcion_id, asiento_numero)
);

ALTER TABLE detalle_tiquete ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User own detalle" ON detalle_tiquete FOR SELECT USING (
  EXISTS (SELECT 1 FROM tiquetes WHERE id = tiquete_id AND auth.uid()::uuid = usuario_id)
);
CREATE POLICY "Admin all detalle" ON detalle_tiquete FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Indexes
CREATE INDEX idx_funciones_fecha_hora ON funciones(fecha, hora);
CREATE INDEX idx_tiquetes_codigo ON tiquetes(codigo);
CREATE INDEX idx_detalle_funcion_asiento ON detalle_tiquete(funcion_id, asiento_numero);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = timezone('utc'::text, now()); RETURN NEW; END; $$ language plpgsql;

CREATE TRIGGER usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER peliculas_updated BEFORE UPDATE ON películas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER funciones_updated BEFORE UPDATE ON funciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- Users profile (extends auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('cliente', 'admin')) DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS: Users see own profile, admin all
CREATE POLICY \"Users can view own profile\" ON usuarios FOR SELECT USING (auth.uid()::uuid = id);
CREATE POLICY \"Admin can view all profiles\" ON usuarios FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Movies (from Mongo movie.js inferred)
CREATE TABLE IF NOT EXISTS public.peliculas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  duracion INTEGER NOT NULL,
  genero TEXT,
  clasificacion TEXT NOT NULL,
  imagen_url TEXT,
  trailer_url TEXT,
  estado TEXT DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS: Public read, admin CRUD
CREATE POLICY \"Public read películas\" ON películas FOR SELECT USING (true);
CREATE POLICY \"Admin CRUD películas\" ON películas FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Showtimes (Mongo showtime.js)
CREATE TABLE IF NOT EXISTS public.funciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pelicula_id UUID REFERENCES películas(id) ON DELETE CASCADE NOT NULL,
  cinema_id UUID, -- REFERENCES cines(id)
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  sala TEXT,
  precio DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'disponible',
  asientos_disponibles INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE POLICY \"Public read funciones\" ON funciones FOR SELECT USING (true);
CREATE POLICY \"Admin manage funciones\" ON funciones FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Cinemas (Mongo cinema.js)
CREATE TABLE IF NOT EXISTS public.cines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  capacidad INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE POLICY \"Public read cines\" ON cines FOR SELECT USING (true);
CREATE POLICY \"Admin manage cines\" ON cines FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Reservations (Mongo reservation.js)
CREATE TABLE IF NOT EXISTS public.reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  funcion_id UUID REFERENCES funciones(id) ON DELETE SET NULL NOT NULL,
  asientos JSONB NOT NULL, -- array of seat numbers
  total_precio DECIMAL(10,2) NOT NULL,
  qr_code TEXT,
  estado TEXT DEFAULT 'confirmada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE POLICY \"User own reservas\" ON reservas FOR ALL USING (auth.uid()::uuid = user_id);
CREATE POLICY \"Admin all reservas\" ON reservas FOR ALL USING ((SELECT rol FROM usuarios WHERE id = auth.uid()::uuid) = 'admin');

-- Indexes
CREATE INDEX idx_funciones_fecha_hora ON funciones(fecha, hora);
CREATE INDEX idx_reservas_user ON reservas(user_id);
CREATE INDEX idx_reservas_funcion ON reservas(funcion_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_peliculas_updated_at BEFORE UPDATE ON películas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

