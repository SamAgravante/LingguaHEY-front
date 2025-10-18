// src/theme.jsx
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a theme instance.
let theme = createTheme({
  zIndex: {
    snackbar: 20000,
  },
  palette: {
    primary: {
      main: '#6D4C41',
    },
    secondary: {
      main: '#1E88E5',
    },
    background: {
      default: '#E1F5FE',
    },
  },
  typography: {
    fontFamily: "'RetroGaming', system-ui, Avenir, Helvetica, Arial, sans-serif",

    // Optional: you can still tweak sizes/weights if you like
    h1: { fontSize: '3rem', fontWeight: 400, lineHeight: 1.2 },
    h2: { fontSize: '2.5rem', fontWeight: 400, lineHeight: 1.25 },
    h3: { fontSize: '2rem', fontWeight: 400, lineHeight: 1.3 },
    h4: { fontSize: '1.75rem', fontWeight: 400, lineHeight: 1.35 },
    h5: { fontSize: '1.5rem', fontWeight: 400, lineHeight: 1.4 },
    h6: { fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.45 },

    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: { fontSize: '0.75rem' },
    overline: { fontSize: '0.75rem', textTransform: 'uppercase' },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            }
          }
        }
      }
    }
    ,
    MuiSnackbar: {
      styleOverrides: {
        root: {
          position: 'fixed',
          zIndex: '20000 !important',
        }
      },
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      }
    }
  }
});


theme = responsiveFontSizes(theme);

export default theme;
