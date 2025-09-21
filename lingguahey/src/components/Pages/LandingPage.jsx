import React, { useEffect, useContext } from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import bunnyWave from '../../assets/images/characters/lingguahey-char1-wave.png';
import { MusicContext } from "../../contexts/MusicContext";
import LandingBackgroundPic from '../../assets/images/backgrounds/CrystalOnly.png';
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';

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
            }}>
          
            
          <Typography variant="h4" pt={2} color={textColor} sx={{ fontWeight: 'bold', height: 264,fontFamily: 'RetroGaming' }}>
            LingguaHEY
          </Typography>
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
            }}
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>

          <Typography
            align="center"
            sx={{ color: primaryBtn, cursor: 'pointer' }}
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
