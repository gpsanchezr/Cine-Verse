import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Fondo oscuro ideal para cines
    primary: {
      main: '#00B4D8', // Un hermoso tono Aguamarina/Azul claro para botones principales
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF0054', // Un rojo vibrante para alertas o botones de cancelar
    },
    background: {
      default: '#0B0F19', // Azul noche muy oscuro para el fondo general
      paper: '#1A2235', // Un poco más claro para las tarjetas de películas
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { 
      textTransform: 'none', // Botones más modernos sin todo en MAYÚSCULAS
      fontWeight: 600,
      borderRadius: '8px' // Botones ligeramente redondeados
    },
  },
  shape: {
    borderRadius: 12, // Tarjetas e imágenes con bordes suaves y modernos
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,180,216,0.3)' } // Efecto neón al pasar el mouse
        },
      },
    },
  },
});

export default theme;