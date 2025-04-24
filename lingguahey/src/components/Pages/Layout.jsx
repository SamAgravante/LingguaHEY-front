import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemText, Grid, Button, Box } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";

const drawerWidth = 240;

// Pastel palette with full-viewport layout
const pastelBackground = "#FFE0B2";      // warm pastel peach for drawer
//const pageGradient = "linear-gradient(135deg, #FFF3E0 30%, #C8E6C9 90%)"; // gentle yellow to mint
const hoverBg = "rgba(255, 204, 128, 0.4)";
const selectedBg = "#FFCC80";
const textColor = "#5D4037";

const routes = [
  { label: 'Home', path: '/Homepage' },
  { label: 'Settings', path: '/settings' },
  { label: 'Payment Method', path: '/payment' },
  { label: 'Subscriptions', path: '/subscriptions' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Logout', path: '/logout' },
];

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
    headers: { Authorization: `Bearer ${token}` },
  });

  const handleRoute = async (route) => {
    if (route.label === 'Logout') {
      try {
        await API.post('/logout');
        localStorage.removeItem('token');
        navigate('/');
      } catch (err) {
        console.error('Logout failed:', err.response?.data || err.message);
      }
    } else {
      navigate(route.path);
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Grid container sx={{ width: '100%', height: '100%', //background: pageGradient 
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
            {routes.map((route) => (
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
