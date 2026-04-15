import { useState } from 'react'
import {
  Box, Container, Typography, Grid, Paper, TextField,
  Button, Divider, Chip, Alert, CircularProgress, Dialog,
  DialogContent, DialogTitle, IconButton
} from '@mui/material'
import { ConfirmationNumber, CheckCircle, ContentCopy, Email, Close } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { enviarConfirmacionTiquete } from '../services/emailService'

const generarCodigo = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const parte = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `CV-${parte(4)}-${parte(4)}-${parte(4)}`
}

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const { funcion, asientosSeleccionados, total } = state || {}

  const [clienteEmail, setClienteEmail] = useState(profile?.email || '')
  const [clienteNombre, setClienteNombre] = useState(profile?.nombre || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tiqueteGenerado, setTiqueteGenerado] = useState(null)
  const [copiado, setCopiado] = useState(false)

  if (!state) {
    navigate('/cartelera')
    return null
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(tiqueteGenerado?.codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const confirmarCompra = async () => {
    if (!clienteNombre.trim() || !clienteEmail.trim()) {
      setError('Por favor completa tu nombre y correo para continuar.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const codigo = generarCodigo()

      // ── TRANSACCIÓN: insertar tiquete + detalles de forma segura ──
      const { data: tiquete, error: errTiquete } = await supabase
        .from('tiquetes')
        .insert({
          codigo,
          usuario_id: user?.id || null,
          funcion_id: funcion.id,
          total,
          estado: 'activo',
          nombre_cliente: clienteNombre,
          email_cliente: clienteEmail,
        })
        .select()
        .single()

      if (errTiquete) throw errTiquete

      // Insertar cada asiento con la restricción UNIQUE(funcion_id, asiento_numero)
      const detalles = asientosSeleccionados.map(asiento => ({
        tiquete_id: tiquete.id,
        funcion_id: funcion.id,
        asiento_numero: asiento,
        precio_unitario: funcion.precio,
      }))

      const { error: errDetalle } = await supabase
        .from('detalle_tiquete')
        .insert(detalles)

      if (errDetalle) {
        // Si falla (doble venta), revertir el tiquete
        await supabase.from('tiquetes').delete().eq('id', tiquete.id)
        if (errDetalle.code === '23505') {
          throw new Error('⚠️ Uno o más asientos ya fueron vendidos. Por favor selecciona otros.')
        }
        throw errDetalle
      }

      // Enviar email de confirmación
      await enviarConfirmacionTiquete({
        clientEmail: clienteEmail,
        nombre: clienteNombre,
        pelicula: funcion.peliculas?.titulo,
        sala: funcion.sala || 'Sala Principal',
        asientos: asientosSeleccionados.join(', '),
        codigo,
        total,
        fecha: `${funcion.fecha} ${funcion.hora?.slice(0, 5)}`,
      })

      setTiqueteGenerado({ ...tiquete, asientos: asientosSeleccionados })
    } catch (err) {
      setError(err.message || 'Error al procesar la compra. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: 10, pb: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontSize: '2rem', mb: 4 }}>
          Confirmar Compra
        </Typography>

        <Grid container spacing={3}>
          {/* Formulario cliente */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Datos del comprador</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nombre completo"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                  fullWidth required
                />
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={clienteEmail}
                  onChange={e => setClienteEmail(e.target.value)}
                  fullWidth required
                  helperText="Recibirás tu tiquete en este correo"
                  InputProps={{ endAdornment: <Email sx={{ color: 'text.secondary' }} /> }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Resumen */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Resumen del pedido</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Película</Typography>
                  <Typography variant="body2" fontWeight={600} textAlign="right" maxWidth={160}>{funcion?.peliculas?.titulo}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Fecha</Typography>
                  <Typography variant="body2">{funcion?.fecha}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Hora</Typography>
                  <Typography variant="body2">{funcion?.hora?.slice(0, 5)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Sala</Typography>
                  <Typography variant="body2">{funcion?.sala || 'Sala Principal'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>Asientos ({asientosSeleccionados?.length})</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {asientosSeleccionados?.sort().map(s => (
                      <Chip key={s} label={s} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    ${total?.toLocaleString('es-CO')} COP
                  </Typography>
                </Box>
              </Box>

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

              <Button
                fullWidth variant="contained" size="large"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ConfirmationNumber />}
                onClick={confirmarCompra}
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? 'Procesando...' : 'Confirmar y Pagar'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Dialog de éxito con tiquete */}
      <Dialog open={Boolean(tiqueteGenerado)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', display: 'block', mx: 'auto', mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>¡Compra exitosa!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
          <Typography color="text.secondary" mb={3}>
            Tu tiquete ha sido generado. Revisa tu correo para la confirmación.
          </Typography>

          <Paper sx={{
            p: 3, borderRadius: 3, mb: 3,
            background: 'linear-gradient(135deg, rgba(229,9,20,0.1) 0%, rgba(245,166,35,0.1) 100%)',
            border: '2px dashed rgba(229,9,20,0.4)',
          }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>CÓDIGO DE TIQUETE</Typography>
            <Typography variant="h5" fontWeight={800} fontFamily="monospace" letterSpacing={2} color="primary.main">
              {tiqueteGenerado?.codigo}
            </Typography>
            <Button size="small" startIcon={<ContentCopy />} onClick={copiarCodigo} sx={{ mt: 1 }}>
              {copiado ? '¡Copiado!' : 'Copiar código'}
            </Button>
          </Paper>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Presenta este código en la entrada del cine para acceder a tu función.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/cartelera')}>
              Ver cartelera
            </Button>
            <Button variant="contained" onClick={() => navigate('/validar')}>
              Validar tiquete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
