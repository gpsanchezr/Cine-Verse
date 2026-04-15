import { useState } from 'react'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, useMediaQuery, IconButton, AppBar, Toolbar
} from '@mui/material'
import {
  Dashboard, Movie, CalendarMonth, ConfirmationNumber,
  AdminPanelSettings, Menu as MenuIcon, ChevronLeft
} from '@mui/icons-material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { label: 'Películas', icon: <Movie />, path: '/admin/peliculas' },
  { label: 'Funciones', icon: <CalendarMonth />, path: '/admin/funciones' },
  { label: 'Tiquetes', icon: <ConfirmationNumber />, path: '/admin/tiquetes' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 3, background: 'linear-gradient(135deg, rgba(229,9,20,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(229,9,20,0.2)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography fontWeight={800} fontFamily='"Bebas Neue", cursive' letterSpacing={2} fontSize="1.2rem">
              ADMIN PANEL
            </Typography>
            <Typography variant="caption" color="text.secondary">Cine-Verse</Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ pt: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false) }}
              sx={{
                mx: 1, mb: 0.5, borderRadius: 2,
                bgcolor: active ? 'rgba(229,9,20,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #E50914' : '3px solid transparent',
                '&:hover': { bgcolor: 'rgba(229,9,20,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: active ? 700 : 400, color: active ? 'primary.main' : 'text.primary' }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', pt: 8 }}>
      {/* Sidebar desktop */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            mt: isMobile ? 0 : '64px',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minWidth: 0 }}>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(true)} sx={{ mb: 2 }}>
            <MenuIcon />
          </IconButton>
        )}
        <Outlet />
      </Box>
    </Box>
  )
}
