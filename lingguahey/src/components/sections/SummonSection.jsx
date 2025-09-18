import React from 'react';
import { Grid, Typography, Button, Stack, Box } from '@mui/material';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';

export default function SummonSection({
  handleBackClick,
  renderGemAndCoinsTab
}) {
  return (
    <Grid container direction="column" alignItems="center" sx={{ mt: 2 }}>
        {/* A light overlay to dim the background. DONT UNCOMMENT YOU WILL SEE HEAVEN
        <Box sx={{ width: '100%', height:'100%', textAlign: 'center', mb: 2, backgroundColor: '#FFF3E0', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        </Box>
        */}
      {renderGemAndCoinsTab()}
      <Button 
        sx={{ 
          position: 'absolute', 
          bottom: 20, 
          right: 20,
          backgroundImage: `url(${GameTextField})`,
          backgroundSize: 'cover'
        }} 
        onClick={handleBackClick}
      >
        Leave Summoning Altar
      </Button>
      <Button sx={{
        mt: 2,
        position: 'absolute',
        top: '75%',
        left: '39%',
        backgroundImage: `url(${GameTextField})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: 400,
        height: 80,
      }} variant="contained">
        <Stack direction="column" alignItems="center">
          <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
            Summon for
          </Typography>
          <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
            100 Gems
          </Typography>
        </Stack>
      </Button>
    </Grid>
  );
}