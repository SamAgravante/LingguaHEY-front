import React, { useEffect, useContext } from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import bunnyWave from '../../assets/images/characters/lingguahey-char1-wave.png';
import { MusicContext } from "../../contexts/MusicContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const primaryBtn = "#FFCC80";
  const textColor = "#5D4037";

  const { musicOn, toggleMusic, setIntroMode } = useContext(MusicContext);

  useEffect(() => {
    // Start intro music when component mounts
    setIntroMode(true);
    // Cleanup: revert to default background music on unmount
    return () => setIntroMode(false);
  }, [setIntroMode]);

  return (
    <>
        <Grid
            container
            sx={{
                background: 'linear-gradient(135deg,#FFECB3 30%,#E1F5FE 90%)',
                minHeight: '100vh',
                minWidth: '100vw',
                display: 'flex',
                justifyContent: 'center',
                //alignItems: 'center',
            }}
        >
            <Stack direction="column" alignItems="center" >
                <Box
                    sx={{
                        backgroundColor: '#D2E0D3',
                        minHeight: '60vh',
                        minWidth: '20vw',
                        borderBottomLeftRadius: '50px',
                        borderBottomRightRadius: '50px',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                <img src={bunnyWave} alt="Bunny Wave" style={{ width: 340, height: 450, paddingTop:50 }} />
                </Box>
                <Typography variant="h4" paddingTop={2} color="#5D4037">
                    LinnguaHey
                </Typography>
                <Typography variant="h10" paddingBottom={3} color="#5D4037">
                    A Filipino Language Learning App
                </Typography>
                <Button 
                    variant="contained"
                    color="primary"
                    sx={{minWidth:"250px", borderRadius:"20px",backgroundColor: primaryBtn, color: textColor, textTransform: 'none'}}
                    onClick={()=>navigate("/login")}>
                        Get Started
                </Button>

                <Typography
                    align="center"
                    sx={{ color: '#FFCC80', cursor: 'pointer', mt: 1 }}
                    onClick={() => navigate('/roleselect')}
                >
                    No Account? Register Now!
                </Typography>
                    </Stack>
      </Grid>

      {/* Music toggle button matching Homepage style */}
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
        {musicOn ? '🎵 Mute Music' : '🔇 Play Music'}
      </button>
    </>
  );
}
