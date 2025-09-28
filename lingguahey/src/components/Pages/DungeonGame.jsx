import React, { useState, useEffect, useContext } from 'react';
import { motion } from "framer-motion";

import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack
} from '@mui/material';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';
import API from '../../api';
import { MusicContext } from '../../contexts/MusicContext';
import { useLocation, useNavigate } from 'react-router-dom';

// Background image for the game area
import DungeonRoom from '../../assets/images/backgrounds/DungeonRoom.png';
import DungeonBar from '../../assets/images/backgrounds/DungeonBar.png';
import DungeonHint from '../../assets/images/backgrounds/DungeonHint.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'

import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import HeartFilled from "../../assets/images/objects/HeartFilled.png";
import HeartNotFilled from "../../assets/images/objects/HeartNotFilled.png";
import HeartShield from "../../assets/images/objects/HeartShield.png";
import CastButton from '../../assets/images/ui-assets/CastButton.png';
import MCNoWeapon from '../../assets/images/characters/MCNoWeapon.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';
import Laser from '../../assets/images/effects/Laser.png';
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Gems from "../../assets/images/objects/Gems.png";

import BossAura from "../../assets/images/effects/BossAura.gif";
import LaserFail from "../../assets/images/effects/LaserFail.gif";
import LaserSuccess from "../../assets/images/effects/LaserSuccess.gif";
import Shield from "../../assets/images/effects/Shield.png";
import ShieldEnemy from "../../assets/images/effects/ShieldEnemy.png";
import MCNoWeaponHit from '../../assets/images/characters/MCNoWeaponHit.png';

