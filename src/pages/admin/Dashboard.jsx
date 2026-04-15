import { useState, useEffect } from 'react'
import {
  Box, Grid, Paper, Typography, CircularProgress,
  Chip, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert
} from '@mui/material'
import {
  AttachMoney, EventSeat, Movie, ConfirmationNumber,
  TrendingUp, CheckCircle
} from '@mui/icons-material'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js'
import { supabase } from '../../supabaseClient'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <Paper sx={{
    p: 3, borderRadius: 3,
    background: `linear-gradient(135deg, ${color}22 0%, transparent 100%)`,
    border: `1px solid ${color}33`,
    position: 'relative', overflow: 'hidden',
  }}>
    <Box sx={{
      position: 'absolute', right: -10, top: -10,
      width: 80, height: 80, borderRadius: '50%',
      background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Box sx={{ color, fontSize: 32 }}>{icon}</Box>
    </Box>
    <Typography variant="body2" color="text.secondary" mb={0.5}>{title}</Typography>
    <Typography variant="h4" fontWeight={800} sx={{ color }}>{value}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
  </Paper>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ventasPorDia, setVentasPorDia] = useState([])
  const [ocupacionFunciones, setOcupacionFunciones] = useState([])
  const [ultimaVentas, setUltimaVentas] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Total ventas y tiquetes
      const { data: tiquetes } = await supabase
        .from('tiquetes')
        .select('total, estado, created_at, codigo, nombre_cliente, funciones(peliculas(titulo))')
        .order('created_at', { ascending: false })

      const totalVentas = tiquetes?.filter(t => t.estado !== 'cancelado').reduce((sum, t) => sum + (t.total || 0), 0) || 0
      const tiquetesActivos = tiquetes?.filter(t => t.estado === 'activo').length || 0
      const tiquetesUsados = tiquetes?.filter(t => t.estado === 'usado').length || 0

      // Películas activas
      const { count: totalPeliculas } = await supabase.from('peliculas').select('*', { count: 'exact', head: true }).eq('estado', 'activa')

      // Funciones disponibles
      const { count: totalFunciones } = await supabase.from('funciones').select('*', { count: 'exact', head: true }).eq('estado', 'disponible')

      // Ocupación global
      const { count: asientosVendidos } = await supabase.from('detalle_tiquete').select('*', { count: 'exact', head: true })

      setStats({ totalVentas, tiquetesActivos, tiquetesUsados, totalPeliculas, totalFunciones, asientosVendidos })

      // Ventas por día (últimos 7 días)
      const ultimos7 = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
      }).reverse()

      const ventasDia = ultimos7.map(fecha => {
        const del_dia = tiquetes?.filter(t =>
          t.created_at?.startsWith(fecha) && t.estado !== 'cancelado'
        ) || []
        return {
          fecha: fecha.slice(5),
          total: del_dia.reduce((s, t) => s + (t.total || 0), 0),
          cantidad: del_dia.length
        }
      })
      setVentasPorDia(ventasDia)

      // Últimas ventas
      setUltimaVentas((tiquetes || []).slice(0, 8))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress color="primary" size={50} />
    </Box>
  )

  const chartColors = {
    primary: 'rgba(229,9,20,0.8)',
    primaryBorder: '#E50914',
    secondary: 'rgba(245,166,35,0.8)',
  }

  const barData = {
    labels: ventasPorDia.map(v => v.fecha),
    datasets: [{
      label: 'Ventas COP',
      data: ventasPorDia.map(v => v.total),
      backgroundColor: chartColors.primary,
      borderColor: chartColors.primaryBorder,
      borderWidth: 2,
      borderRadius: 6,
    }]
  }

  const ocupacionData = {
    labels: ['Ocupados', 'Disponibles'],
    datasets: [{
      data: [stats?.asientosVendidos || 0, Math.max(0, 150 - (stats?.asientosVendidos || 0))],
      backgroundColor: ['#E50914', 'rgba(255,255,255,0.08)'],
      borderColor: ['#FF3D47', 'rgba(255,255,255,0.15)'],
      borderWidth: 2,
    }]
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={1}>Panel Administrativo</Typography>
      <Typography color="text.secondary" mb={4}>Resumen general del sistema Cine-Verse</Typography>

      {/* Stat cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<AttachMoney />} title="Total Ventas" value={`$${(stats?.totalVentas || 0).toLocaleString('es-CO')}`} subtitle="COP acumulado" color="#E50914" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<ConfirmationNumber />} title="Tiquetes Activos" value={stats?.tiquetesActivos || 0} subtitle={`${stats?.tiquetesUsados || 0} ya usados`} color="#F5A623" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Movie />} title="Películas en Cartelera" value={stats?.totalPeliculas || 0} subtitle={`${stats?.totalFunciones || 0} funciones activas`} color="#3498DB" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<EventSeat />} title="Asientos Vendidos" value={stats?.asientosVendidos || 0} subtitle="de 150 disponibles" color="#2ECC71" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        {/* Gráfico ventas */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Ventas últimos 7 días</Typography>
            <Bar data={barData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#A0A0B0' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#A0A0B0' } }
              }
            }} />
          </Paper>
        </Grid>

        {/* Gráfico ocupación */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Ocupación de Sala</Typography>
            <Doughnut data={ocupacionData} options={{
              responsive: true,
              plugins: { legend: { labels: { color: '#A0A0B0' } } },
              cutout: '70%',
            }} />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h5" fontWeight={800} color="primary.main">
                {Math.round(((stats?.asientosVendidos || 0) / 150) * 100)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">Ocupación global</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Últimas ventas */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" fontWeight={700}>Últimas Ventas</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Película</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ultimaVentas.map(t => (
                <TableRow key={t.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                  <TableCell><Typography fontFamily="monospace" fontSize="0.75rem" color="primary.main">{t.codigo}</Typography></TableCell>
                  <TableCell>{t.nombre_cliente || 'N/A'}</TableCell>
                  <TableCell>{t.funciones?.peliculas?.titulo || 'N/A'}</TableCell>
                  <TableCell fontWeight={700}>${t.total?.toLocaleString('es-CO')}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.estado}
                      size="small"
                      color={t.estado === 'activo' ? 'success' : t.estado === 'usado' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell>{new Date(t.created_at).toLocaleDateString('es-CO')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
