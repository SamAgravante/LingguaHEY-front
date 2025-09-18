import React from 'react';
import { Grid, Typography, Button, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import Tablet from '../../assets/images/objects/Tablet.png';

export default function DungeonSection({ 
  closeModal, 
  currentLevel, 
  currentLevelIndex,
  setCurrentLevelIndex,
  levelDetails,
  dungeonPreperatory,
  setDungeonPreparatory,
  user
}) {
  const navigate = useNavigate();

  return (
    <Grid container direction="column" alignItems="center" sx={{ width: '100%', height: '100%' }}>
      <Typography variant="h4" align="center" sx={{ paddingTop: 2, paddingBottom: 2 }}>
        asda
      </Typography>
      <Button
        onClick={closeModal}
        sx={{
          backgroundImage: `url(${GameTextField})`,
          backgroundSize: 'cover',
          width: '200px',
          height: '60px',
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#5D4037'
        }}
      >
        <Typography sx={{ fontFamily: 'RetroGaming' }}>
          Return to Town
        </Typography>
      </Button>
      <Button
        onClick={() => {
          setDungeonPreparatory(true);
        }}
        sx={{
          width: '250px',
          height: '200px',
          borderRadius: '16px',
          opacity: 0.9,
          position: 'absolute',
          top: '50%',
          '&:hover': {
            transform: 'scale(1.1)',
            opacity: 1
          }
        }}
      />
      <Box sx={{
        position: 'absolute',
        backgroundImage: `url(${Tablet})`,
        backgroundSize: 'cover',
        width: '50%',
        height: '65%',
        top: '18%',
        visibility: dungeonPreperatory ? 'visible' : 'hidden',
        zIndex: 1000
      }}>
        <Grid container direction="column" alignItems="center" sx={{ p: 4 }}>
          <Button 
            sx={{ color: '#3361AB', alignSelf: 'flex-end', mb: 2, fontSize: 30 }} 
            onClick={() => setDungeonPreparatory(false)}
          >
            X
          </Button>
          <Button 
            sx={{
              mb: 2,
              backgroundImage: `url(${GameTextField})`,
              backgroundSize: 'cover',
              width: '300px',
              height: '60px',
              color: '#3361AB'
            }} 
            onClick={() => navigate('/dungeon', {
              state: {
                levelId: currentLevel?.levelId,
                userId: user?.userId,
              }
            })}
          >
            Enter Dungeon
          </Button>
        </Grid>
      </Box>

      <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Button
          onClick={() => setCurrentLevelIndex(prev => Math.max(0, prev - 1))}
          disabled={currentLevelIndex === 0}
          sx={{
            width: '60px',
            height: '60px',
            color: '#3361AB',
            '&.Mui-disabled': { opacity: 0.5 }
          }}
        >
          <Typography sx={{ fontFamily: 'RetroGaming', fontSize: '2rem' }}>←</Typography>
        </Button>

        <Typography variant="h5" color="#3361AB" sx={{ fontFamily: 'RetroGaming', minWidth: '200px', textAlign: 'center' }}>
          Level {currentLevel?.levelId}
        </Typography>

        <Button
          onClick={() => setCurrentLevelIndex(prev => Math.min(levelDetails.length - 1, prev + 1))}
          disabled={currentLevelIndex === levelDetails.length - 1}
          sx={{
            width: '60px',
            height: '60px',
            color: '#3361AB',
            '&.Mui-disabled': { opacity: 0.5 }
          }}
        >
          <Typography sx={{ fontFamily: 'RetroGaming', fontSize: '2rem' }}>→</Typography>
        </Button>
      </Stack>
    </Grid>
  );
}