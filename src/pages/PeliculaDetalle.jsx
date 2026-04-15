import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Grid, Chip, Button,
  CircularProgress, Alert, Card, CardContent, Divider
} from '@mui/material'
import { AccessTime, CalendarMonth, EventSeat, ArrowBack } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function PeliculaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pelicula, setPelicula] = useState(null)
  const [funciones, setFunciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    const hoy = new Date().toISOString().split('T')[0]

    const { data: pel } = await supabase.from('peliculas').select('*').eq('id', id).single()
    const { data: fns, error: err } = await supabase
      .from('funciones')
      .select('*')
      .eq('pelicula_id', id)
      .eq('estado', 'disponible')
      .gte('fecha', hoy)
      .order('fecha').order('hora')

    if (err || !pel) setError('No se encontró la película.')
    else { setPelicula(pel); setFunciones(fns || []) }
    setLoading(false)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 15 }}><CircularProgress color="primary" size={60} /></Box>
  if (error) return <Container sx={{ pt: 15 }}><Alert severity="error">{error}</Alert></Container>

  return (
    <Box sx={{ minHeight: '100vh', pt: 10, pb: 6 }}>
      {/* Hero con imagen */}
      <Box sx={{
        position: 'relative', height: 400, mb: 4,
        background: `linear-gradient(to bottom, transparent 0%, #0A0A0F 100%), url(${pelicula?.imagen_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80'}) center/cover`,
      }}>
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'flex-end', pb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/cartelera')} sx={{ position: 'absolute', top: 16, left: 24, color: 'white' }}>
            Cartelera
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={pelicula?.clasificacion} color="primary" size="small" />
              <Chip label={pelicula?.genero} variant="outlined" size="small" />
              <Chip icon={<AccessTime sx={{ fontSize: 14 }} />} label={`${pelicula?.duracion} min`} variant="outlined" size="small" />
            </Box>
            <Typography variant="h2" sx={{ fontSize: '2.8rem', mb: 2 }}>{pelicula?.titulo}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>{pelicula?.descripcion}</Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={700} mb={2}>Selecciona una Función</Typography>
            {funciones.length === 0 ? (
              <Alert severity="info">No hay funciones disponibles para esta película.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {funciones.map(fn => (
                  <Card key={fn.id} sx={{
                    cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', transform: 'translateX(4px)' },
                  }}
                    onClick={() => navigate(`/asientos/${fn.id}`)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <CalendarMonth sx={{ color: 'primary.main', fontSize: 18 }} />
                          <Typography fontWeight={600}>{new Date(fn.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}</Typography>
                        </Box>
                        <Chip label={fn.hora?.slice(0, 5)} color="primary" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          <EventSeat sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                          {fn.sala || 'Sala Principal'}
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          ${fn.precio?.toLocaleString('es-CO')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
