import React, { useState } from 'react';
import { Grid, Typography, Button, Stack, Box } from '@mui/material';
import CommonItem from '../../assets/images/ui-assets/CommonItem.png';
import RareItem from '../../assets/images/ui-assets/RareItem.png';
import MythicalItem from '../../assets/images/ui-assets/MythicalItem.png';
import LegendaryItem from '../../assets/images/ui-assets/LegendaryItem.png';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png';
import GameShopField from '../../assets/images/backgrounds/GameShopField.png';
import GameShopBoxSmall from '../../assets/images/backgrounds/GameShopBoxSmall.png';
import ItemBox from '../../assets/images/backgrounds/Itembox.png';
import GameTextBox from '../../assets/images/backgrounds/GameTextBox.png';
import API from '../../api';

export default function SummonSection({
  handleBackClick,
  renderGemAndCoinsTab,
  userDetails,
  setGems,
  SetInventory,
  inventory
}) {

  const [visibilityGacha, setVisibilityGacha] = useState('hidden');
  const [makeMessageAppear, setMakeMessageAppear] = useState(false);
  const [pulledItem, setPulledItem] = useState({});
  function handleMakeMessageAppear() {
    setMakeMessageAppear(true);
  }

  async function handleSummonClick() {
    try {
      setMakeMessageAppear(false);
      const response = await API.post(`/gacha/pull`, {
        userId: userDetails.userId
      });
      setPulledItem(response.data.cosmetic); // store cosmetic details directly
      console.log('Gacha pull response:', response);

      // Minus gem cost
      const userResp = await API.get(`/users/${userDetails.userId}`);
      setGems(userResp.data.gems);

      const inventoryResp = await API.get(`/inventory/${userDetails.userId}`);
      SetInventory(inventoryResp.data);
      console.log("Inventory contains:" + inventoryResp.data);
    } catch (err) {
      console.error('Error during gacha pull:', err);
    }
    setVisibilityGacha('visible');
  }

  function handleConfirmClick() {
    setVisibilityGacha('hidden');
    //setPulledItem(null);
  }

  // Map rarity to background image
  const rarityBackgrounds = {
    COMMON: CommonItem,
    RARE: RareItem,
    MYTHICAL: MythicalItem,
    LEGENDARY: LegendaryItem
  };

  return (
    <Grid container direction="column" alignItems="center" sx={{ mt: 2 }}>
      <Box
        sx={{
          visibility: visibilityGacha,
          alignContent: 'center',
          justifyItems: 'center',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          mb: 2,
          backgroundColor: '#FFF3E0',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      >
        <Box sx={{ position: 'absolute', top: 600, left: 550, color: "#5D4037" }}>
          <Typography variant='h1' sx={{ color: "#5D4037" }}>
            You got a new weapon!
          </Typography>
          <Typography variant='h1' sx={{ color: "#5D4037" }}>
            {pulledItem.name}
          </Typography>
        </Box>

        {/* Item Rarity Indicator */}
        {pulledItem && (
          <Box
            sx={{
              //borderStyle: 'solid',
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
            {/* Cosmetic Image */}
            <Box
              sx={{
                //borderStyle: 'solid',
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
        )}

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
          Confirm
        </Button>
      </Box>

      {/* Purchase confirm modal */}
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
        <Stack
          direction="column"
          sx={{
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography>Confirm Purchase</Typography>
          <Stack direction='row' spacing={2}>
            <Button
              sx={{
                backgroundImage: `url(${GameShopBoxSmall})`,
                backgroundSize: 'cover',
                width: '210px',
                height: '60px',
                top: 20,
                color: '#5D4037'
              }}
              onClick={() => handleSummonClick()}
            >
              <Typography sx={{ fontFamily: 'RetroGaming' }}>Confirm</Typography>
            </Button>
            <Button
              sx={{
                backgroundImage: `url(${GameShopBoxSmall})`,
                backgroundSize: 'cover',
                width: '210px',
                height: '60px',
                top: 20,
                color: '#5D4037'
              }}
              onClick={() => {
                setMakeMessageAppear(false);
              }}
            >
              <Typography sx={{ fontFamily: 'RetroGaming' }}>Cancel</Typography>
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
        Leave Summoning Altar
      </Button>

      {/* Summon Button */}
      <Button
        sx={{
          mt: 2,
          position: 'absolute',
          top: '75%',
          left: '39%',
          backgroundImage: `url(${GameTextField})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: 400,
          height: 80
        }}
        onClick={handleMakeMessageAppear}
        variant="contained"
      >
        <Stack direction="column" alignItems="center">
          <Typography
            variant="h6"
            color="#5D4037"
            sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}
          >
            Summon for
          </Typography>
          <Typography
            variant="h6"
            color="#5D4037"
            sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}
          >
            100 Gems
          </Typography>
        </Stack>
      </Button>
    </Grid>
  );
}
