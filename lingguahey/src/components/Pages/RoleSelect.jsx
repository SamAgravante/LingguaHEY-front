import { Grid, Stack, Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { MusicContext } from "../../contexts/MusicContext";
import { useState, useEffect,useContext } from "react";

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

  const roles = [
    { label: "Student", value: "USER" },
    { label: "Teacher", value: "TEACHER" }
  ];

  return (
    <Grid container sx={{ width: '100vw', height: '100vh', background, p: 0, justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '60%', height: '70%', backgroundColor: panelBg, p: 4 }}>
        <Box sx={{top: 16, left: 16 }}>
          <IconButton onClick={()=>navigate('/')}><ArrowBackIcon sx={{ color:textColor }}/>
          <Typography sx={{ cursor:'pointer', color: textColor }} onClick={()=>navigate('/')}>Back</Typography>
          </IconButton>
        </Box>
        <Stack spacing={4} sx={{ height: '100%' }} justifyContent="center" alignItems="center">
          <Typography variant="h4" sx={{ color: textColor }}>Select Your Role</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center">
            {roles.map(({ label, value }) => (
              <Box
                key={label}
                onClick={() => navigate('/signup', { state: { role: value } })}
                sx={{
                  backgroundColor: optionBg,
                  minHeight: '50vh',
                  minWidth: '20vw',
                  maxHeight: '20vh',
                  maxWidth: '50vw',
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
