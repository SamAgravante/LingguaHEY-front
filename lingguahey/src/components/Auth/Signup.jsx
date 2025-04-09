import { useState } from "react";
import { signup } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
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

const Signup = () => {
  const [confirmPass, setConfirmPass] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    idNumber: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "confirmpassword") {
      setConfirmPass(value);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCheckbox = (e) => {
    setAgreed(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmPass !== form.password) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    setError("");
    try {
      await signup(form);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
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
          alignItems: 'center',
            }}
        >
      <Stack direction="column" alignItems="center" >
          <Grid
              sx={{
                  backgroundColor: '#D2E0D3',
                  minHeight: '80vh',
                  minWidth: '90vw',
                  borderRadius: '50px',
              }}>
                <Stack direction="row" alignItems="center">
                  <Box
                    sx={{
                      backgroundColor: '#D2E000',
                      minHeight: '80vh',
                      minWidth: '45vw',
                      borderRadius: '50px',
                  }}>
                    <Grid
                      sx={{
                        minHeight: '40vh',
                        minWidth: '30vw',
                        borderRadius: '10px',
                        margin:10
                    }}>
                      <Stack direction={"column"}>
                      <Typography
                        variant="h4"
                        paddingBottom={2}>
                          Sign Up
                      </Typography>
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Enter First Name"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Middle Name"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Enter Middle Name"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Enter Last Name"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
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
                        label="Password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Enter Password"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Confirm Password"
                        name="confirmpassword"
                        value={confirmPass}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Enter Password Again"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      </Stack>
                      
                    </Grid>
                  </Box>

            {/* Right Terms Box */}
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non dui at velit maximus vehicula:
                  Nulla a justo eget diam dignissim feugiat.
                  Pellentesque sit amet diam consectetur, sodales nunc in, pulvinar urna.
                  Donec lacinia lectus commodo tellus condimentum ornare.
                  Aliquam at magna at diam tempor ultricies vitae id justo.
                  Nam non sem vitae libero tincidunt efficitur.
                  Vivamus sed ex nec sem scelerisque euismod sed fermentum elit.
                  Mauris quis neque ut eros viverra malesuada in id dolor.

                  Praesent at leo mollis, elementum sapien congue, suscipit metus.
                  Curabitur eu urna condimentum, faucibus ligula eget, imperdiet mauris.

                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non dui at velit maximus vehicula:
                  Nulla a justo eget diam dignissim feugiat.
                  Pellentesque sit amet diam consectetur, sodales nunc in, pulvinar urna.
                  Donec lacinia lectus commodo tellus condimentum ornare.
                  Aliquam at magna at diam tempor ultricies vitae id justo.
                  Nam non sem vitae libero tincidunt efficitur.
                  Vivamus sed ex nec sem scelerisque euismod sed fermentum elit.
                  Mauris quis neque ut eros viverra malesuada in id dolor.

                  Praesent at leo mollis, elementum sapien congue, suscipit metus.
                  Curabitur eu urna condimentum, faucibus ligula eget, imperdiet mauris.
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
                  onClick={handleSubmit}
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
