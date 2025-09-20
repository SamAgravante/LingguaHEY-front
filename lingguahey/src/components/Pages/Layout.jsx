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
import { useScore } from "../../contexts/ScoreContext";
import { getUserFromToken } from "../../utils/auth";

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";

import GameTextBoxBigVert from "../../assets/images/backgrounds/GameTextBoxBigVert.png";
import GameTextBoxBig from "../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";
import ForestwithShops from "../../assets/images/backgrounds/ForestwithShops.png";
import ShopUI from "../../assets/images/backgrounds/ShopUI.png";
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import SummonUI from "../../assets/images/backgrounds/SummonUI.png";
import DungeonOpen from "../../assets/images/backgrounds/DungeonOpen.png";
import DungeonClosed from "../../assets/images/backgrounds/DungeonClosed.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Tablet from "../../assets/images/objects/Tablet.png";
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import Gems from "../../assets/images/objects/Gems.png";
import Gears from "../../assets/images/objects/gears.png";
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import MenuBoxVertLong from '../../assets/images/backgrounds/MenuBox1varVertLong.png';
import MCNoWeapon from '../../assets/images/characters/MCNoWeapon.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';


const drawerWidth = 240;
const pastelBackground = "#FFE0B2";
const hoverBg = "rgba(255, 204, 128, 0.4)";
const selectedBg = "#FFCC80";
const textColor = "#5D4037";


const allRoutes = [
  //{ label: "Home", path: "/homepage", roles: ["USER", "ADMIN", "TEACHER"] },
  //{ label: "Profile", path: "/profilepage", roles: ["USER", "ADMIN", "TEACHER"] },
  { label: "Admin DB", path: "/admindashboard", roles: ["ADMIN"] },
  { label: "Teacher DB", path: "/teacherdashboard", roles: ["TEACHER"] },
  { label: "Subscriptions", path: "/subscriptions", roles: ["TEACHER"] },
  { label: "Contact Us", path: "/contact", roles: ["USER", "TEACHER"] },
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
  const { refreshTrigger } = useScore();

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
    const fetchPoints = async () => {
      if (!userData.userId || !token) return;

      try {
        const { data } = await API.get(`/scores/users/${userData.userId}/total`);
        setTotalPoints(data);
      } catch (err) {
        console.error("Failed to fetch user points:", err);
      }
    };

    fetchPoints();
  }, [userData.userId, token, refreshTrigger]);

  const handleRoute = async (route) => {
    if (route.label === "Logout") {
      try {
        await API.post("/auth/logout");   // → SpringSecurity’s logoutUrl
      } catch (err) {
        console.error("Server logout failed:", err);
      }
      logout();                                      // clear client token
      navigate("/");                      // match your landing route
    } else {
      navigate(route.path);
    }
  };

  const filteredRoutes = allRoutes.filter((r) => r.roles.includes(userData.role));

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Grid container sx={{ width: "100%", height: "100%", backgroundColor: "#00092d" }}>
        {userData.role !== "USER" && (
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
                backgroundImage: `url(${GameTextBoxBigVert})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "transparent",
                padding:4
              },
            }}
          >
            <Typography variant="h6" align="center" sx={{ color: textColor, padding: 2 }}>
              {userData.firstName} {userData.middleName ? userData.middleName.charAt(0) + "." : ""}{" "}
              {userData.lastName}
            </Typography>

            {userData.role !== "TEACHER" && (
              <Typography variant="h7" align="center" sx={{ color: textColor, padding: 2 }}>
                {totalPoints} Total Points
              </Typography>
            )}
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
                View Profile
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
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: userData.role === "STUDENT" ? "100%" : `calc(100% - ${drawerWidth}px)`,
            height: "100%",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Grid>
    </Box>
  );
};

export default Layout;