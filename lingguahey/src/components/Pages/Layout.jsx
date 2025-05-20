import React, { useState, useEffect, useContext } from "react";
import {
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Grid,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../api";
import { jwtDecode } from "jwt-decode";
import { MusicContext } from "../../contexts/MusicContext";
import { getUserFromToken } from "../../utils/auth";

const drawerWidth = 240;
const pastelBackground = "#FFE0B2";
const hoverBg = "rgba(255, 204, 128, 0.4)";
const selectedBg = "#FFCC80";
const textColor = "#5D4037";

const allRoutes = [
  { label: "Home", path: "/homepage", roles: ["USER", "ADMIN", "TEACHER"] },
  { label: "Profile", path: "/profilepage", roles: ["USER", "ADMIN", "TEACHER"] },
  { label: "Subscriptions", path: "/subscriptions", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Contact Us", path: "/contact", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Admin DB", path: "/admindashboard", roles: ["ADMIN"] },
  { label: "Teacher DB", path: "/teacherdashboard", roles: ["TEACHER", "ADMIN"] },
  //{ label: "Logout", path: "/logout", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Logout", path: "/landingpage", roles: ["USER", "TEACHER", "ADMIN"] },
];

const Layout = () => {
  const { token, setToken, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null,
  });
  const [totalPoints, setTotalPoints] = useState(0);

  const { setIntroMode } = useContext(MusicContext);

  useEffect(() => {
    setIntroMode(false); // Switch to default/background music
  }, []);

  // Fetch user info and points whenever token changes
  useEffect(() => {
    if (!token) return;

    const userObj = getUserFromToken();
    const userId = userObj?.userId || userObj?.id;
    if (!userId) return;

    const loadUser = async () => {
      try {
        const userRes = await API.get(`/users/${userId}`);
        setUserData(userRes.data);

        const ptsRes = await API.get(`/scores/users/${userId}/total`);
        setTotalPoints(ptsRes.data);

        // role-based redirect on initial login
        if (location.pathname === "/") {
          if (userRes.data.role === "USER") navigate("/homepage");
          if (userRes.data.role === "TEACHER") navigate("/teacherdashboard");
          if (userRes.data.role === "ADMIN") navigate("/admindashboard");
        }
      } catch (err) {
        console.error("Failed to fetch user or points:", err);
      }
    };

    loadUser();
  }, [token, navigate, location.pathname]);

  // Poll for updated points
  useEffect(() => {
    if (!userData.userId || !token) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await API.get(`/scores/users/${userData.userId}/total`);
        setTotalPoints(data);
      } catch (err) {
        console.error("Failed to fetch user points:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [userData.userId, token]);

  const handleRoute = (route) => {
    if (route.label === "Logout") {
      logout();
      navigate("/");
    } else {
      navigate(route.path);
    }
  };

  const filteredRoutes = allRoutes.filter((r) => r.roles.includes(userData.role));

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Grid container sx={{ width: "100%", height: "100%", backgroundColor: "#C8E6C9" }}>
        <Drawer
          variant="permanent"
          anchor="left"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              height: "100%",
              boxSizing: "border-box",
              bgcolor: pastelBackground,
              borderRight: "1px solid #FFB74D",
            },
          }}
        >
          <Typography variant="h6" align="center" sx={{ color: textColor, padding: 2 }}>
            {userData.firstName} {userData.middleName ? userData.middleName.charAt(0) + "." : ""}{" "}
            {userData.lastName}
          </Typography>

          <Typography variant="h7" align="center" sx={{ color: textColor, padding: 2 }}>
            {totalPoints} Total Points
          </Typography>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/profilepage")}
              sx={{
                backgroundColor: "#AED581",
                color: textColor,
                "&:hover": { backgroundColor: "#C5E1A5" },
                textTransform: "none",
              }}
            >
              Edit Profile
            </Button>
          </Box>
          <List sx={{ height: "calc(100% - 112px)", overflowY: "auto" }}>
            {filteredRoutes.map((route) => (
              <ListItem key={route.label} disablePadding>
                <ListItemButton
                  onClick={() => handleRoute(route)}
                  selected={window.location.pathname === route.path}
                  sx={{
                    color: textColor,
                    "&:hover": { backgroundColor: hoverBg },
                    "&.Mui-selected": { backgroundColor: selectedBg, fontWeight: "bold" },
                  }}
                >
                  <ListItemText primary={route.label} primaryTypographyProps={{ fontSize: "1rem" }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: `calc(100% - ${drawerWidth}px)`,
            height: "100%",
            overflow: "auto",
            p: 3,
            paddingLeft: 33,
          }}
        >
          <Outlet />
        </Box>
      </Grid>
    </Box>
  );
};

export default Layout;