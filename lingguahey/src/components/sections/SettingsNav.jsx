import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../api';
import { getUserFromToken } from '../../utils/auth';
import { MusicContext } from '../../contexts/MusicContext';

import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import ProfileModal from '../Profile/ProfileModal';

const allRoutes = [
  { label: "Home", path: "/homepage", roles: ["USER", "ADMIN", "TEACHER"] },
  { label: "Subscriptions", path: "/subscriptions", roles: ["TEACHER", "ADMIN"] },
  { label: "Contact Us", path: "/contact", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Admin DB", path: "/admindashboard", roles: ["ADMIN"] },
  { label: "Teacher DB", path: "/teacherdashboard", roles: ["TEACHER"] },
  { label: "Logout", path: "/landingpage", roles: ["USER", "TEACHER", "ADMIN"] },
];

const SettingsNav = ({ onClose }) => {
  const navigate = useNavigate();
  const { musicOn, toggleMusic } = useContext(MusicContext);
  const { token, logout } = useAuth();
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null,
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    const userObj = getUserFromToken();
    const userId = userObj?.userId || userObj?.id;
    if (!userId) return;

    const loadUser = async () => {
      try {
        const userRes = await API.get(`/users/${userId}`);
        setUserData(userRes.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    loadUser();
  }, [token]);

  const handleRoute = async (route) => {
    if (route.label === "Logout") {
      try {
        await API.post("/auth/logout");
      } catch (err) {
        console.error("Server logout failed:", err);
      }
      logout();
      navigate("/");
    } else {
      navigate(route.path);
    }
    onClose();
  };

  const filteredRoutes = allRoutes.filter((r) => r.roles.includes(userData.role));

  return (
    <Box sx={{ position: 'relative'}}>
      <IconButton 
        onClick={onClose}
        sx={{ position: 'absolute', right: -16, top: -16 }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" align="center" sx={{ color: '#5D4037', mb: 2 }}>
        {userData.firstName} {userData.middleName ? userData.middleName.charAt(0) + "." : ""}{" "}
        {userData.lastName}
      </Typography>


      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => setProfileModalOpen(true)}
          sx={{
            backgroundColor: "#AED581",
            color: '#5D4037',
            "&:hover": { backgroundColor: "#C5E1A5" },
            textTransform: "none",
          }}
        >
          View Profile Details
        </Button>
      </Box>

      <List>
        {filteredRoutes.map((route) => (
          <ListItem key={route.label} disablePadding>
            <ListItemButton
              onClick={() => handleRoute(route)}
              sx={{
                color: '#5D4037',
                "&:hover": { backgroundColor: 'rgba(255, 204, 128, 0.4)' },
                "&.Mui-selected": { backgroundColor: '#FFCC80', fontWeight: "bold" },
              }}
            >
              <ListItemText primary={route.label} primaryTypographyProps={{ fontSize: "1rem" }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Add Music Toggle Button as a ListItem */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={toggleMusic}
            sx={{
              color: '#5D4037',
              "&:hover": { backgroundColor: 'rgba(255, 204, 128, 0.4)' },
            }}
          >
            <ListItemText 
              primary={musicOn ? '🎵 Mute Music' : '🔇 Play Music'} 
              primaryTypographyProps={{ fontSize: "1rem" }} 
            />
          </ListItemButton>
        </ListItem>
      </List>

      <ProfileModal 
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </Box>
  );
};

export default SettingsNav;