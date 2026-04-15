import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Alert, CircularProgress, Grid
} from '@mui/material'
import { Add, Edit, Delete, CalendarMonth } from '@mui/icons-material'
import { supabase } from '../../supabaseClient'

const EMPTY = { pelicula_id: '', fecha: '', hora: '', sala: 'Sala Principal', precio: '', estado: 'disponible' }

export default function AdminFunciones() {
  const [funciones, setFunciones] = useState([])
  const [peliculas, setPeliculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: fns }, { data: pels }] = await Promise.all([
      supabase.from('funciones').select('*, peliculas(titulo)').order('fecha', { ascending: false }).order('hora', { ascending: true }),
      supabase.from('peliculas').select('id, titulo').eq('estado', 'activa').order('titulo'),
    ])
    setFunciones(fns || [])
    setPeliculas(pels || [])
    setLoading(false)
  }

  const abrirCrear = () => { setEditando(null); setForm(EMPTY); setError(''); setDialogOpen(true) }
  const abrirEditar = (f) => { setEditando(f); setForm({ ...f }); setError(''); setDialogOpen(true) }
  const cerrarDialog = () => { setDialogOpen(false); setEditando(null) }
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleGuardar = async () => {
    if (!form.pelicula_id || !form.fecha || !form.hora || !form.precio) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      pelicula_id: form.pelicula_id,
      fecha: form.fecha,
      hora: form.hora,
      sala: form.sala || 'Sala Principal',
      precio: parseFloat(form.precio),
      estado: form.estado,
    }

    let err
    if (editando) {
      ({ error: err } = await supabase.from('funciones').update(payload).eq('id', editando.id))
    } else {
      ({ error: err } = await supabase.from('funciones').insert(payload))
    }

    if (err) {
      setError('Error al guardar la función.')
    } else {
      setSuccess(editando ? 'Función actualizada.' : 'Función creada correctamente.')
      setTimeout(() => setSuccess(''), 3000)
      cerrarDialog()
      fetchData()
    }
    setSaving(false)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta función?')) return
    await supabase.from('funciones').delete().eq('id', id)
    fetchData()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Gestión de Funciones</Typography>
          <Typography color="text.secondary">Programa las proyecciones de las películas</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear} size="large">
          Nueva Función
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress color="primary" /></Box>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Película</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Sala</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {funciones.map(f => (
                  <TableRow key={f.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell fontWeight={600}>{f.peliculas?.titulo}</TableCell>
                    <TableCell>{new Date(f.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}</TableCell>
                    <TableCell>{f.hora?.slice(0, 5)}</TableCell>
                    <TableCell>{f.sala}</TableCell>
                    <TableCell fontWeight={700} color="primary.main">${f.precio?.toLocaleString('es-CO')}</TableCell>
                    <TableCell>
                      <Chip label={f.estado} size="small" color={f.estado === 'disponible' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => abrirEditar(f)} color="primary"><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleEliminar(f.id)} color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {funciones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <CalendarMonth sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
                      No hay funciones programadas. ¡Crea la primera!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Función' : 'Nueva Función'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Película *</InputLabel>
                <Select name="pelicula_id" value={form.pelicula_id} onChange={handleChange} label="Película *">
                  {peliculas.map(p => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Fecha *" name="fecha" type="date" value={form.fecha} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Hora *" name="hora" type="time" value={form.hora} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Sala" name="sala" value={form.sala} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Precio (COP) *" name="precio" type="number" value={form.precio} onChange={handleChange} fullWidth inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select name="estado" value={form.estado} onChange={handleChange} label="Estado">
                  <MenuItem value="disponible">Disponible</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editando ? 'Actualizar' : 'Crear Función'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
