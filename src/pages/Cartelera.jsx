import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  CardActions, Button, Chip, CircularProgress, Alert, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment
} from '@mui/material'
import { AccessTime, Category, PlayArrow, Search, CalendarMonth } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const CLASIFICACION_COLORS = {
  'G': '#2ECC71', 'PG': '#3498DB', 'PG-13': '#F39C12',
  '+13': '#F39C12', '+18': '#E74C3C', 'R': '#E74C3C', 'TP': '#2ECC71',
}

export default function Cartelera() {
  const navigate = useNavigate()
  const [peliculas, setPeliculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [generoFiltro, setGeneroFiltro] = useState('')

  useEffect(() => {
    fetchPeliculas()
  }, [])

  const fetchPeliculas = async () => {
    setLoading(true)
    const hoy = new Date().toISOString().split('T')[0]
    const { data, error: err } = await supabase
      .from('peliculas')
      .select(`
        *,
        funciones (id, fecha, hora, sala, precio, estado)
      `)
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })

    if (err) setError('Error cargando la cartelera.')
    else setPeliculas(data || [])
    setLoading(false)
  }

  const generos = [...new Set(peliculas.map(p => p.genero).filter(Boolean))]

  const peliculasFiltradas = peliculas.filter(p => {
    const matchBusqueda = p.titulo?.toLowerCase().includes(busqueda.toLowerCase())
    const matchGenero = !generoFiltro || p.genero === generoFiltro
    return matchBusqueda && matchGenero
  })

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress color="primary" size={60} />
    </Box>
  )

  return (
    <Box sx={{ pt: 10, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h2" sx={{ fontSize: '3rem', mb: 1 }}>CARTELERA</Typography>
          <Typography color="text.secondary">Descubre las mejores películas en Cine-Verse</Typography>
        </Box>

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar película..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            size="small"
            sx={{ minWidth: 240 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Género</InputLabel>
            <Select value={generoFiltro} onChange={e => setGeneroFiltro(e.target.value)} label="Género">
              <MenuItem value="">Todos</MenuItem>
              {generos.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {peliculasFiltradas.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">No se encontraron películas</Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {peliculasFiltradas.map(pelicula => {
            const funcionesDisponibles = pelicula.funciones?.filter(f => f.estado === 'disponible') || []
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pelicula.id}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 60px rgba(229,9,20,0.25)' }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="320"
                      image={pelicula.imagen_url || `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80`}
                      alt={pelicula.titulo}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
                    }} />
                    <Chip
                      label={pelicula.clasificacion}
                      size="small"
                      sx={{
                        position: 'absolute', top: 12, right: 12,
                        bgcolor: CLASIFICACION_COLORS[pelicula.clasificacion] || '#666',
                        color: 'white', fontWeight: 700, fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 1.5 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                      {pelicula.titulo}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip icon={<Category sx={{ fontSize: 12 }} />} label={pelicula.genero} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={`${pelicula.duracion} min`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5
                    }}>
                      {pelicula.descripcion}
                    </Typography>
                    {funcionesDisponibles.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          {funcionesDisponibles.length} función(es) disponible(s)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant={funcionesDisponibles.length > 0 ? 'contained' : 'outlined'}
                      disabled={funcionesDisponibles.length === 0}
                      startIcon={<PlayArrow />}
                      onClick={() => navigate(`/pelicula/${pelicula.id}`)}
                      size="small"
                    >
                      {funcionesDisponibles.length > 0 ? 'Comprar Tiquetes' : 'Sin funciones'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}
