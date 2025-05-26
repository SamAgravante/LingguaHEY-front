window.global = window;
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@mui/material/styles"; 
import { CssBaseline } from "@mui/material";   
import App from "./App";
import theme from './theme';
import "./index.css";
import { GlobalStyles } from '@mui/material';
import { MusicProvider } from "./contexts/MusicContext"; // <-- Add this import
import { ScoreProvider } from "./contexts/ScoreContext"; // <-- Add this import


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        '*, *::before, *::after': { boxSizing: 'content-box' }
      }} />
      <BrowserRouter>
        <AuthProvider>
          <MusicProvider>
            <ScoreProvider>
              <App />
            </ScoreProvider>
          </MusicProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);