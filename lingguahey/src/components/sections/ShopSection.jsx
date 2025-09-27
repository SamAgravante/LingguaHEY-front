// src/components/Pages/sections/ShopSection.jsx
import React from 'react';
import { Grid, Stack, Box, Typography, Button, Divider } from '@mui/material';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png';
import GameShopField from '../../assets/images/backgrounds/GameShopField.png';
import GameShopBoxSmall from '../../assets/images/backgrounds/GameShopBoxSmall.png';
import ItemBox from '../../assets/images/backgrounds/Itembox.png';
import GameTextBox from '../../assets/images/backgrounds/GameTextBox.png';
import HealthPotion from '../../assets/images/objects/HealthPotion.png';
import ShieldPotion from '../../assets/images/objects/ShieldPotion.png';
import SkipPotion from '../../assets/images/objects/SkipPotion.png';
import GoldCoins from '../../assets/images/objects/GoldCoins.png';

export default function ShopSection({
  shopHealthPotion,
  setShopHealthPotion,
  shopShieldPotion,
  setShopShieldPotion,
  shopSkipPotion,
  setShopSkipPotion,
  shopTotal,
  setShopTotal,
  makeMessageAppear,
  setMakeMessageAppear,
  buyPotion,
  handleBackClick,
  renderGemAndCoinsTab
}) {
  return (
    <Grid container direction="column" alignItems="center" >
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
        Leave Shop
      </Button>

      <Box sx={{
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
      }}>
        <Stack direction='column' sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography>Confirm Purchase</Typography>
          <Typography>Health Potion {shopHealthPotion}x</Typography>
          <Typography>Shield Potion {shopShieldPotion}x</Typography>
          <Typography>Skip Potion {shopSkipPotion}x</Typography>
          <Stack direction='row'>
            <Button onClick={() => buyPotion()}>Confirm</Button>
            <Button onClick={() => setMakeMessageAppear(false)}>Cancel</Button>
          </Stack>
        </Stack>
      </Box>

      {renderGemAndCoinsTab()}

      <Box sx={{
        position: 'absolute',
        top: 150,
        right: 150,
        backgroundImage: `url(${GameShopField})`,
        backgroundSize: 'cover',
        width: 538,
        height: 738,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Shop content */}
        <Stack direction={'column'} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 60 }}>
            Potions
          </Typography>
          <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 60 }}>
            For Sale
          </Typography>
          <Divider sx={{ borderBottomWidth: 5, borderColor: '#5D4037', my: 1, width: 400 }} />

          {/* Health Potion Section */}
          <Stack direction="row" spacing={.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>

            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundImage: `url(${GameShopBoxSmall})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 290,
              height: 80,
              justifyContent: 'center',
            }}>
              <img src={HealthPotion} alt="Health Potion" style={{ width: '40px', height: '50px' }} />
              <Stack direction="column" spacing={0} sx={{ alignItems: 'center', justifyContent: 'center', marginLeft: 1 }}>

                <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                  Health Potion
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    100 Gold
                  </Typography>
                  <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                </Stack>
              </Stack>
            </Box>
            <Button variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 10,
              height: 60,
              color: '#5D4037',
            }}
              disabled={shopHealthPotion <= 0}
              onClick={() => { setShopHealthPotion(shopHealthPotion - 1); setShopTotal(shopTotal - 100); }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                -
              </Typography>
            </Button>
            <Box variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 60,
              height: 60,
              color: '#5D4037',
            }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                {shopHealthPotion}
              </Typography>
            </Box>
            <Button variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 10,
              height: 60,
              color: '#5D4037',
            }}
              onClick={() => { setShopHealthPotion(shopHealthPotion + 1); setShopTotal(shopTotal + 100); }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                +
              </Typography>
            </Button>
          </Stack>
          {/* Shield Potion Section */}
          <Stack direction="row" spacing={.5} sx={{ alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundImage: `url(${GameShopBoxSmall})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 290,
              height: 80,
              justifyContent: 'center',
            }}>
              <img src={ShieldPotion} alt="Shield Potion" style={{ width: '40px', height: '50px' }} />
              <Stack direction="column" spacing={0} sx={{ alignItems: 'center', justifyContent: 'center', marginLeft: 1 }}>
                <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                  Shield Potion
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    200 Gold
                  </Typography>
                  <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                </Stack>
              </Stack>

            </Box>
            <Button variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 10,
              height: 60,
              color: '#5D4037',
            }}
              disabled={shopShieldPotion <= 0}
              onClick={() => { setShopShieldPotion(shopShieldPotion - 1); setShopTotal(shopTotal - 200); }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                -
              </Typography>
            </Button>
            <Box variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 60,
              height: 60,
              color: '#5D4037',
            }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                {shopShieldPotion}
              </Typography>
            </Box>
            <Button variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 10,
              height: 60,
              color: '#5D4037',
            }}
              onClick={() => { setShopShieldPotion(shopShieldPotion + 1); setShopTotal(shopTotal + 200); }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                +
              </Typography>
            </Button>
          </Stack>
          {/* Skip Potion Section */}
          <Stack direction="row" spacing={.5} sx={{ alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundImage: `url(${GameShopBoxSmall})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 290,
              height: 80,
              justifyContent: 'center',
            }}>
              <img src={SkipPotion} alt="Skip Potion" style={{ width: '40px', height: '50px' }} />
              <Stack direction="column" spacing={0} sx={{ alignItems: 'center', justifyContent: 'center', marginLeft: 1 }}>
                <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                  Skip Potion
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    300 Gold
                  </Typography>
                  <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                </Stack>
              </Stack>
            </Box>
            <Button variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 10,
              height: 60,
              color: '#5D4037',
            }}
              disabled={shopSkipPotion <= 0}
              onClick={() => { setShopSkipPotion(shopSkipPotion - 1); setShopTotal(shopTotal - 300); }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                -
              </Typography>
            </Button>
            <Box variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 60,
              height: 60,
              color: '#5D4037',
            }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                {shopSkipPotion}
              </Typography>
            </Box>
            <Button variant="contained" sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: 10,
              height: 60,
              color: '#5D4037',
            }}
              onClick={() => { setShopSkipPotion(shopSkipPotion + 1); setShopTotal(shopTotal + 300); }}>
              <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                +
              </Typography>
            </Button>
          </Stack>

          <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', marginTop: 2 }}>
            Total: {shopTotal} Gold
          </Typography>
          <Button
            sx={{
              width: 400,
              height: 80,
              marginTop: 2,
              backgroundImage: `url(${shopTotal === 0 ? GameTextBox : GameTextField})`,
              backgroundSize: 'cover',
            }}
            disabled={shopTotal === 0}
            onClick={() => setMakeMessageAppear(true)}
          >
            <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
              Buy
            </Typography>
          </Button>
        </Stack>
      </Box>
    </Grid>
  );
}
