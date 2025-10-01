import React, { useEffect, useContext } from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import bunnyWave from '../../assets/images/characters/lingguahey-char1-wave.png';
import { MusicContext } from "../../contexts/MusicContext";
import LandingBackgroundPic from '../../assets/images/backgrounds/CrystalOnly.png';
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import TitleCard from '../../assets/images/backgrounds/TitleCard.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const primaryBtn = "#FFCC80";
  const textColor = "#5D4037";

  const { musicOn, toggleMusic, setIntroMode } = useContext(MusicContext);

  useEffect(() => {
    setIntroMode(true);
    return () => setIntroMode(false);
  }, [setIntroMode]);

  return (
    <>
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

      >
        <Stack 
          direction="column" 
          alignItems="center" 
          sx={{ 
            mt: 8,
            backgroundImage: `url(${MenuBoxVert})`, 
            backgroundSize: 'contain', 
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: 550, 
            height: 700,
            //border: '4px solid #FFF3E0',
            pt: 5,
            justifyContent:"center",
            alignItems:"center"
            }}>
          
            
          <Box  sx={{
            backgroundImage: `url(${TitleCard})`, 
            backgroundSize: 'contain', 
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            height: 120,
            width:300,
            //border:"solid",
            ml:2
            }}>
          </Box>
          <Typography variant="subtitle1" pb={3} color={textColor}>
            A Filipino Language Learning App
          </Typography>

          <Button
            variant="contained"
            sx={{
              minWidth: 250,
              borderRadius: 2,
              bgcolor: primaryBtn,
              color: textColor,
              textTransform: 'none',
              mb: 2,
              mt:20
            }}
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>

          <Typography
            align="center"
            sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 15, color: '#5D4037', cursor: 'pointer' }}
            onClick={() => navigate('/roleselect')}
          >
            No Account? Register Now!
          </Typography>
        </Stack>
      </Grid>

      <button
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: primaryBtn,
          color: textColor,
          border: 'none',
          borderRadius: 8,
          padding: '0.6em 1.2em',
          fontSize: '1em',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        onClick={toggleMusic}
      >
        {musicOn ? '🎵 Mute Music' : '🔇 Play Music'}
    
      </button>
    </>
  );
}
