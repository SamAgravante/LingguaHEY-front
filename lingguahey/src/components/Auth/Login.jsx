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
import { useAuth } from "../../contexts/AuthContext";

// Axios instance
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = form;

    if (!email || !password) {
      setError("Please enter your School Email and Password.");
      return;
    }

    try {
      const res = await API.post("/login", {
        email: email,
        password,
      });
      console.log("Login successful:", res.data);

      setToken(res.data.token); 
      navigate("/Homepage");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError("Invalid School Email or Password.");
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
              label="School Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter School Email"
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
            <Typography 
              variant="h10" 
              paddingTop={1}
              color="#80EF80"
              onClick={()=>navigate("/roleselect")}
              sx={{cursor: 'pointer'}}>
                No Account? Register Now!
            </Typography>
        </Stack>
      </form>
    </Grid>
  );
};

export default Login;
