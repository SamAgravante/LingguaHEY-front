// src/components/Auth/Login.jsx
import { useRef, useState } from "react";
import { login } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const emailRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    console.log(form.email,form.password);
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/profile");
    } catch (err) {
      setError("Login failed. Check credentials.");
    }
  };

    return (
      <Grid
      container
      sx={{
          backgroundColor: '#e2a5bf',
          minHeight: '100vh',
          minWidth: '100vw',
          display: 'flex',
          justifyContent: 'center',
          //alignItems: 'center',
            }}
        >
      <Stack direction="column" alignItems="center" >
          <Box
              sx={{
                  backgroundColor: '#D2E0D3',
                  minHeight: '50vh',
                  minWidth: '30vw',
                  borderBottomLeftRadius: '50px',
                  borderBottomRightRadius: '50px',
              }}>

          </Box>
          <Typography 
            variant="h4"
            paddingTop={2}
            paddingBottom={2}>
            Log In
          </Typography>

          <TextField
            inputRef={emailRef}
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            variant="outlined"
            placeholder="Enter Email"
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            inputRef={passwordRef}
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            type={showPassword ? "text" : "password"}
            variant="outlined"
            placeholder="Enter Password"
            fullWidth
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
            sx={{ minWidth: "100%", borderRadius: "20px" }}
            onClick={handleSubmit}
          >
            Log in
          </Button>

          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}
      </Stack>
    </Grid>
  );
};

export default Login;
