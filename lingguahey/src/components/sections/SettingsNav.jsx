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
import ContactModal from './ContactModal';

const allRoutes = [
  { label: "Home", path: "/homepage", roles: ["USER", "ADMIN", "TEACHER"] },
  { label: "Subscriptions", path: "/subscriptions", roles: ["TEACHER", "ADMIN"] },
  { label: "Contact Us", path: "/contact", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Admin DB", path: "/admindashboard", roles: ["ADMIN"] },
  { label: "Teacher DB", path: "/teacherdashboard", roles: ["TEACHER"] },
  { label: "Logout", path: "/landingpage", roles: ["USER", "TEACHER", "ADMIN"] },
];

const SettingsNav = ({ onClose, onProfileUpdated }) => {
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
  const [contactModalOpen, setContactModalOpen] = useState(false);

  
 //SFX
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
    playCancel
  } = useContext(MusicContext);


  // fetch user data (available to component and to onUpdate handlers)
  const fetchUser = async () => {
    if (!token) return;
    const userObj = getUserFromToken();
    const userId = userObj?.userId || userObj?.id;
    if (!userId) return;
    try {
      const userRes = await API.get(`/users/${userId}`);
      setUserData(userRes.data);
      return userRes.data;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchUser();
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
    } else if (route.label === "Contact Us") {
      // open contact modal instead of navigating to a contact page
      setContactModalOpen(true);

      return;
    } else {
      navigate(route.path);
    }
    onClose();
  };

  const filteredRoutes = allRoutes.filter((r) => r.roles.includes(userData.role));

  return (
    <Box sx={{ position: 'relative'}}>
      <IconButton 
        onClick={()=>{playCancel();onClose();}}
        sx={{ position: 'absolute', right: -16, top: -80 }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" align="center" sx={{ color: '#5D4037', mb: 2,mt:5 }}>
        {userData.firstName} {userData.middleName ? userData.middleName.charAt(0) + "." : ""}{" "}
        {userData.lastName}
      </Typography>


      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {playCancel();setProfileModalOpen(true)}}
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
              onClick={() => {playCancel();handleRoute(route)}}
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
            onClick={()=>{playCancel();toggleMusic();}}
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
        onUpdate={(updated) => {
          // update local user data when profile modal reports a change
          if (updated && updated.userId) {
            setUserData(updated);
            if (typeof onProfileUpdated === 'function') onProfileUpdated(updated);
          } else {
            // fallback: re-fetch and notify parent
            fetchUser().then((fresh) => {
              if (fresh && typeof onProfileUpdated === 'function') onProfileUpdated(fresh);
            });
          }
        }}
      />

      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        userData={userData}
      />
    </Box>
  );
};

export default SettingsNav;