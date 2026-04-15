import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Navbar />
        <Box sx={{ minHeight: '100vh' }}>
          <Outlet />
        </Box>
        <CineBot />
      </div>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "cartelera", element: <Cartelera /> },
      { path: "pelicula/:id", element: <PeliculaDetalle /> },
      { path: "validar", element: <ValidarTiquete /> },
      { 
        path: "asientos/:funcionId", 
        element: (
          <ProtectedRoute>
            <SeatSelection />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "checkout", 
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "admin", 
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "peliculas", element: <AdminPeliculas /> },
          { path: "funciones", element: <AdminFunciones /> },
          { path: "tiquetes", element: <AdminTiquetes /> }
        ]
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
