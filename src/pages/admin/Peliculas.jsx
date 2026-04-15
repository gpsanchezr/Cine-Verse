import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Alert, CircularProgress, Grid
} from '@mui/material'
import { Add, Edit, Delete, Movie } from '@mui/icons-material'
import { supabase } from '../../supabaseClient'

const GENEROS = ['Acción', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción', 'Animación', 'Romance', 'Thriller', 'Documental', 'Aventura']
const CLASIFICACIONES = ['TP', 'G', 'PG', 'PG-13', '+13', '+18', 'R']
const EMPTY = { titulo: '', genero: '', duracion: '', clasificacion: '', descripcion: '', imagen_url: '', trailer_url: '', estado: 'activa' }

export default function AdminPeliculas() {
  const [peliculas, setPeliculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchPeliculas() }, [])

  const fetchPeliculas = async () => {
    setLoading(true)
    const { data } = await supabase.from('peliculas').select('*').order('created_at', { ascending: false })
    setPeliculas(data || [])
    setLoading(false)
  }

  const abrirCrear = () => { setEditando(null); setForm(EMPTY); setError(''); setDialogOpen(true) }
  const abrirEditar = (p) => { setEditando(p); setForm({ ...p }); setError(''); setDialogOpen(true) }
  const cerrarDialog = () => { setDialogOpen(false); setEditando(null) }

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleGuardar = async () => {
    if (!form.titulo || !form.genero || !form.duracion || !form.clasificacion) {
      setError('Completa los campos obligatorios.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      titulo: form.titulo,
      genero: form.genero,
      duracion: parseInt(form.duracion),
      clasificacion: form.clasificacion,
      descripcion: form.descripcion,
      imagen_url: form.imagen_url,
      trailer_url: form.trailer_url,
      estado: form.estado,
    }

    let err
    if (editando) {
      ({ error: err } = await supabase.from('peliculas').update(payload).eq('id', editando.id))
    } else {
      ({ error: err } = await supabase.from('peliculas').insert(payload))
    }

    if (err) {
      setError('Error al guardar la película.')
    } else {
      setSuccess(editando ? 'Película actualizada correctamente.' : 'Película creada correctamente.')
      setTimeout(() => setSuccess(''), 3000)
      cerrarDialog()
      fetchPeliculas()
    }
    setSaving(false)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta película? Esta acción no se puede deshacer.')) return
    await supabase.from('peliculas').delete().eq('id', id)
    fetchPeliculas()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Gestión de Películas</Typography>
          <Typography color="text.secondary">CRUD completo de cartelera</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear} size="large">
          Nueva Película
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
                  <TableCell>Género</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Clasificación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peliculas.map(p => (
                  <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box component="img"
                          src={p.imagen_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=60&q=60'}
                          sx={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 1 }}
                          onError={e => e.target.style.display = 'none'}
                        />
                        <Box>
                          <Typography fontWeight={600}>{p.titulo}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.descripcion}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{p.genero}</TableCell>
                    <TableCell>{p.duracion} min</TableCell>
                    <TableCell><Chip label={p.clasificacion} size="small" color="primary" /></TableCell>
                    <TableCell>
                      <Chip label={p.estado} size="small" color={p.estado === 'activa' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => abrirEditar(p)} color="primary"><Edit /></IconButton>
                      <IconButton size="small" onClick={() => handleEliminar(p.id)} color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {peliculas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Movie sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
                      No hay películas registradas. ¡Agrega la primera!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editando ? 'Editar Película' : 'Nueva Película'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Título *" name="titulo" value={form.titulo} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Género *</InputLabel>
                <Select name="genero" value={form.genero} onChange={handleChange} label="Género *">
                  {GENEROS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Duración (min) *" name="duracion" type="number" value={form.duracion} onChange={handleChange} fullWidth inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Clasificación *</InputLabel>
                <Select name="clasificacion" value={form.clasificacion} onChange={handleChange} label="Clasificación *">
                  {CLASIFICACIONES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="URL de imagen del póster" name="imagen_url" value={form.imagen_url} onChange={handleChange} fullWidth placeholder="https://..." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="URL del tráiler" name="trailer_url" value={form.trailer_url} onChange={handleChange} fullWidth placeholder="https://youtube.com/..." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select name="estado" value={form.estado} onChange={handleChange} label="Estado">
                  <MenuItem value="activa">Activa</MenuItem>
                  <MenuItem value="inactiva">Inactiva</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : editando ? 'Actualizar' : 'Crear Película'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
