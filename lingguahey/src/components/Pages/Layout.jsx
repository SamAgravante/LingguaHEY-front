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
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const drawerWidth = 240;

const pastelBackground = "#FFE0B2";
const hoverBg = "rgba(255, 204, 128, 0.4)";
const selectedBg = "#FFCC80";
const textColor = "#5D4037";

const allRoutes = [
  { label: "Home", path: "/Homepage", roles: ["USER", "ADMIN", "TEACHER"] },
  { label: "admindb", path: "/admindashboard", roles: ["ADMIN"] },
  { label: "teacherdb", path: "/teacherdashboard", roles: ["TEACHER", "ADMIN"] },
  { label: "Subscriptions", path: "/subscriptions", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Contact Us", path: "/contact", roles: ["USER", "TEACHER", "ADMIN"] },
  { label: "Logout", path: "/logout", roles: ["USER", "TEACHER", "ADMIN"] },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null,
  });
  const [totalPoints, setTotalPoints] = useState(0);

  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        const fetchUserAndPoints = async () => {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users/${decoded.userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const user = response.data;

            setUserData({
              userId: user.userId,
              firstName: user.firstName,
              middleName: user.middleName || "",
              lastName: user.lastName || "",
              role: user.role,
            });

            // Immediately fetch points after getting user
            const pointsRes = await API.get(`scores/users/${user.userId}/total`);
            setTotalPoints(pointsRes.data);

            // Redirect based on role after fetching user data
            if (user.role === "USER" && location.pathname === "/") {
              navigate("/Homepage");
            } else if (user.role === "TEACHER" && location.pathname === "/") {
              navigate("/teacherdashboard");
            } else if (user.role === "ADMIN" && location.pathname === "/") {
              navigate("/admindashboard");
            }
          } catch (err) {
            console.error("Failed to fetch user or points:", err);
          }
        };

        fetchUserAndPoints();
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, [token, navigate, location.pathname]);

  useEffect(() => {
    if (!userData.userId) return;

    const fetchTotal = async () => {
      try {
        const { data } = await API.get(`scores/users/${userData.userId}/total`);
        setTotalPoints(data);
      } catch (err) {
        console.error("Failed to fetch user points:", err);
      }
    };

    const interval = setInterval(fetchTotal, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [userData.userId]);

  const handleRoute = async (route) => {
    const authAPI = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/auth`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (route.label === "Logout") {
      try {
        await authAPI.post("/logout");
        localStorage.removeItem("token");
        setToken(null);
        navigate("/");
      } catch (err) {
        console.error("Logout failed:", err.response?.data || err.message);
      }
    } else {
      navigate(route.path);
    }
  };

  const filteredRoutes = allRoutes.filter((route) =>
    route.roles ? route.roles.includes(userData.role) : true
  );

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