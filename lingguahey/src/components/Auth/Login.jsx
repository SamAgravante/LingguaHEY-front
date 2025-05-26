// src/components/Auth/Login.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Stack,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../../contexts/AuthContext";
import { MusicContext } from "../../contexts/MusicContext";

// Axios instance
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { setIntroMode } = useContext(MusicContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("error");

  useEffect(() => {
    setIntroMode(true);
  }, [setIntroMode]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleClickShowPassword = () => setShowPassword((s) => !s);

  const showSnack = (message, severity = "error") => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };
  const handleSnackClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      showSnack("Please enter your School Email and Password.", "warning");
      return;
    }

    try {
      const res = await API.post("/login", form);
      // success: 200 OK
      setToken(res.data.token);
      showSnack("Logged in successfully!", "success");
      setTimeout(() => navigate("/homepage"), 500);
    } catch (err) {
      const status = err.response?.status;

      if (status === 401) {
        // invalid credentials
        showSnack("Incorrect email or password.", "error");
      } else if (status === 403) {
        // not verified or disabled
        showSnack("Please check your email to verify your account.", "warning");
      } else {
        // other errors
        showSnack(
          err.response?.data?.message ||
            "An unexpected error occurred. Please try again.",
          "error"
        );
      }
    }
  };

  // styling tokens
  const pageBg = "linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)";
  const panelBg = "#FFFFFF";
  const primaryBtn = "#FFCC80";
  const textColor = "#5D4037";

  return (
    <>
      <Grid
        container
        sx={{
          minHeight: "100vh",
          minWidth: "100vw",
          background: pageBg,
          p: 2,
        }}
        alignItems="center"
        justifyContent="center"
      >
        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', maxWidth: 400, backgroundColor: panelBg, borderRadius: 2, p: 4, boxShadow: 3 }}>
          <IconButton onClick={()=>navigate('/')}><ArrowBackIcon sx={{ color:textColor }}/>
          <Typography sx={{ cursor:'pointer', color: textColor }} onClick={()=>navigate('/')}>Back</Typography>
          </IconButton>
          


          <Stack spacing={3}>
            <Typography
              variant="h4"
              align="center"
              sx={{ color: textColor }}
            >
              Log In
            </Typography>

            <TextField
              label="School Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ backgroundColor: panelBg }}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{ backgroundColor: panelBg }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: primaryBtn,
                color: textColor,
                textTransform: "none",
              }}
            >
              Log in
            </Button>

            <Typography
              align="center"
              sx={{
                color: primaryBtn,
                cursor: "pointer",
                mt: 1,
              }}
              onClick={() => navigate("/roleselect")}
            >
              No Account? Register Now!
            </Typography>
          </Stack>
        </Box>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
