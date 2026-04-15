import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CircularProgress, Box } from '@mui/material'

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>
  return user ? children : <Navigate to="/login" />
}

export const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>
  if (!user) return <Navigate to="/login" />
  return isAdmin ? children : <Navigate to="/" />
}
