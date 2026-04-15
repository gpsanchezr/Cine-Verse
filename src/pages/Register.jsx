import { useState } from 'react'
import {
  Box, Container, Paper, Typography, TextField,
  Button, Alert, InputAdornment, IconButton, Link as MuiLink, LinearProgress
} from '@mui/material'
import { Visibility, VisibilityOff, Movie, CheckCircle, Cancel } from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Validación de contraseña: mínimo 6 caracteres, al menos una mayúscula
const PASSWORD_REGEX = /^(?=.*[A-Z]).{6,}$/

const RequisitoContrasena = ({ cumple, texto }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {cumple
      ? <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
      : <Cancel sx={{ fontSize: 14, color: 'text.secondary' }} />}
    <Typography variant="caption" color={cumple ? 'success.main' : 'text.secondary'}>{texto}</Typography>
  </Box>
)

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const tieneMinLong = form.password.length >= 6
  const tieneMayuscula = /[A-Z]/.test(form.password)
  const contrasenaValida = PASSWORD_REGEX.test(form.password)
  const passwordMatch = form.password === form.confirmPassword && form.password.length > 0

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!contrasenaValida) {
      setError('La contraseña debe tener mínimo 6 caracteres y al menos una letra mayúscula. Ejemplo: "Sena123"')
      return
    }
    if (!passwordMatch) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await signUp(form.email, form.password, form.nombre)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Intenta con otro correo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 8,
      background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.08) 0%, transparent 70%)' }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid rgba(229,9,20,0.15)' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Movie sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>Crear cuenta</Typography>
            <Typography variant="body2" color="text.secondary">Únete a Cine-Verse hoy</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nombre completo" name="nombre" value={form.nombre} onChange={handleChange} required fullWidth />
            <TextField label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            
            <Box>
              <TextField
                label="Contraseña"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required fullWidth
                error={form.password.length > 0 && !contrasenaValida}
                helperText={form.password.length > 0 && !contrasenaValida ? 'Contraseña inválida. Ej: "Sena123"' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {form.password && (
                <Box sx={{ mt: 1, pl: 0.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                  <RequisitoContrasena cumple={tieneMinLong} texto="Mínimo 6 caracteres" />
                  <RequisitoContrasena cumple={tieneMayuscula} texto="Al menos una letra MAYÚSCULA" />
                </Box>
              )}
            </Box>

            <TextField
              label="Confirmar contraseña"
              name="confirmPassword"
              type={showPass ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              required fullWidth
              error={form.confirmPassword.length > 0 && !passwordMatch}
              helperText={form.confirmPassword.length > 0 && !passwordMatch ? 'Las contraseñas no coinciden' : ''}
            />

            <Button
              type="submit" variant="contained" size="large" fullWidth
              disabled={loading || !contrasenaValida || !passwordMatch}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tienes cuenta?{' '}
              <MuiLink component={Link} to="/login" color="primary" fontWeight={600}>
                Iniciar sesión
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
