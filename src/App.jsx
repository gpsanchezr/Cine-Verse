import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import theme from './theme'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import CineBot from './components/CineBot'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cartelera from './pages/Cartelera'
import PeliculaDetalle from './pages/PeliculaDetalle'
import SeatSelection from './pages/SeatSelection'
import Checkout from './pages/Checkout'
import ValidarTiquete from './pages/ValidarTiquete'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminPeliculas from './pages/admin/Peliculas'
import AdminFunciones from './pages/admin/Funciones'
import AdminTiquetes from './pages/admin/Tiquetes'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Box sx={{ minHeight: '100vh' }}>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cartelera" element={<Cartelera />} />
              <Route path="/pelicula/:id" element={<PeliculaDetalle />} />
              <Route path="/validar" element={<ValidarTiquete />} />

              {/* Rutas protegidas (requieren login) */}
              <Route path="/asientos/:funcionId" element={
                <ProtectedRoute><SeatSelection /></ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute><Checkout /></ProtectedRoute>
              } />

              {/* Rutas Admin */}
              <Route path="/admin" element={
                <AdminRoute><AdminLayout /></AdminRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="peliculas" element={<AdminPeliculas />} />
                <Route path="funciones" element={<AdminFunciones />} />
                <Route path="tiquetes" element={<AdminTiquetes />} />
              </Route>
            </Routes>
          </Box>

          {/* Chatbot flotante en todas las páginas */}
          <CineBot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
