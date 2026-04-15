import { Box, Typography, Button, Container, Grid, Chip } from '@mui/material'
import { PlayArrow, ConfirmationNumber, Star } from '@mui/icons-material'
import { Link } from 'react-router-dom'

const POSTER_IMGS = [
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&q=80',
]

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', pt: 8 }}>
      {/* HERO */}
      <Box sx={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Background gradient */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(229,9,20,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(245,166,35,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Floating poster grid - right side */}
        <Box sx={{
          position: 'absolute', right: { xs: -100, md: 0 },
          top: 0, bottom: 0, width: { xs: '50%', md: '45%' },
          display: 'flex', gap: 1.5, p: 3, opacity: 0.35,
          maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
        }}>
          {[0,1].map(col => (
            <Box key={col} sx={{
              display: 'flex', flexDirection: 'column', gap: 1.5,
              transform: col === 1 ? 'translateY(-40px)' : 'none',
              flexShrink: 0, flex: 1,
            }}>
              {POSTER_IMGS.slice(col * 3, col * 3 + 3).map((src, i) => (
                <Box key={i} component="img" src={src}
                  sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, filter: 'grayscale(30%)' }} />
              ))}
            </Box>
          ))}
        </Box>

        {/* Hero content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Chip
                label="🎬 EXPERIENCIA PREMIUM DE CINE"
                size="small"
                sx={{ mb: 3, bgcolor: 'rgba(229,9,20,0.15)', color: 'primary.main', border: '1px solid rgba(229,9,20,0.3)', fontWeight: 600 }}
              />
              <Typography variant="h1"
                sx={{ fontSize: { xs: '3.5rem', md: '5.5rem' }, lineHeight: 1, mb: 2, color: 'white' }}>
                VIVE EL CINE
                <br />
                <Box component="span" sx={{
                  background: 'linear-gradient(135deg, #E50914, #F5A623)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  SIN LÍMITES
                </Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 4, lineHeight: 1.7 }}>
                Reserva tus asientos, elige tu función favorita y vive
                la mejor experiencia cinematográfica. 150 asientos,
                tecnología de punta, experiencia única.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link} to="/cartelera"
                  variant="contained" size="large"
                  startIcon={<PlayArrow />}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                >
                  Ver Cartelera
                </Button>
                <Button
                  component={Link} to="/validar"
                  variant="outlined" size="large"
                  startIcon={<ConfirmationNumber />}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                >
                  Validar Tiquete
                </Button>
              </Box>

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 4, mt: 6 }}>
                {[
                  { value: '150', label: 'Asientos Premium' },
                  { value: '4K', label: 'Calidad de imagen' },
                  { value: '100%', label: 'Digital' },
                ].map(stat => (
                  <Box key={stat.label}>
                    <Typography variant="h4" fontWeight={800} sx={{
                      background: 'linear-gradient(135deg, #E50914, #F5A623)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" mb={6} sx={{ fontSize: '2.5rem' }}>
            ¿POR QUÉ ELEGIRNOS?
          </Typography>
          <Grid container spacing={4}>
            {[
              { icon: '🎬', title: 'Últimos estrenos', desc: 'Las mejores películas, siempre al día.' },
              { icon: '💺', title: 'Selección de asientos', desc: 'Elige exactamente dónde quieres sentarte.' },
              { icon: '🎟️', title: 'Tiquete digital', desc: 'Recibe tu tiquete con código único en segundos.' },
              { icon: '🤖', title: 'Asistente IA', desc: 'CineBot responde tus preguntas en tiempo real.' },
            ].map(f => (
              <Grid item xs={12} sm={6} md={3} key={f.title}>
                <Box sx={{
                  p: 3, borderRadius: 3, textAlign: 'center',
                  background: 'linear-gradient(145deg, #1A1A26 0%, #12121A 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: 'rgba(229,9,20,0.3)', transform: 'translateY(-4px)' }
                }}>
                  <Typography fontSize="2.5rem" mb={2}>{f.icon}</Typography>
                  <Typography variant="h6" fontWeight={700} mb={1}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
