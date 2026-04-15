import { useState, useRef, useEffect } from 'react'
import {
  Box, Fab, Paper, Typography, TextField, IconButton,
  Avatar, CircularProgress, Slide, Chip, Divider
} from '@mui/material'
import {
  SmartToy, Close, Send, Movie, Schedule
} from '@mui/icons-material'
import { supabase } from '../supabaseClient'

// ⚠️ REEMPLAZAR CON TU CLAVE REAL DE GOOGLE AI STUDIO (https://aistudio.google.com)
const GEMINI_API_KEY = 'TU_API_KEY_AQUI' // REEMPLAZAR ANTES DE PRODUCCIÓN

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`

// Obtiene datos reales de la cartelera desde Supabase
const obtenerContextoCartelera = async () => {
  const hoy = new Date().toISOString().split('T')[0]
  const { data: funciones } = await supabase
    .from('funciones')
    .select(`
      id,
      fecha,
      hora,
      sala,
      precio,
      estado,
      peliculas (titulo, genero, duracion, clasificacion, descripcion)
    `)
    .gte('fecha', hoy)
    .eq('estado', 'disponible')
    .order('fecha', { ascending: true })
    .limit(20)

  if (!funciones || funciones.length === 0) {
    return 'No hay funciones disponibles en este momento.'
  }

  const cartelera = funciones.map(f =>
    `• "${f.peliculas?.titulo}" | Género: ${f.peliculas?.genero} | Clasificación: ${f.peliculas?.clasificacion} | ` +
    `Duración: ${f.peliculas?.duracion} min | Fecha: ${f.fecha} | Hora: ${f.hora} | Sala: ${f.sala} | Precio: $${f.precio} COP`
  ).join('\n')

  return cartelera
}

const SYSTEM_PROMPT = (cartelera) => `
Eres CineBot, el asistente inteligente de Cine-Verse, un sistema de gestión de cine moderno.
Responde siempre en español, de forma amable, concisa y con emojis de cine.
Tienes acceso a la cartelera actual y debes usarla para responder preguntas sobre funciones.

CARTELERA ACTUAL (datos en tiempo real de la base de datos):
${cartelera}

REGLAS:
- Si te preguntan por una película específica, busca en la cartelera y da la info exacta.
- Si no hay funciones de esa película, dilo claramente.
- Para preguntas de precios, horarios o disponibilidad, usa solo los datos de la cartelera.
- Si te preguntan algo fuera de temas de cine, redirige amablemente al tema de películas.
- Nunca inventes información; si no sabes algo, dilo.
- Máximo 3-4 oraciones por respuesta para ser conciso.
`

const MensajeBot = ({ msg }) => {
  const isBot = msg.role === 'assistant'
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: isBot ? 'row' : 'row-reverse' }}>
      {isBot && (
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, flexShrink: 0 }}>
          <SmartToy sx={{ fontSize: 18 }} />
        </Avatar>
      )}
      <Paper
        sx={{
          px: 2, py: 1.5,
          maxWidth: '80%',
          borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          bgcolor: isBot ? 'rgba(229,9,20,0.12)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isBot ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {msg.content}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {msg.time}
        </Typography>
      </Paper>
    </Box>
  )
}

export default function CineBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🎬 ¡Hola! Soy CineBot, tu asistente de Cine-Verse. Puedo ayudarte con horarios, películas en cartelera, precios y más. ¿En qué te puedo ayudar?',
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cartelera, setCartelera] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (open && !cartelera) {
      obtenerContextoCartelera().then(setCartelera)
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sugerencias = [
    '¿Qué películas hay hoy?',
    '¿Cuál es el precio del tiquete?',
    '¿Qué géneros tienen?',
  ]

  const enviarMensaje = async (texto = input) => {
    const contenido = texto.trim()
    if (!contenido || loading) return

    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    const nuevosMensajes = [...messages, { role: 'user', content: contenido, time: hora }]
    setMessages(nuevosMensajes)
    setInput('')
    setLoading(true)

    try {
      const historial = nuevosMensajes.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT(cartelera) }] },
          contents: historial,
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
        })
      })

      const data = await response.json()
      const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text ||
        '😔 Lo siento, no pude procesar tu consulta. Intenta de nuevo.'

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: respuesta,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Error de conexión con el asistente. Verifica tu API Key de Gemini.',
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* FAB flotante */}
      <Fab
        onClick={() => setOpen(!open)}
        sx={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1300,
          background: 'linear-gradient(135deg, #E50914, #B0060F)',
          boxShadow: '0 8px 32px rgba(229,9,20,0.4)',
          '&:hover': { transform: 'scale(1.1)', boxShadow: '0 12px 40px rgba(229,9,20,0.6)' },
          transition: 'all 0.3s ease',
        }}
      >
        {open ? <Close /> : <SmartToy />}
      </Fab>

      {/* Panel del chat */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed', bottom: 90, right: 24, zIndex: 1300,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            height: 520,
            display: 'flex', flexDirection: 'column',
            bgcolor: '#12121A',
            border: '1px solid rgba(229,9,20,0.3)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
            background: 'linear-gradient(135deg, rgba(229,9,20,0.2) 0%, rgba(176,6,15,0.1) 100%)',
            borderBottom: '1px solid rgba(229,9,20,0.2)',
          }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>
              <SmartToy sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>CineBot</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2ECC71' }} />
                <Typography variant="caption" color="text.secondary">En línea · IA + Cartelera en vivo</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, i) => <MensajeBot key={i} msg={msg} />)}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <SmartToy sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper sx={{ px: 2, py: 1.5, bgcolor: 'rgba(229,9,20,0.08)', borderRadius: '4px 16px 16px 16px' }}>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <Box key={i} sx={{
                        width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main',
                        animation: 'bounce 1s infinite', animationDelay: `${i * 0.2}s`,
                        '@keyframes bounce': { '0%,100%': { opacity: 0.3 }, '50%': { opacity: 1 } }
                      }} />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Sugerencias */}
          {messages.length <= 1 && (
            <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {sugerencias.map(s => (
                <Chip key={s} label={s} size="small" onClick={() => enviarMensaje(s)}
                  sx={{ cursor: 'pointer', borderColor: 'rgba(229,9,20,0.4)', '&:hover': { bgcolor: 'rgba(229,9,20,0.15)' } }}
                  variant="outlined" color="primary" />
              ))}
            </Box>
          )}

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth size="small" placeholder="Pregúntame sobre la cartelera..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              onClick={() => enviarMensaje()}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: 'primary.main', color: 'white', borderRadius: 2,
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Send sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </>
  )
}
