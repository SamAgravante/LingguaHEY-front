import { useState, useEffect, useContext } from "react";
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
  Snackbar,
  Alert,
  InputAdornment
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { MusicContext } from "../../contexts/MusicContext";

// Axios instance
const AUTH_API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || '';
  const { setIntroMode } = useContext(MusicContext);

  const [user, setUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role,
    subscriptionStatus: false,
    idNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("error");

  useEffect(() => {
    setIntroMode(true);
    if (!role) navigate('/roleselect');
  }, [role]);

  const handleChange = (e) => setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCheckbox = (e) => setAgreed(e.target.checked);
  const toggleShow = () => setShowPassword(show => !show);
  const toggleShowConfirm = () => setShowConfirm(show => !show);
  const showSnack = (msg, sev = "error") => { setSnackMessage(msg); setSnackSeverity(sev); setSnackOpen(true); };
  const handleSnackClose = (_, reason) => { if (reason !== 'clickaway') setSnackOpen(false); };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = user;
    if (password.length < 8) {
      showSnack("Password must be at least 8 characters.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      showSnack("Passwords do not match!", "warning");
      return;
    }
    if (!agreed) {
      showSnack("You must agree to the terms and conditions.", "warning");
      return;
    }

    try {
      await AUTH_API.post('/register', user);
      showSnack("Registered successfully! Redirecting to login...", "success");
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      console.error("Signup error:", err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) showSnack(serverMsg, "error");
      else if (err.response) showSnack(`Signup failed: ${err.response.status} ${err.response.statusText}`, "error");
      else showSnack(`Signup error: ${err.message}`, "error");
    }
  };

  const pageBg = "linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)";
  const panelBg = "#FFFFFF";
  const primaryBtn = "#FFCC80";
  const textColor = "#5D4037";

  return (
    <>
      <Grid container sx={{ minHeight: '100vh', minWidth: '100vw', background: pageBg, p: 2 }} alignItems="center" justifyContent="center">
        <Box component="form" onSubmit={handleSignUp} sx={{ width: '100%', maxWidth: 800, backgroundColor: panelBg, borderRadius: 2, p: 4, boxShadow: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {/* Left - Form Fields */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ color: textColor }}>Sign Up</Typography>
              {['firstName','middleName','lastName','email','idNumber'].map(name => (
                <TextField
                  key={name}
                  label={name.replace(/([A-Z])/g,' $1').replace(/^./,str=>str.toUpperCase())}
                  name={name}
                  type="text"
                  value={user[name]}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{ backgroundColor: panelBg }}
                />
              ))}
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={user.password}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ backgroundColor: panelBg }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShow} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={user.confirmPassword}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ backgroundColor: panelBg }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowConfirm} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {role && <TextField label="Role" value={role} disabled fullWidth variant="outlined" sx={{ backgroundColor: panelBg }} />}
            </Stack>
            {/* Right - Terms & Actions */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: textColor }}>Terms and Conditions</Typography>
              <Box sx={{ backgroundColor: '#F5F5F5', p:2, borderRadius:1, height:200, overflow:'auto' }}>
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
                  If you have any questions, contact us at baliguat.hanzharvey@gmail.com.
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "black", mt: 1 }}>
                  By using our services, you agree to these Terms & Conditions.
                </Typography>
              </Box>
              <FormControlLabel control={<Checkbox checked={agreed} onChange={handleCheckbox}/>} label="I agree to the terms and conditions" sx={{ color: textColor }} />
              <Button type="submit" variant="contained" sx={{ backgroundColor: primaryBtn, color: textColor, textTransform: 'none' }}>Register</Button>
              <Box sx={{ display:'flex', alignItems:'center', mt:2 }}>
                <IconButton onClick={()=>navigate('/roleselect')}><ArrowBackIcon sx={{ color:textColor }}/></IconButton>
                <Typography sx={{ cursor:'pointer', color: primaryBtn }} onClick={()=>navigate('/roleselect')}>Return to Role Selection</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Grid>
      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={handleSnackClose} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width:'100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
