import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemText, Grid, Button, Box } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 240;

// Pastel palette with full-viewport layout
const pastelBackground = "#FFE0B2";      // warm pastel peach for drawer
//const pageGradient = "linear-gradient(135deg, #FFF3E0 30%, #C8E6C9 90%)"; // gentle yellow to mint
const hoverBg = "rgba(255, 204, 128, 0.4)";
const selectedBg = "#FFCC80";
const textColor = "#5D4037";

const allRoutes = [
  { label: 'Home', path: '/Homepage' },
  { label: 'admindb', path: '/admindashboard'},
  { label: 'teacherdb', path: '/teacherdashboard'},
  { label: 'Settings', path: '/settings' },
  { label: 'Payment Method', path: '/payment' },
  { label: 'Subscriptions', path: '/subscriptions' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Logout', path: '/logout' },
];

const Layout = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null, 
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const API = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        const fetchUser = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users/${decoded.userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const user = response.data;
            //console.log("Fetched user:", user);

            
            setUserData({
              userId: user.userId,
              firstName: user.firstName,
              middleName: user.middleName || "",
              lastName: user.lastName || "",
              role: user.role,
            });
          } catch (err) {
            console.error("Failed to fetch user:", err);
          }
        };

        fetchUser();
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  const handleRoute = async (route) => {
    const API = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (route.label === 'Logout') {
      try {
        await API.post('/logout');
        localStorage.removeItem('token');
        setToken(null);
        navigate('/');
      } catch (err) {
        console.error('Logout failed:', err.response?.data || err.message);
      }
    } else {
      navigate(route.path);
    }
  };

  // Filter routes based on user role
  const filteredRoutes = allRoutes.filter(route => {
    return route.roles ? route.roles.includes(userData.role) : true; // Use userData.role
  });

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Grid container sx={{ width: '100%', height: '100%', 
      backgroundColor: '#C8E6C9' }}>

        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              height: '100%',
              boxSizing: 'border-box',
              bgcolor: pastelBackground,
              borderRight: '1px solid #FFB74D',
            },
          }}
        >
          <Toolbar />
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/profilepage')}
              sx={{
                backgroundColor: '#AED581',
                color: textColor,
                '&:hover': { backgroundColor: '#C5E1A5' },
                textTransform: 'none',
              }}
            >
              Edit Profile
            </Button>
          </Box>
          <List sx={{ height: 'calc(100% - 112px)', overflowY: 'auto' }}>
            {filteredRoutes.map((route) => (
              <ListItem key={route.label} disablePadding>
                <ListItemButton
                  onClick={() => handleRoute(route)}
                  selected={window.location.pathname === route.path}
                  sx={{
                    color: textColor,
                    '&:hover': { backgroundColor: hoverBg },
                    '&.Mui-selected': { backgroundColor: selectedBg, fontWeight: 'bold' },
                  }}
                >
                  <ListItemText primary={route.label} primaryTypographyProps={{ fontSize: '1rem' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box component="main"
          sx={{
            flexGrow: 1,
            width: `calc(100% - ${drawerWidth}px)`,
            height: '100%',
            overflow: 'auto',
            p: 3,
            paddingLeft: 33,
          }}>
          <Outlet />
        </Box>

      </Grid>
    </Box>
  );
};

export default Layout;