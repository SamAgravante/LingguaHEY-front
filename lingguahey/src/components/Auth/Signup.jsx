// src/components/Auth/Signup.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Grid,
  Box,
  Stack,
  Typography,
  TextField,
  Checkbox,
  Button,
  FormControlLabel,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { MusicContext } from "../../contexts/MusicContext";

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "";
  const { setIntroMode } = useContext(MusicContext);

  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role,
    subscriptionStatus: false,
    idNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("error");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(
    "Please wait while we process your registration..."
  );
  const [dialogLoading, setDialogLoading] = useState(true);

  const {
        setSrc,
        setActivityMode,
        setLevelClearMode,
        playLaserSuccess,
        playLaserFail,
        playHeal,
        playShield,
        playSkip,
        playHit,
        playEnemyAttack,
        playEnemyDead,
        playConfirm,
        playDenied,
        playCancel,
        playEquip,
        playFlip,
        playDoorOpen,
        playDungeonClick,
      } = useContext(MusicContext);

  useEffect(() => {
    setIntroMode(true);
    if (!role) navigate("/roleselect");
  }, [role, navigate, setIntroMode]);

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCheckbox = (e) => setAgreed(e.target.checked);

  const toggleShow = () => setShowPassword((s) => !s);
  const toggleShowConfirm = () => setShowConfirm((s) => !s);

  const showSnack = (msg, sev = "error") => {
    setSnackMessage(msg);
    setSnackSeverity(sev);
    setSnackOpen(true);
  };
  const handleSnackClose = (_, reason) => {
    if (reason !== "clickaway") setSnackOpen(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const emailPattern = /^[A-Za-z0-9._%+-]+@cit\.edu$/;
    if (!emailPattern.test(user.email)) {
      showSnack("Email must end with @cit.edu", "warning");
      return;
    }
    if (user.password.length < 8) {
      showSnack("Password must be at least 8 characters.", "warning");
      return;
    }
    if (user.password !== user.confirmPassword) {
      showSnack("Passwords do not match!", "warning");
      return;
    }
    if (!agreed) {
      showSnack("You must agree to the terms and conditions.", "warning");
      return;
    }

    setDialogMessage("Please wait while we process your registration...");
    setDialogLoading(true);
    setDialogOpen(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        }
      );

      const data = await res.json();

      if (res.ok && res.status === 200) {
        setDialogMessage(
          "Registration successful! You are now logged in and will be redirected."
        );
      } else if (res.status === 202 && data.emailVerificationRequired) {
        setDialogMessage(
          "Registration successful! Please check your email to verify your account."
        );
      } else if (res.status === 400) {
        showSnack(
          data.message || "Registration failed. Please check your input.",
          "error"
        );
        setDialogOpen(false);
        return;
      } else {
        showSnack(
          data.message || "Unexpected error during registration.",
          "error"
        );
        setDialogOpen(false);
        return;
      }

      setDialogLoading(false);
    } catch (err) {
      console.error("Signup fetch error:", err);
      showSnack("Could not connect to the server. Please try again.", "error");
      setDialogOpen(false);
    }
  };

  // styling tokens
  const textColor = "#5D4037";
  const primaryBtn = "#FFCC80";

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
        <Box
          component="form"
          onSubmit={handleSignUp}
          sx={{
            width: "100%",
            minWidth: 1000,
            minHeight: 800,
            backgroundImage: `url(${MenuBoxHor})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            color: textColor,
            borderRadius: 2,
            paddingLeft: 51,
            paddingRight: 51,
            paddingTop: 15,
          }}
        >
          <Stack direction={"row"} alignItems="center" spacing={70}>
            <IconButton onClick={() => {playCancel();navigate("/roleselect");}}>
            <ArrowBackIcon sx={{ color: textColor }} />
            <Typography
              sx={{ cursor: "pointer", color: textColor }}
              onClick={() => {playCancel();navigate("/roleselect")}}
            >
              Back
            </Typography>
            </IconButton>
                {role && (
                  <Typography variant="h6" sx={{ color: textColor, mt: 2 }}>
                    Selected Role: {role === "USER" ? "Student" : "Teacher"}
                  </Typography>
                )}
            </Stack>
          
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ mt: 2 }}
          >
            {/* Left - form fields */}
            <Stack spacing={2} sx={{ flex: 1 }} alignItems="center">
              <Typography variant="h4" sx={{ color: textColor, mb: 2 }}>
                Sign Up
              </Typography>
              {["firstName", "middleName", "lastName", "email", "idNumber"].map(
                (name) => (
                  <TextField
                    key={name}
                    label={name.charAt(0).toUpperCase() + name.slice(1)}
                    name={name}
                    type="text"
                    value={user[name]}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      backgroundImage: `url(${GameTextField})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      width: 300,
                      maxHeight: 100,
                    }}
                    required={name !== "middleName"}
                  />
                )
              )}
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  backgroundImage: `url(${GameTextField})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      width: 300,
                      maxHeight: 100,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={()=>{playCancel();toggleShow();}} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={user.confirmPassword}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  backgroundImage: `url(${GameTextField})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      width: 300,
                      maxHeight: 100,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={()=>{playCancel();toggleShowConfirm();}} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />
              
            </Stack>

            {/* Right - terms & actions */}
            <Stack spacing={2} sx={{ flex: 1 }} alignItems="center">
              
              <Typography variant="h6" sx={{ color: textColor }}>
                Terms and Conditions
              </Typography>
              <Box
                sx={{
                  backgroundImage: `url(${GameTextFieldMedium})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  p: 2,
                  borderRadius: 1,
                  height: 280,
                  overflow: "auto",
                  width: 370,
                }}
              >
                <Stack spacing={2} sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  Welcome to <strong>LingguaHEY</strong>! These Terms and Conditions outline the rules for using our services. By accessing this website or using our services, you accept these terms in full.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>1. Definitions</strong><br />
                  "Company" refers to LingguaHEY.<br />
                  "User" refers to anyone using our services.<br />
                  "Service" refers to the products and services offered by LingguaHEY.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>2. Use of Our Services</strong><br />
                  You must have parental/guardian/teacher consent.<br />
                  You agree not to use our services for illegal or unauthorized purposes.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>3. User Accounts & Personal Information</strong><br />
                  You may need an account to access certain features.<br />
                  We collect personal info such as email, password, and name.<br />
                  You are responsible for maintaining the security of your account.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>4. Intellectual Property</strong><br />
                  All content is owned by LingguaHEY and protected by intellectual property laws.<br />
                  You may not reproduce, distribute, or modify any content without permission.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>5. Privacy Policy</strong><br />
                  Our Privacy Policy explains how we handle your data.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>6. Limitation of Liability</strong><br />
                  We do not guarantee that our services will be error-free.<br />
                  We are not liable for any indirect or incidental damages.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>7. Termination</strong><br />
                  We may suspend or terminate accounts that violate these terms.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>8. Governing Law</strong><br />
                  These terms are governed by the laws of imomama.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>9. Changes to These Terms</strong><br />
                  We may update these terms from time to time.
                </Typography>
                <Typography variant="body2" sx={{ color: "black", mb: 1 }}>
                  <strong>10. Contact Us</strong><br />
                  If you have any questions, contact us at teamlingguahey@gmail.com.
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "black", mt: 1 }}>
                  By using our services, you agree to these Terms & Conditions.
                </Typography>

            </Stack>
              </Box>
              <FormControlLabel
                control={<Checkbox checked={agreed} onChange={handleCheckbox} />}
                label="I agree to the terms and conditions"
                sx={{ color: textColor }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundImage: `url(${GameTextBox})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  height: 80,
                  width: 400,
                }}
              >
                Register
              </Button>
            </Stack>
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
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>

      {/* Registration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          if (!dialogLoading) navigate("/login");
        }}
      >
        <DialogTitle>Registration</DialogTitle>
        <DialogContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {dialogLoading && <CircularProgress size={24} />}
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        {!dialogLoading && (
          <DialogActions>
            <Button
              onClick={() => {
                playCancel();
                setDialogOpen(false);
                navigate("/login");
              }}
            >
              OK
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