// Fisher–Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DungeonGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState({});
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [currentMonster, setCurrentMonster] = useState({});
  const [hp, setHp] = useState();
  const [userDetails, setUserDetails] = useState({});
  const [roundCounter, setRoundCounter] = useState();
  const [makeMessageAppear, setMakeMessageAppear] = useState(false);
  const [messageDetails, setMessageDetails] = useState({});
  const [coinReward, setCoinReward] = useState(0);
  const [gemReward, setGemReward] = useState(0);
  const [itemEquipped, setItemEquipped] = useState({});
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);

  const hints = [
    'Read the Codex to learn about the monsters',
    'Use your potions wisely',
    'You buy potions in the shop'
  ];
  const [isGameOver, setIsGameOver] = useState(false);

  //Uppercase letters
  const uppercaseLetters = currentMonster.jumbledLetters?.map(l => l.toUpperCase()) || [];

  const [currentPotion, setCurrentPotion] = useState();
  const [showLaser, setShowLaser] = useState(false);

  const [shieldActive, setShieldActive] = useState(false);
  const [laserEffect, setLaserEffect] = useState(null);
  const [enemyDefeated, setEnemyDefeated] = useState(false);


  const getMonster = async () => {
    try {
      const response = await API.get(`/game/current-monster`);
      setCurrentMonster(response.data);
    } catch (error) {
      console.error("Failed to fetch monster:", error);
    }
  };

  useEffect(() => {
    if (!location.state || !location.state.levelId) {
      console.error('No level ID provided in navigation state');
      navigate('/homepage');
      return;
    }

    const fetchGameInfo = async () => {
      try {
        const { levelId, userId } = location.state;
        const lvl = await API.get(`/levels/${levelId}`);
        // Fix: Set levelData as an object with the rewards
        setLevelData({
          coinsReward: lvl.data.coinsReward,
          gemsReward: lvl.data.gemsReward
        });
        setCoinReward(lvl.data.coinsReward);
        setGemReward(lvl.data.gemsReward);

        const equipResp = await API.get(`/users/${userId}/equipped-cosmetic`);
        // API shape: { equippedCosmetic: { cosmeticId, name, rarity, cosmeticImage } }
        setItemEquipped(equipResp.data?.equippedCosmetic || {});
        console.log("Equipped Item:", equipResp.data);

        const userResp = await API.get(`/users/${userId}`);
        setUserDetails(userResp.data);
        const gameInfo = await API.post(`/game/start`, { levelId, userId });
        setHp(gameInfo.data.lives);
        const monster = await API.get(`/game/current-monster`);
        setCurrentMonster(monster.data);
        setRoundCounter(1);
      } catch (error) {
        console.error('Error starting game:', error);
      }
    };
    fetchGameInfo();
  }, [location.state, navigate]);

  const { setLevelClearMode } = useContext(MusicContext);

  // Handle selection from bottom bar
  const handleTileClick = (letter, index) => {
    if (!selectedTiles.find((t) => t.index === index)) {
      setSelectedTiles((prev) => [...prev, { label: letter, index }]);
    }
  };

  // Handle removal from selected area
  const handleSelectedTileClick = (tileToRemove) => {
    setSelectedTiles((prev) => prev.filter((tile) => tile.index !== tileToRemove.index));
  };

  const handleSubmitAnswer = async () => {
    const guessedName = selectedTiles.map(tile => tile.label).join('');

    try {
      const userAnswer = await API.post(`/game/guess`, { guessedName });
      console.log('Answer response:', userAnswer.data);
      setSelectedTiles([]);

      if (!userAnswer.data.correct) {
        // Wrong answer -> play fail laser
        setLaserEffect("fail");

        setHp(userAnswer.data.lives);

        if (userAnswer.data.gameOver) {
          setIsGameOver(true);
          setMakeMessageAppear(true);
          setMessageDetails({
            mainMessage: 'Level Failed',
            subMessage: 'Hint:'
          });
        }

        // Enemy counterattack sequence
        setTimeout(() => {
          setLaserEffect(null);
          setEnemyAttacking(true);

          // Show impact or consume shield after enemy reaches player (mga 0.8s)
          setTimeout(() => {
            if (shieldActive) {
              // Shield absorbs this enemy attack, then disappears
              setShieldActive(false);
            } else {
              // No shield active → take damage animation
              setImpactVisible(true);
              setTimeout(() => setImpactVisible(false), 500);
            }
          }, 800);

          // Return enemy back
          setTimeout(() => {
            setEnemyAttacking(false);
          }, 2000);
        }, 1000);
      }

      else {
        // Correct answer -> play success laser
        setLaserEffect("success");

        setTimeout(() => {
          if (userAnswer.data.gameOver) {
            setIsGameOver(true);
            setMakeMessageAppear(true);
            setMessageDetails({
              mainMessage: 'Level Cleared',
              subMessage: `Rewards: `
            });
            setLaserEffect(null);
          } else {
            // Trigger enemy stagger and fade sequence
            setEnemyDefeated(true);

            // load next monster
            setTimeout(() => {
              setEnemyDefeated(false);
              getMonster();
              setRoundCounter(prev => prev + 1);
            }, 1200);

            setLaserEffect(null);
          }
        }, 800);
      }

    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };



  function confirmPotion(potionType) {
    setMakeMessageAppear(true);
    if (potionType === 'HEALTH') {
      setMessageDetails({
        mainMessage: 'Drink Health Potion?',
        subMessage: 'This will increase your lifepoints by 1'
      });
      setCurrentPotion(potionType);
    }
    if (potionType === 'SHIELD') {
      setMessageDetails({
        mainMessage: 'Use Shield Potion?',
        subMessage: 'This will protect you from the next attack'
      });
      setCurrentPotion(potionType);
    }
    if (potionType === 'SKIP') {
      setMessageDetails({
        mainMessage: 'Use Skip Potion?',
        subMessage: 'This will skip the current monster'
      });
      setCurrentPotion(potionType);
    }
  }

  //Function to drink potion
  const usePotion = async (potionType) => {
    try {
      const resp = await API.post(`/game/use-potion`, {
        userId: userDetails.userId,
        potionType
      });
      console.log('Potion used:', resp.data);
      setHp(resp.data.updatedLives);
      setMakeMessageAppear(false);
      if (potionType === 'SKIP') {
        getMonster();
        setRoundCounter(prev => prev + 1);
      }
      if (potionType === 'SHIELD') {
        setShieldActive(true);
        // setTimeout(() => setShieldActive(false), 5000); 
      }
      setCurrentPotion(null);
    } catch (err) {
      console.error("Failed to use potion:", err);
    }
  };

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      sx={{
        backgroundImage: `url(${DungeonRoom})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '56.25vw',
        maxHeight: '100vh',
        maxWidth: '177.78vh',
        margin: 'auto',
        position: 'relative',
        overflow: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Player Tab */}
      <Box sx={{
        position: 'absolute', top: 16, left: 16,
        backgroundImage: `url(${NameTab})`,
        backgroundSize: 'cover',
        width: 730,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 2
      }}>
        <img src={MCHeadshot} alt="Player" style={{ width: 100, height: 100, marginLeft: 10 }} />
        <Stack direction={'column'}>
          <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 5 }}>
            {userDetails.firstName || 'Player Name'}
          </Typography>
          <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 5 }}>
            Rank: Mage
          </Typography>
        </Stack>
        {[0, 1, 2, 3].map(i => (
          <Box
            key={i}
            sx={{
              width: 48, height: 43,
              //border: '2px solid red',
              backgroundImage: `url(${shieldActive
                ? (hp > i ? HeartShield : HeartNotFilled)
                : (hp > i ? HeartFilled : HeartNotFilled)
                })`,
              backgroundSize: 'cover',
              marginLeft: i === 0 ? 10 : 2
            }}
          />
        ))}
      </Box>

      {/* Round Counter */}
      <Stack
        direction="column"
        spacing={1}
        sx={{
          position: 'absolute',
          top: 16,
          alignItems: 'center'
        }}
      >
        <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', WebkitTextStroke: '2px #180f0c', }}>
          Round
        </Typography>
        <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', WebkitTextStroke: '2px #180f0c' }}>
          {roundCounter}
        </Typography>
      </Stack>

      {/* Enemy Tab */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundImage: `url(${NameTab})`,
          backgroundSize: 'cover',
          width: 730,
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: 2,
        }}
      >
        <Stack direction="column" sx={{ alignItems: 'flex-end', mr: 2 }}>
          <Typography
            variant="h2"
            color="#5D4037"
            sx={{
              fontWeight: 'bold',
              fontFamily: 'RetroGaming',
            }}
          >
            {currentMonster.englishName}
          </Typography>
        </Stack>

        <Box
          component="img"
          src={`data:image/png;base64,${currentMonster.imageData}`}
          alt="Enemy"
          sx={{ width: 120, height: 110, marginRight: 2 }}
        />
      </Box>


      {/* Cast Button */}
      <Button
        sx={{
          backgroundImage: `url(${CastButton})`,
          backgroundSize: 'cover',
          width: '220px',
          height: '80px',
          position: 'absolute',
          top: '20%',
          color: '#5D4037',
          visibility: selectedTiles.length > 0 ? 'visible' : 'hidden',
          opacity: enemyAttacking ? 0.5 : 1, // fade when disabled
        }}
        onClick={handleSubmitAnswer}
        disabled={enemyAttacking} // disable during enemy attack
      />

      {/* Selected Tiles */}
      <Box sx={{
        width: 600, height: 100,
        //border: '2px solid red', 
        top: '30%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 1000
      }}>
        {selectedTiles.map((tile) => (
          <Button
            key={tile.index}
            onClick={() => handleSelectedTileClick(tile)}
            sx={{
              backgroundImage: `url(${ItemBox})`,
              backgroundSize: 'cover',
              width: 60,
              height: 60,
              textTransform: 'none',
              color: '#5D4037',
              fontWeight: 'bold',
              fontFamily: 'RetroGaming',
              fontSize: 24,
              '&:hover': { opacity: 0.8, cursor: 'pointer' }
            }}
          >
            {tile.label}
          </Button>
        ))}
      </Box>

      {/* Characters */}
      <Box
        sx={{
          width: 1000,
          height: 400,
          top: "3%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Stack direction="row" sx={{ width: "100%" }}>
          {/* Main Character */}
          <motion.div
            key={`mc-${roundCounter}`}
            initial={{ x: "-200%" }}
            animate={
              impactVisible
                ? {
                  x: [0, -15, 15, -10, 10, -5, 5, 0] // shake sequence
                }
                : {
                  x: 0
                }
            }
            transition={{
              duration: impactVisible ? 0.6 : 0.8, // quick shake if hit
              ease: "easeInOut"
            }}
            style={{ position: "absolute", bottom: 0, left: 0, width: "220px", height: "215px" }}
          >

            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
              <img
                src={MCNoWeapon}
                alt="Player"
                style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "215px" }}
              />
              {itemEquipped?.cosmeticImage ? (
                <img
                  src={`data:image/png;base64,${itemEquipped.cosmeticImage}`}
                  alt="Weapon"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '220px',
                    height: '215px'
                  }}
                />
              ) : null}
              {shieldActive && (
                <img
                  src={Shield}
                  alt="Shield"
                  style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "215px" }}
                />
              )}

            </Box>
            {impactVisible && (
              <img
                src={MCNoWeaponHit}
                alt="Player"
                style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "215px" }}
              />
            )}

          </motion.div>

          {/* Enemy */}
          <motion.div
            key={`enemy-${roundCounter}`}
            initial={{ x: "100%", opacity: 0 }}
            animate={
              enemyDefeated
                ? {
                  x: [0, -15, 15, -10, 10, -5, 5, 0], // shake (stagger)
                  opacity: 0 // fade out
                }
                : {
                  x: enemyAttacking ? "-600px" : 0,
                  opacity: 1
                }
            }
            transition={{
              duration: enemyDefeated ? 1.2 : 0.8,
              ease: "easeInOut"
            }}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "220px",
              height: "215px",
            }}
          >
            <img
              src={`data:image/png;base64,${currentMonster.imageData}`}
              alt="Enemy"
              style={{ width: "220px", height: "215px" }}
            />
            {laserEffect === "fail" && (
              <img
                src={ShieldEnemy}
                alt="Shield Enemy"
                style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "215px" }}
              />
            )}
          </motion.div>




          {/* Laser Effect */}
          <Box
            sx={{
              width: 700,
              height: 100,
              position: "relative",
              display: laserEffect ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              mt: 10,
              ml: 25,
            }}
          >
            {laserEffect === "success" && (
              <img src={LaserSuccess} alt="Laser Success" style={{ width: "100%", height: "100%" }} />
            )}
            {laserEffect === "fail" && (
              <img src={LaserFail} alt="Laser Fail" style={{ width: "100%", height: "100%" }} />
            )}
          </Box>
        </Stack>
      </Box>


      {/* Message Box */}
      {makeMessageAppear && (
        <Box sx={{
          position: 'absolute',
          backgroundImage: `url(${GameTextBoxMediumLong})`,
          backgroundSize: 'cover',
          width: '50%',
          height: '35.6%',
          top: '30%',
          zIndex: 1000
        }}>
          <Grid container direction="column" alignItems="center" sx={{ p: 4 }}>
            <Stack direction="column" alignItems="center">
              <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                {messageDetails.mainMessage}
              </Typography>

              <Typography variant="h5" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', mt: 2 }}>
                {messageDetails.subMessage}
              </Typography>

              {/* If game cleared, show rewards */}
              {messageDetails.mainMessage === 'Level Cleared' && (
                <Stack direction="row" spacing={4} mt={2}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    <img src={GoldCoins} alt="Coin" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
                    {(levelData.coinsReward ?? 0)} Coins
                  </Typography>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    <img src={Gems} alt="Gems" style={{ width: '20px', height: '30px', marginRight: '8px', verticalAlign: 'middle' }} />
                    {(levelData.gemsReward ?? 0)} Gems
                  </Typography>
                </Stack>
              )}

              {/* If failed, show hint */}
              {isGameOver && messageDetails.mainMessage === 'Level Failed' && (
                <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', mt: 2 }}>
                  {hints[Math.floor(Math.random() * hints.length)]}
                </Typography>
              )}
            </Stack>


            {/* Show potion confirm/cancel */}
            {currentPotion && (
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
                  onClick={() => usePotion(currentPotion)}
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
                    setCurrentPotion(null);
                    setMakeMessageAppear(false);
                  }}
                >
                  <Typography sx={{ fontFamily: 'RetroGaming' }}>Cancel</Typography>
                </Button>
              </Stack>
            )}

            {/* Show return to town if game over */}
            {(isGameOver) && (
              <Button
                sx={{
                  backgroundImage: `url(${GameShopBoxSmall})`,
                  backgroundSize: 'cover',
                  width: '210px',
                  height: '60px',
                  top: 20,
                  color: '#5D4037',
                  mt: 2
                }}
                onClick={() => navigate('/homepage')}
              >
                <Typography sx={{ fontFamily: 'RetroGaming' }}>Return to Town</Typography>
              </Button>
            )}
          </Grid>
        </Box>
      )}


      <Box
        sx={{
          position: 'absolute',
          backgroundImage: `url(${DungeonBar})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '220px',
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={4} // adds equal space between sections
        >
          {/* Potions */}
          <Stack direction="row" spacing={4} alignItems="center">
            {[
              { img: HealthPotion, label: "Health Potion", potionType: "HEALTH" },
              { img: ShieldPotion, label: "Shield Potion", potionType: "SHIELD" },
              { img: SkipPotion, label: "Skip Potion", potionType: "SKIP" }
            ].map((potion, idx) => (
              <Stack key={idx} direction="column" spacing={1} alignItems="center">
                <Button
                  sx={{
                    backgroundImage: `url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: 100,
                    height: 100,
                    textTransform: 'none',
                    color: '#5D4037',
                    fontWeight: 'bold',
                    fontFamily: 'RetroGaming',
                    disabled: userDetails?.[`${potion.potionType.toLowerCase()}Potions`] <= 0,
                    opacity: userDetails?.[`${potion.potionType.toLowerCase()}Potions`] > 0 ? 1 : 1,
                    '&:hover': { opacity: 0.8, cursor: 'pointer' }
                  }}
                  onClick={() => confirmPotion(potion.potionType)}
                >
                  <img src={potion.img} alt={potion.label} style={{ width: '40px', height: '50px' }} />
                </Button>
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ color: '#5D4037', fontWeight: 'bold', fontFamily: 'RetroGaming' }}
                >
                  {potion.label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* Letter Tiles */}
          <Stack direction="column" spacing={1} alignItems="center" sx={{ px: '200px' }}>
            {[0, 1].map((row) => (
              <Stack key={row} direction="row" spacing={1}>
                {uppercaseLetters &&
                  uppercaseLetters.slice(row * 7, (row + 1) * 7).map((letter, idx) => {
                    const globalIndex = row * 7 + idx; // unique index per tile
                    const isSelected = selectedTiles.some((t) => t.index === globalIndex);
                    return (
                      <Button
                        key={globalIndex}
                        onClick={() => handleTileClick(letter, globalIndex)}
                        disabled={isSelected}
                        sx={{
                          visibility: isSelected ? 'hidden' : 'visible',
                          backgroundImage: `url(${ItemBox})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          width: 60,
                          height: 60,
                          textTransform: 'none',
                          color: '#5D4037',
                          fontWeight: 'bold',
                          fontFamily: 'RetroGaming',
                          fontSize: 24,
                          opacity: 1, '&:hover': { opacity: 0.8, cursor: 'pointer' }
                        }}
                      >
                        {letter}
                      </Button>

                    );
                  })}
              </Stack>
            ))}
          </Stack>
          {/* Hint Box */}
          <Box
            sx={{
              backgroundImage: `url(${DungeonHint})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              width: 350,
              height: 150
            }}
          >
            <Typography sx={{ padding: 2 }}>
              {currentMonster.description}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Grid>
  );
}
