import { useState } from 'react'
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Avatar, Menu, MenuItem, Divider, useScrollTrigger, Slide
} from '@mui/material'
import {
  Movie as MovieIcon, AdminPanelSettings, AccountCircle,
  Logout, ConfirmationNumber, CheckCircle, Menu as MenuIcon
} from '@mui/icons-material'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger()
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>
}

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenu = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
    handleClose()
  }

  return (
    <HideOnScroll>
      <AppBar position="fixed" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, gap: 2 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              textDecoration: 'none', flexGrow: 1,
            }}
          >
            <MovieIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Bebas Neue", cursive',
                letterSpacing: 3,
                background: 'linear-gradient(135deg, #E50914, #F5A623)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CINE-VERSE
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button component={Link} to="/cartelera" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              Cartelera
            </Button>
            <Button component={Link} to="/validar" startIcon={<CheckCircle />} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              Validar Tiquete
            </Button>
            {isAdmin && (
              <Button
                component={Link} to="/admin"
                startIcon={<AdminPanelSettings />}
                variant="outlined"
                color="primary"
                size="small"
              >
                Admin
              </Button>
            )}
          </Box>

          {/* Auth */}
          {user ? (
            <>
              <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>
                  {profile?.nombre?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
                PaperProps={{ sx: { mt: 1.5, minWidth: 200, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' } }}>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{profile?.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{profile?.email}</Typography>
                </Box>
                <Divider />
                {isAdmin && (
                  <MenuItem onClick={() => { navigate('/admin'); handleClose() }}>
                    <AdminPanelSettings sx={{ mr: 1, fontSize: 18 }} /> Panel Admin
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <Logout sx={{ mr: 1, fontSize: 18 }} /> Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined" size="small" sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'text.primary' }}>
                Iniciar sesión
              </Button>
              <Button component={Link} to="/register" variant="contained" size="small">
                Registrarse
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  )
}
