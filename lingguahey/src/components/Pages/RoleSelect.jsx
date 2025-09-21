import { Grid, Stack, Box, Typography, IconButton,TextField,Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { MusicContext } from "../../contexts/MusicContext";
import { useState, useEffect,useContext } from "react";

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";

export default function RoleSelect() {
  const navigate = useNavigate();
  const background = "linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)";
  const panelBg = "#FFF3E0";
  const optionBg = "#E3F2FD";
  const textColor = "#5D4037";
  const { setIntroMode } = useContext(MusicContext);

  useEffect(() => {
    setIntroMode(true); // Switch to default/background music
  }, []);
const handleSignUp = async (e) => {

  };
  const roles = [
    { label: "Student", value: "USER" },
    { label: "Teacher", value: "TEACHER" }
  ];

  return (
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
            <IconButton onClick={() => navigate("/")}>
            <ArrowBackIcon sx={{ color: textColor }} />
            <Typography
              sx={{ cursor: "pointer", color: textColor }}
              onClick={() => navigate("/")}
            >
              Back
            </Typography>
            </IconButton>
            </Stack>
          
          <Stack spacing={4} sx={{ height: '100%' }} justifyContent="center" alignItems="center">
          <Typography variant="h4" sx={{ color: textColor }}>Select Your Role</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center">
            {roles.map(({ label, value }) => (
              <Box
                key={label}
                onClick={() => navigate('/signup', { state: { role: value } })}
                sx={{
                  backgroundImage: `url(${GameTextFieldBig})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '20vw',
                  height: '47vh',

                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 3,
                  cursor: 'pointer',
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: 4 }
                }}
              >
                <Typography sx={{ color: textColor, fontSize: '1.5rem' }}>{label}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
        </Box>
      </Grid>
  );
}
