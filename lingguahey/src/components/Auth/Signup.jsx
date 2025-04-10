import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Stack,
  Grid,
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  FormControlLabel
} from "@mui/material";

// Axios instance
const API = axios.create({
  baseURL: 'http://localhost:8080/api/alibata/auth',
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const Signup = () => {
  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleCheckbox = (e) => {
    setAgreed(e.target.checked);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!agreed) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    const userData = {
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    };

    try {
      const response = await API.post("/register", userData);
      console.log("User registered:", response.data);
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have permission to perform this action.");
      } else {
        setError(err.response?.data?.message || "Signup failed. Please try again.");
      }
      console.error("Signup failed:", err);
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
        alignItems: "center",
      }}
    >
      <Stack direction="column" alignItems="center">
        <Grid
          sx={{
            backgroundColor: "#D2E0D3",
            minHeight: "80vh",
            minWidth: "90vw",
            borderRadius: "50px",
          }}
        >
          <Stack direction="row" alignItems="center">
            <Box
              sx={{
                backgroundColor: "#D2E000",
                minHeight: "80vh",
                minWidth: "45vw",
                borderRadius: "50px",
              }}
            >
              <Grid
                sx={{
                  minHeight: "40vh",
                  minWidth: "30vw",
                  borderRadius: "10px",
                  margin: 10,
                }}
              >
                <Stack direction={"column"}>
                  <Typography variant="h4" paddingBottom={2}>
                    Sign Up
                  </Typography>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter First Name"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Middle Name"
                    name="middleName"
                    value={user.middleName}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter Middle Name"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter Last Name"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter Email"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={user.password}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter Password"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter Password Again"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                </Stack>
              </Grid>
            </Box>

            <Box
              sx={{
                minHeight: "60vh",
                minWidth: "45vw",
                borderRadius: "50px",
                padding: 4,
              }}
            >
              <Stack direction={"column"}>
                <Typography variant="h6" paddingBottom={2}>
                  Terms and Conditions
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "#D2E000",
                    maxHeight: "40vh",
                    maxWidth: "30vw",
                    borderRadius: "30px",
                    overflowY: "scroll",
                    padding: 3,
                    mb: 2,
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreed}
                      onChange={handleCheckbox}
                      name="agreed"
                    />
                  }
                  label="I agree to the terms and conditions"
                />

                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, borderRadius: "20px" }}
                  onClick={handleSignUp}
                >
                  Register
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Stack>
    </Grid>
  );
};

export default Signup;
