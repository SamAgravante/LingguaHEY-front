import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Stack, Box } from '@mui/material';
import CommonItem from '../../assets/images/ui-assets/CommonItem.png';
import RareItem from '../../assets/images/ui-assets/RareItem.png';
import MythicalItem from '../../assets/images/ui-assets/MythicalItem.png';
import LegendaryItem from '../../assets/images/ui-assets/LegendaryItem.png';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png';
import GameShopBoxSmall from '../../assets/images/backgrounds/GameShopBoxSmall.png';
import GameShopBoxSmallRed from '../../assets/images/backgrounds/GameShopBoxSmallRed.png';
import SummonAnimation from '../../assets/images/effects/SummonAnimation.png';
import SummonAnimationGIF from '../../assets/images/effects/SummonAnimation.gif';
import GameTextBox from '../../assets/images/backgrounds/GameTextBox.png';
import API from '../../api';

export default function SummonSection({
  handleBackClick,
  renderGemAndCoinsTab,
  userDetails,
  setGems,
  SetInventory,
  inventory,
  gems
}) {
  const [visibilityGacha, setVisibilityGacha] = useState('hidden');
  const [makeMessageAppear, setMakeMessageAppear] = useState(false);
  const [pulledItem, setPulledItem] = useState({});
  const [showItem, setShowItem] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now()); // force replay

  function handleMakeMessageAppear() {
    setMakeMessageAppear(true);
  }

  async function handleSummonClick() {
    try {
      setMakeMessageAppear(false);
      setVisibilityGacha('visible');
      setShowItem(false);
      setAnimationKey(Date.now()); // refresh animation

      const response = await API.post(`/gacha/pull`, {
        userId: userDetails.userId
      });
      setPulledItem(response.data.cosmetic);

      const userResp = await API.get(`/users/${userDetails.userId}`);
      setGems(userResp.data.gems);

      const inventoryResp = await API.get(`/inventory/${userDetails.userId}`);
      SetInventory(inventoryResp.data);

      // Delay showing the item for 5 seconds
      setTimeout(() => {
        setShowItem(true);
      }, 1000);
    } catch (err) {
      console.error('Error during gacha pull:', err);
    }
  }

  function handleConfirmClick() {
    setVisibilityGacha('hidden');
    setShowItem(false);
  }

  const rarityBackgrounds = {
    COMMON: CommonItem,
    RARE: RareItem,
    MYTHICAL: MythicalItem,
    LEGENDARY: LegendaryItem
  };

  return (
    <Grid container direction="column" alignItems="center" sx={{ mt: 2 }}>
      {/* Result Screen */}
      <Box
        sx={{
          visibility: visibilityGacha,
          alignContent: 'center',
          justifyItems: 'center',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          backgroundImage: `url(${SummonAnimation}?t=${animationKey})`,
          backgroundSize: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      >
        {showItem && (
          <>
            <Box sx={{ position: 'absolute', top: 600, left: 550 }}>
              <Typography
                sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 40, color: '#5D4037' }}
              >
                You got a new weapon!
              </Typography>
              <Typography
                sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 30, color: '#5D4037' }}
              >
                {pulledItem.name}
              </Typography>
            </Box>

            <Box
              sx={{
                height: 500,
                width: 500,
                backgroundImage: `url(${rarityBackgrounds[pulledItem.rarity] || CommonItem})`,
                backgroundSize: 'cover',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  height: 250,
                  width: 250,
                  backgroundImage: `url(data:image/png;base64,${pulledItem.cosmeticImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  mb: 2
                }}
              />
            </Box>

            <Button
              sx={{
                width: 200,
                height: 50,
                backgroundImage: `url(${GameTextField})`,
                backgroundSize: 'cover',
                mt: 10
              }}
              onClick={handleConfirmClick}
            >
              <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
                Confirm
              </Typography>
            </Button>
          </>
        )}
      </Box>

      {/* Confirm Summon Modal */}
      <Box
        sx={{
          position: 'absolute',
          backgroundImage: `url(${GameTextBoxMediumLong})`,
          backgroundSize: 'cover',
          width: '51%',
          height: '36%',
          top: '30%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          visibility: makeMessageAppear ? 'visible' : 'hidden',
          zIndex: 1000
        }}
      >
        <Stack direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography
            sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 40, color: '#5D4037' }}
          >
            Confirm Summon
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              sx={{
                backgroundImage: `url(${GameShopBoxSmall})`,
                backgroundSize: 'cover',
                width: '210px',
                height: '60px',
                color: '#5D4037'
              }}
              onClick={handleSummonClick}
            >
              <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
                Confirm
              </Typography>
            </Button>
            <Button
              sx={{
                backgroundImage: `url(${GameShopBoxSmallRed})`,
                backgroundSize: 'cover',
                width: '210px',
                height: '60px',
                color: '#5D4037'
              }}
              onClick={() => setMakeMessageAppear(false)}
            >
              <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
                Cancel
              </Typography>
            </Button>
          </Stack>
        </Stack>
      </Box>

      {renderGemAndCoinsTab()}

      {/* Leave Button */}
      <Button
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          height: 60,
          width: 300,
          backgroundImage: `url(${GameTextField})`,
          backgroundSize: 'cover',
          fontSize: 19
        }}
        onClick={handleBackClick}
      >
        <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
          Leave Summoning Altar
        </Typography>
      </Button>

      {/* Summon Button */}
      <Button
        sx={{
          mt: 2,
          position: 'absolute',
          top: '75%',
          left: '39%',
          backgroundImage: `url(${gems === 0 || 100 > gems ? GameTextBox : GameTextField})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: 400,
          height: 80
        }}
        disabled={gems < 100}
        onClick={handleMakeMessageAppear}
        variant="contained"
      >
        {(gems < 100) && <Stack direction="column" alignItems="center">
          <Typography
            sx={{
              fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037',

            }}
          >
            Summon for 100 Gems
          </Typography>
          <Typography
            sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}
          >
             (You only have {gems} gems)
          </Typography>
        </Stack>}
        {(gems > 100) && <Stack direction="column" alignItems="center">
          <Typography
            sx={{
              fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037',

            }}
          >
            Summon for
          </Typography>
          <Typography
            sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}
          >
            100 Gems
          </Typography>
        </Stack>}

      </Button>
    </Grid>
  );
}
