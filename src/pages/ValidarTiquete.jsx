import { useState } from 'react'
import {
  Box, Container, Typography, TextField, Button,
  Paper, Chip, Divider, Alert, CircularProgress
} from '@mui/material'
import { QrCode, CheckCircle, Cancel, Search, ConfirmationNumber, EventSeat } from '@mui/icons-material'
import { supabase } from '../supabaseClient'

const ESTADO_CONFIG = {
  activo: { color: 'success', icon: <CheckCircle />, label: '✅ VÁLIDO — Listo para ingresar' },
  usado: { color: 'warning', icon: <Cancel />, label: '⛔ YA USADO — Este tiquete ya fue escaneado' },
  cancelado: { color: 'error', icon: <Cancel />, label: '❌ CANCELADO — Tiquete no válido' },
}

export default function ValidarTiquete() {
  const [codigo, setCodigo] = useState('')
  const [tiquete, setTiquete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [marcandoUsado, setMarcandoUsado] = useState(false)

  const buscarTiquete = async () => {
    const codigoLimpio = codigo.trim().toUpperCase()
    if (!codigoLimpio) return

    setLoading(true)
    setError('')
    setTiquete(null)

    const { data, error: err } = await supabase
      .from('tiquetes')
      .select(`
        *,
        funciones (
          fecha, hora, sala, precio,
          peliculas (titulo, genero, clasificacion)
        ),
        detalle_tiquete (asiento_numero)
      `)
      .eq('codigo', codigoLimpio)
      .single()

    if (err || !data) {
      setError('❌ Código no encontrado. Verifica que el código sea correcto.')
    } else {
      setTiquete(data)
    }
    setLoading(false)
  }

  const marcarUsado = async () => {
    if (!tiquete || tiquete.estado !== 'activo') return
    setMarcandoUsado(true)

    const { error: err } = await supabase
      .from('tiquetes')
      .update({ estado: 'usado', fecha_uso: new Date().toISOString() })
      .eq('id', tiquete.id)

    if (!err) {
      setTiquete(prev => ({ ...prev, estado: 'usado' }))
    }
    setMarcandoUsado(false)
  }

  const config = tiquete ? ESTADO_CONFIG[tiquete.estado] || ESTADO_CONFIG.cancelado : null

  return (
    <Box sx={{
      minHeight: '100vh', pt: 10, pb: 6, display: 'flex', alignItems: 'center',
      background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.06) 0%, transparent 70%)',
    }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <QrCode sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" sx={{ fontSize: '2.5rem', mb: 1 }}>VALIDAR TIQUETE</Typography>
          <Typography color="text.secondary">Ingresa el código del tiquete para validar el acceso</Typography>
        </Box>

        {/* Input de búsqueda */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Código del tiquete"
              placeholder="CV-XXXX-XXXX-XXXX"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && buscarTiquete()}
              InputProps={{
                startAdornment: <ConfirmationNumber sx={{ mr: 1, color: 'text.secondary' }} />,
                sx: { fontFamily: 'monospace', letterSpacing: 1 }
              }}
            />
            <Button
              variant="contained"
              onClick={buscarTiquete}
              disabled={loading || !codigo.trim()}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Search />}
              sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
            >
              {loading ? 'Buscando...' : 'Validar'}
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" icon={<Cancel />} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resultado */}
        {tiquete && (
          <Paper sx={{
            p: 3, borderRadius: 3,
            border: `2px solid ${config.color === 'success' ? 'rgba(46,204,113,0.4)' : config.color === 'warning' ? 'rgba(243,156,18,0.4)' : 'rgba(231,76,60,0.4)'}`,
          }}>
            {/* Estado banner */}
            <Alert
              severity={config.color}
              icon={config.icon}
              sx={{ mb: 3, borderRadius: 2, fontWeight: 700 }}
            >
              {config.label}
            </Alert>

            {/* Info tiquete */}
            <Typography variant="h6" fontWeight={700} mb={2}>Información del Tiquete</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Código</Typography>
                <Typography fontFamily="monospace" fontWeight={700} color="primary.main">{tiquete.codigo}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Película</Typography>
                <Typography fontWeight={600}>{tiquete.funciones?.peliculas?.titulo}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Fecha función</Typography>
                <Typography>{tiquete.funciones?.fecha} – {tiquete.funciones?.hora?.slice(0, 5)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Sala</Typography>
                <Typography>{tiquete.funciones?.sala || 'Sala Principal'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Cliente</Typography>
                <Typography>{tiquete.nombre_cliente || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" mb={0.5}>Asientos</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tiquete.detalle_tiquete?.sort((a, b) => a.asiento_numero.localeCompare(b.asiento_numero)).map(d => (
                    <Chip key={d.asiento_numero} label={d.asiento_numero} size="small"
                      icon={<EventSeat sx={{ fontSize: 12 }} />} color="primary" />
                  ))}
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total pagado</Typography>
                <Typography fontWeight={700} color="primary.main">${tiquete.total?.toLocaleString('es-CO')} COP</Typography>
              </Box>
            </Box>

            {/* Botón marcar como usado */}
            {tiquete.estado === 'activo' && (
              <Button
                fullWidth variant="contained" color="success" size="large"
                startIcon={marcandoUsado ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                onClick={marcarUsado}
                disabled={marcandoUsado}
                sx={{ mt: 3, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
              >
                {marcandoUsado ? 'Procesando...' : '✅ Marcar como USADO (dar acceso)'}
              </Button>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  )
}
