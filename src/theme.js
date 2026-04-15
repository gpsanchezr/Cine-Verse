import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50914',
      light: '#FF3D47',
      dark: '#B0060F',
    },
    secondary: {
      main: '#F5A623',
      light: '#FFB84D',
      dark: '#C07D00',
    },
    background: {
      default: '#0A0A0F',
      paper: '#12121A',
    },
    surface: {
      main: '#1A1A26',
      light: '#22222F',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0B0',
    },
    success: { main: '#2ECC71' },
    error: { main: '#E74C3C' },
    warning: { main: '#F39C12' },
    info: { main: '#3498DB' },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Bebas Neue", cursive', letterSpacing: '2px' },
    h2: { fontFamily: '"Bebas Neue", cursive', letterSpacing: '2px' },
    h3: { fontFamily: '"Bebas Neue", cursive', letterSpacing: '1.5px' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0A0A0F 0%, #0F0F1A 100%)',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#E50914 #12121A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #E50914 0%, #B0060F 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF3D47 0%, #E50914 100%)',
            boxShadow: '0 8px 24px rgba(229,9,20,0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #12121A 0%, #1A1A26 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            border: '1px solid rgba(229,9,20,0.3)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(229,9,20,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#E50914' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(229,9,20,0.2)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'rgba(229,9,20,0.15)',
            fontWeight: 700,
            color: '#E50914',
          },
        },
      },
    },
  },
})

export default theme
