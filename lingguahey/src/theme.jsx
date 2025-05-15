// src/theme.jsx
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a theme instance.
let theme = createTheme({
  palette: {
    // you can customize your color palette here if you like
    primary: {
      main: '#6D4C41', // example brown
    },
    secondary: {
      main: '#1E88E5', // example blue
    },
    background: {
      default: '#E1F5FE', // light background
    },
  },
  typography: {
    // Base font for body copy:
    fontFamily: "'ABeeZee', system-ui, Avenir, Helvetica, Arial, sans-serif",

    // Heading overrides:
    h1: {
      fontFamily: "'LittleBubble', cursive",
      fontSize: '3rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: "'LittleBubble', cursive",
      fontSize: '2.5rem',
      fontWeight: 400,
      lineHeight: 1.25,
    },
    h3: {
      fontFamily: "'LittleBubble', cursive",
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: "'LittleBubble', cursive",
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.35,
    },
    h5: {
      fontFamily: "'LittleBubble', cursive",
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: "'LittleBubble', cursive",
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.45,
    },
    // You can also tweak subtitle1, body1, button, etc.
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // keep button text as-is
      fontFamily: "'ABeeZee', sans-serif",
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
