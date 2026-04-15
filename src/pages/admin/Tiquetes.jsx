import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Alert
} from '@mui/material'
import { Search, ConfirmationNumber } from '@mui/icons-material'
import { supabase } from '../../supabaseClient'

export default function AdminTiquetes() {
  const [tiquetes, setTiquetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')

  useEffect(() => { fetchTiquetes() }, [])

  const fetchTiquetes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tiquetes')
      .select(`*, funciones(fecha, hora, sala, peliculas(titulo)), detalle_tiquete(asiento_numero)`)
      .order('created_at', { ascending: false })
    setTiquetes(data || [])
    setLoading(false)
  }

  const filtrados = tiquetes.filter(t => {
    const matchBusq = !busqueda || t.codigo?.includes(busqueda.toUpperCase()) || t.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = !estadoFiltro || t.estado === estadoFiltro
    return matchBusq && matchEstado
  })

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Gestión de Tiquetes</Typography>
        <Typography color="text.secondary">Historial completo de ventas</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por código o cliente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} label="Estado">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="usado">Usado</MenuItem>
            <MenuItem value="cancelado">Cancelado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Película</TableCell>
                  <TableCell>Función</TableCell>
                  <TableCell>Asientos</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha compra</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.map(t => (
                  <TableRow key={t.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell>
                      <Typography fontFamily="monospace" fontSize="0.7rem" color="primary.main" fontWeight={700}>{t.codigo}</Typography>
                    </TableCell>
                    <TableCell>{t.nombre_cliente || 'N/A'}</TableCell>
                    <TableCell>{t.funciones?.peliculas?.titulo || 'N/A'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t.funciones?.fecha} {t.funciones?.hora?.slice(0, 5)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', maxWidth: 120 }}>
                        {t.detalle_tiquete?.slice(0, 4).map(d => (
                          <Chip key={d.asiento_numero} label={d.asiento_numero} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                        ))}
                        {t.detalle_tiquete?.length > 4 && <Chip label={`+${t.detalle_tiquete.length - 4}`} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />}
                      </Box>
                    </TableCell>
                    <TableCell fontWeight={700}>${t.total?.toLocaleString('es-CO')}</TableCell>
                    <TableCell>
                      <Chip label={t.estado} size="small" color={t.estado === 'activo' ? 'success' : t.estado === 'usado' ? 'warning' : 'error'} />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString('es-CO')}</TableCell>
                  </TableRow>
                ))}
                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <ConfirmationNumber sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
                      No se encontraron tiquetes con ese filtro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  )
}
