import { useState, useEffect } from "react";
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
  IconButton
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Axios instance
const API2 = axios.create({
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

  const [user, setUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: role,
    subscriptionStatus: true,
    idNumber: ''
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  // Redirect to role select if no role is passed
  useEffect(() => {
    if (!role) navigate('/roleselect');
  }, [role]);

  // Keep user state in sync with role if it changes
  useEffect(() => {
    setUser(prev => ({ ...prev, role }));
  }, [role]);

  const handleChange = (e) => {
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (e) => setAgreed(e.target.checked);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (!agreed) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    try {
      await API2.post('/register', {
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        role: user.role,
        password: user.password,
        idNumber: user.idNumber,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  const pageBg = "linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)";
  const panelBg = "#FFFFFF";
  const primaryBtn = "#FFCC80";
  const textColor = "#5D4037";

  return (
    <Grid container sx={{ minHeight: '100vh', minWidth: '100vw', background: pageBg, p: 2 }} alignItems="center" justifyContent="center">
      <Box component="form" onSubmit={handleSignUp} sx={{ width: '100%', maxWidth: 800, backgroundColor: panelBg, borderRadius: 2, p: 4, boxShadow: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ color: textColor }}>Sign Up</Typography>
            {['firstName', 'middleName', 'lastName', 'email', 'idNumber', 'password', 'confirmPassword'].map(name => (
              <TextField
                key={name}
                label={name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                name={name}
                type={name.toLowerCase().includes('password') ? 'password' : 'text'}
                value={user[name]}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={{ backgroundColor: panelBg }}
              />
            ))}
            {role && (
              <TextField
                label="Role"
                name="role"
                value={role}
                disabled
                fullWidth
                variant="outlined"
                sx={{ backgroundColor: panelBg }}
              />
            )}
          </Stack>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: textColor }}>Terms and Conditions</Typography>
            <Box sx={{ backgroundColor: '#F5F5F5', p: 2, borderRadius: 1, height: 200, overflow: 'auto' }}>
              {/* Terms content here */}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </Box>
            <FormControlLabel
              control={<Checkbox checked={agreed} onChange={handleCheckbox} />}
              label="I agree to the terms and conditions"
              sx={{ color: textColor }}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained" sx={{ backgroundColor: primaryBtn, color: textColor, textTransform: 'none' }}>
              Register
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <IconButton onClick={() => navigate('/roleselect')}>
                <ArrowBackIcon sx={{ color: textColor }} />
              </IconButton>
              <Typography sx={{ cursor: 'pointer', color: primaryBtn }} onClick={() => navigate('/roleselect')}>
                Return to Role Selection
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Grid>
  );
}
