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
import LandingBackgroundPic from '../../assets/images/backgrounds/CrystalOnly.png';
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import MenuBoxHor from '../../assets/images/backgrounds/MenuBox1var.png';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import GameTextbox from '../../assets/images/backgrounds/GameTextBox.png';
import GameTextFieldLong from '../../assets/images/backgrounds/GameTextFieldLong.png';
import GameTextBoxLong from '../../assets/images/backgrounds/GameTextBoxLong.png';
import { getUserFromToken } from "../../utils/auth";

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
      // Set token first
      await setToken(res.data.token);
      
      // Wait a moment for token to be stored
      setTimeout(async () => {
        const userObj = getUserFromToken();
        console.log("Decoded user from token:", userObj);
        
        if (!userObj) {
          showSnack("Error getting user details. Please try again.", "error");
          return;
        }

        showSnack("Logged in successfully!", "success");

        // Navigate based on current token decode
        switch(userObj.role) {
          case "ADMIN":
            navigate("/admindashboard");
            break;
          case "TEACHER":
            navigate("/teacherdashboard");
            break;
          default:
            navigate("/homepage");
        }
      }, 100); // Small delay to ensure token is stored

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

  const panelBg = "#FFFFFF";
  const primaryBtn = '#5D4037';
  const textColor = "#5D4037";

  return (
    <>
      <Grid
        container
        sx={{
          backgroundImage: `url(${LandingBackgroundPic})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    minWidth: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
        }}
        alignItems="center"
        justifyContent="center"
      >
        <Box component="form" onSubmit={handleLogin} 
          sx={{ 
            minWidth: 700, 
            Height: 600,
            backgroundImage: `url(${MenuBoxHor})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            color: textColor, 
            borderRadius: 2,
            padding:20,
            //border: '4px solid #FFF3E0',
            alignContent: 'center',
            }}>
          <IconButton onClick={()=>navigate('/')}><ArrowBackIcon sx={{ color:textColor }}/>
          <Typography sx={{ cursor:'pointer', color: textColor }} onClick={()=>navigate('/')}>Back</Typography>
          </IconButton>
          


          <Stack spacing={3} sx={{ mt: 2 }} alignItems="center">
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
              sx={{ 
                backgroundImage: `url(${GameTextFieldLong})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: 500,
          }}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}

              sx={{ 
                backgroundImage: `url(${GameTextFieldLong})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: 500,
              }}
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
                backgroundImage: `url(${GameTextBoxLong})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                height: 55,
                width: 500,
              }}
            >
              Log in
            </Button>

            <Typography
              align="center"
              sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 15, color: '#5D4037', cursor: 'pointer' }}
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
