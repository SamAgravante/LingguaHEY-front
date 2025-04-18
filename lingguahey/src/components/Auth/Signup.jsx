import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Stack,
  Grid,
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  FormControlLabel,
  IconButton,
} from "@mui/material";

import { ArrowBack } from "@mui/icons-material";
import { subscribe } from "firebase/data-connect";

// Axios instance
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "";

  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: role,
    subscriptionStatus: true,
    idNumber: "",
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleClose = () => {
    navigate("/roleselect");
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
      subscriptionStatus: user.subscriptionStatus,
      role: user.role,
      password: user.password,
      idNumber: user.idNumber,
    };

    console.log("User data:", userData);
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
                    label="ID Number"
                    name="idNumber"
                    value={user.idNumber}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Enter ID Number"
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
                  
                  {role && (
                    <TextField
                      label="Role"
                      name="role"
                      value={user.role}
                      variant="outlined"
                      disabled
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  )}
                </Stack>
              </Grid>
            </Box>

            <Box
              sx={{
                minHeight: "60vh",
                minWidth: "45vw",
                borderRadius: "50px",
                padding: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
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

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton onClick={handleClose} aria-label="close">
                  <ArrowBack fontSize="large" />
                  <Typography paddingRight={1}>Return to Role Selection</Typography>
                </IconButton>
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Stack>
    </Grid>
  );
};

export default Signup;
