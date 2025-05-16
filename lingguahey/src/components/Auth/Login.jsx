
import { useState, useEffect,useContext } from "react";
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
  IconButton
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../contexts/AuthContext";
import { MusicContext } from "../../contexts/MusicContext";

// Axios instance
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default function Login() {
  // ---- LOGIC (unchanged) ----
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { setIntroMode } = useContext(MusicContext);

  useEffect(() => {
    setIntroMode(true); // Switch to default/background music
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password } = form;
    if (!email || !password) {
      setError("Please enter your School Email and Password.");
      return;
    }
    try {
      const res = await API.post("/login", { email, password });
      setToken(res.data.token);
      navigate("/Homepage");
    } catch (err) {
      setError("Invalid School Email or Password.");
    }
  };

  const pageBg = "linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)";
  const panelBg = "#FFFFFF";
  const primaryBtn = "#FFCC80";
  const textColor = "#5D4037"; 

  return (
    <Grid container sx={{ minHeight: '100vh',minWidth: '100vw', background: pageBg, p: 2 }} alignItems="center" justifyContent="center">
      <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', maxWidth: 400, backgroundColor: panelBg, borderRadius: 2, p: 4, boxShadow: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4" align="center" sx={{ color: textColor }}>Log In</Typography>

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
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: panelBg }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: primaryBtn, color: textColor, textTransform: 'none' }}>
            Log in
          </Button>

          {error && <Typography color="error" align="center">{error}</Typography>}

          <Typography
            align="center"
            sx={{ color: primaryBtn, cursor: 'pointer', mt: 1 }}
            onClick={() => navigate('/roleselect')}
          >
            No Account? Register Now!
          </Typography>
        </Stack>
      </Box>
    </Grid>
  );
}
