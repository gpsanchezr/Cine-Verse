import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Button, Chip, CircularProgress,
  Alert, Paper, Divider, Grid
} from '@mui/material'
import { EventSeat, ArrowBack, ShoppingCart } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

// 150 asientos: 10 filas (A-J) x 15 columnas
const FILAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const COLUMNAS = Array.from({ length: 15 }, (_, i) => i + 1)

const SeatButton = ({ seatId, estado, seleccionado, onClick }) => {
  const getColor = () => {
    if (estado === 'ocupado') return { bg: '#2C2C3A', border: '#3A3A4A', color: '#555', cursor: 'not-allowed' }
    if (seleccionado) return { bg: '#E50914', border: '#FF3D47', color: '#fff', cursor: 'pointer' }
    return { bg: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.5)', color: '#2ECC71', cursor: 'pointer' }
  }
  const c = getColor()

  return (
    <Box
      onClick={estado !== 'ocupado' ? onClick : undefined}
      title={seatId}
      sx={{
        width: { xs: 22, sm: 28 },
        height: { xs: 22, sm: 28 },
        borderRadius: '4px 4px 8px 8px',
        bgcolor: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.color,
        cursor: c.cursor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.55rem',
        fontWeight: 700,
        transition: 'all 0.15s',
        '&:hover': estado !== 'ocupado' ? {
          transform: 'scale(1.2)',
          boxShadow: seleccionado ? '0 0 10px rgba(229,9,20,0.5)' : '0 0 10px rgba(46,204,113,0.5)',
        } : {},
        flexShrink: 0,
      }}
    />
  )
}

export default function SeatSelection() {
  const { funcionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [funcion, setFuncion] = useState(null)
  const [asientosOcupados, setAsientosOcupados] = useState(new Set())
  const [seleccionados, setSeleccionados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDatos()
    // Suscripción en tiempo real para actualizar asientos ocupados
    const channel = supabase
      .channel(`funcion-${funcionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'detalle_tiquete' }, () => {
        fetchAsientosOcupados()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [funcionId])

  const fetchDatos = async () => {
    setLoading(true)
    const { data: fn } = await supabase
      .from('funciones')
      .select('*, peliculas(*)')
      .eq('id', funcionId)
      .single()

    if (!fn) { setError('Función no encontrada.'); setLoading(false); return }
    setFuncion(fn)
    await fetchAsientosOcupados()
    setLoading(false)
  }

  const fetchAsientosOcupados = async () => {
    // Obtener asientos ya vendidos para esta función (joins via tiquetes)
    const { data } = await supabase
      .from('detalle_tiquete')
      .select('asiento_numero')
      .eq('funcion_id', funcionId)

    const ocupados = new Set((data || []).map(d => d.asiento_numero))
    setAsientosOcupados(ocupados)
  }

  const toggleSeat = (seatId) => {
    setSeleccionados(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    )
  }

  const totalAsientos = seleccionados.length
  const totalPrecio = totalAsientos * (funcion?.precio || 0)

  const procederCompra = () => {
    if (!user) { navigate('/login'); return }
    if (seleccionados.length === 0) return
    navigate('/checkout', {
      state: {
        funcionId,
        funcion,
        asientosSeleccionados: seleccionados,
        total: totalPrecio,
      }
    })
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 15 }}><CircularProgress size={60} color="primary" /></Box>
  if (error) return <Container sx={{ pt: 15 }}><Alert severity="error">{error}</Alert></Container>

  const asientosDisponibles = 150 - asientosOcupados.size

  return (
    <Box sx={{ minHeight: '100vh', pt: 10, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/pelicula/${funcion?.pelicula_id}`)} sx={{ mb: 2 }}>
            Volver
          </Button>
          <Typography variant="h3" sx={{ fontSize: '2.2rem', mb: 0.5 }}>
            {funcion?.peliculas?.titulo}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`📅 ${new Date(funcion?.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`} variant="outlined" />
            <Chip label={`⏰ ${funcion?.hora?.slice(0, 5)}`} variant="outlined" color="primary" />
            <Chip label={`🎭 ${funcion?.sala || 'Sala Principal'}`} variant="outlined" />
            <Chip label={`💰 $${funcion?.precio?.toLocaleString('es-CO')} / asiento`} variant="outlined" color="secondary" />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Mapa de asientos */}
          <Grid item xs={12} lg={9}>
            <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.paper', borderRadius: 3 }}>
              {/* Leyenda */}
              <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { color: 'rgba(46,204,113,0.1)', border: 'rgba(46,204,113,0.5)', label: `Disponible (${asientosDisponibles})` },
                  { color: '#E50914', border: '#FF3D47', label: `Seleccionado (${seleccionados.length})` },
                  { color: '#2C2C3A', border: '#3A3A4A', label: `Ocupado (${asientosOcupados.size})` },
                ].map(item => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: item.color, border: `1.5px solid ${item.border}` }} />
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Pantalla */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{
                  width: '70%', mx: 'auto',
                  height: 8, borderRadius: '4px 4px 20px 20px',
                  background: 'linear-gradient(135deg, rgba(229,9,20,0.6), rgba(245,166,35,0.6))',
                  boxShadow: '0 4px 20px rgba(229,9,20,0.3)',
                  mb: 1,
                }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={3}>
                  ── PANTALLA ──
                </Typography>
              </Box>

              {/* Grid de asientos */}
              <Box sx={{ overflowX: 'auto', pb: 2 }}>
                <Box sx={{ minWidth: 420 }}>
                  {FILAS.map(fila => (
                    <Box key={fila} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: { xs: 0.3, sm: 0.5 } }}>
                      <Typography sx={{ width: 20, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700, flexShrink: 0, textAlign: 'center' }}>
                        {fila}
                      </Typography>
                      {COLUMNAS.map(col => {
                        const seatId = `${fila}${col}`
                        return (
                          <SeatButton
                            key={seatId}
                            seatId={seatId}
                            estado={asientosOcupados.has(seatId) ? 'ocupado' : 'disponible'}
                            seleccionado={seleccionados.includes(seatId)}
                            onClick={() => toggleSeat(seatId)}
                          />
                        )
                      })}
                      <Typography sx={{ width: 20, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700, flexShrink: 0, textAlign: 'center' }}>
                        {fila}
                      </Typography>
                    </Box>
                  ))}
                  {/* Números de columna */}
                  <Box sx={{ display: 'flex', ml: '28px', gap: { xs: 0.3, sm: 0.5 }, mt: 0.5 }}>
                    {COLUMNAS.map(col => (
                      <Typography key={col} sx={{ width: { xs: 22, sm: 28 }, fontSize: '0.55rem', color: 'text.secondary', textAlign: 'center', flexShrink: 0 }}>
                        {col}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Panel de resumen */}
          <Grid item xs={12} lg={3}>
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 90 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Resumen de compra</Typography>
              <Divider sx={{ mb: 2 }} />

              {seleccionados.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <EventSeat sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Selecciona tus asientos en el mapa
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" mb={1}>Asientos seleccionados:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {seleccionados.sort().map(s => (
                      <Chip key={s} label={s} size="small" color="primary" onDelete={() => toggleSeat(s)} />
                    ))}
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{totalAsientos} asiento(s) × ${funcion?.precio?.toLocaleString('es-CO')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Total:</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      ${totalPrecio.toLocaleString('es-CO')}
                    </Typography>
                  </Box>
                </>
              )}

              <Button
                fullWidth variant="contained" size="large"
                startIcon={<ShoppingCart />}
                disabled={seleccionados.length === 0}
                onClick={procederCompra}
              >
                Continuar ({seleccionados.length})
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
