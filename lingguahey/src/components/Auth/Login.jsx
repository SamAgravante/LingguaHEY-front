// src/components/Auth/Login.jsx
import { useState } from "react";
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

// Axios instance
const API = axios.create({
  baseURL: 'http://localhost:8080/api/alibata/auth',
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ schoolId: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { schoolId, password } = form;

    if (!schoolId || !password) {
      setError("Please enter your School ID and Password.");
      return;
    }

    try {
      const res = await API.post("/login", {
        email: schoolId,
        password,
      });
      console.log("Login successful:", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError("Invalid School ID or Password.");
    }
  };

  return (
    <Grid
      container
      sx={{
        backgroundColor: "#e2a5bf",
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        justifyContent: "center",
        //alignItems: "center",
      }}
    >
      <form onSubmit={handleLogin}>
        <Stack direction="column" alignItems="center">
          <Box
            sx={{
              backgroundColor: "#D2E0D3",
              minHeight: "50vh",
              width: { xs: "80vw", sm: "20vw", md: "30vw" },
              borderBottomLeftRadius: "50px",
              borderBottomRightRadius: "50px",
              padding: 4,
            }}
          >

          </Box>
          <Typography variant="h4" paddingBottom={2} align="center">
              Log In
            </Typography>

            <TextField
              label="School ID"
              name="schoolId"
              value={form.schoolId}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter School ID"
              fullWidth
              autoComplete="username"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              placeholder="Enter Password"
              fullWidth
              autoComplete="current-password"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
              variant="contained"
              color="primary"
              type="submit"
              sx={{ minWidth: "100%", borderRadius: "20px" }}
            >
              Log in
            </Button>

            {error && (
              <Typography color="error" mt={2} align="center">
                {error}
              </Typography>
            )}
        </Stack>
      </form>
    </Grid>
  );
};

export default Login;
