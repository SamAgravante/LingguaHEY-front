import React, { useEffect, useState, useContext } from 'react';
import { Grid, Typography, Button, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import Tablet from '../../assets/images/objects/Tablet.png';
import DungeonArrowLeft from "../../assets/images/objects/DungeonArrowLeft.png";
import DungeonArrowRight from "../../assets/images/objects/DungeonArrowRight.png";
import DungeonOpen from "../../assets/images/backgrounds/DungeonOpen.png";
import DungeonClosed from "../../assets/images/backgrounds/DungeonClosed.png";
import API from '../../api';
import EnterDungeonBox from "../../assets/images/backgrounds/EnterDungeonBox.png";
import { MusicContext } from '../../contexts/MusicContext';

import MCNoWeaponArm from '../../assets/images/characters/MCNoWeaponArm.png';
import MCNoWeaponAnimated from '../../assets/images/characters/MCNoWeaponAnimated.png';

export default function DungeonSection({
  closeModal,
  currentLevel,
  currentLevelIndex,
  setCurrentLevelIndex,
  levelDetails,
  dungeonPreperatory,
  setDungeonPreparatory,
  user,
  completedLevels,
  setDungeonBackground,
  itemEquipped,
}) {
  const navigate = useNavigate();
  const [dungeonIsOpen, setDungeonIsOpen] = useState(false);
  const [dungeonMessage, setDungeonMessage] = useState("");
  const [monsterList, setMonsterList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🔑 Derive current level completed instead of storing in state
  const currentLevelId = currentLevel?.levelId;
  const isCurrentLevelCompleted = completedLevels?.some(
    (level) => level.levelId === currentLevelId
  ) || false;

  const {
    setSrc,
    setActivityMode,
    setLevelClearMode,
    playLaserSuccess,
    playLaserFail,
    playHeal,
    playShield,
    playSkip,
    playHit,
    playEnemyAttack,
    playEnemyDead,
    playConfirm,
    playDenied,
    playCancel,
    playEquip,
    playFlip,
    playDoorOpen,
    playDungeonClick,
  } = useContext(MusicContext);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const uniqueMonsterResp = await API.get(
          `/levels/${currentLevel.levelId}/monsters/preview`
        );
        setMonsterList(uniqueMonsterResp.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentLevel]);

  useEffect(() => {
    const prevLevel = levelDetails[currentLevelIndex - 1];

    let isOpen = false;
    let message = "Level locked";
    let background = DungeonClosed;

    // --- Logic for Level 0 ---
    if (currentLevelIndex === 0) {
      isOpen = true;
      background = DungeonOpen;
      message = isCurrentLevelCompleted ? "Level completed" : "← Click door to proceed";
    }
    // --- Logic for Level 1 and above ---
    else if (prevLevel) {
      const prevLevelCompleted = completedLevels?.some(
        (level) => level.levelId === prevLevel.levelId
      ) || false;

      if (prevLevelCompleted) {
        isOpen = true;
        background = DungeonOpen;
        message = isCurrentLevelCompleted ? "Level completed" : "← Click door to proceed";
      }
    }

    setDungeonBackground(background);
    setDungeonIsOpen(isOpen);
    setDungeonMessage(message);
  }, [
    completedLevels,
    currentLevelIndex,
    currentLevel,
    levelDetails,
    setDungeonBackground,
    isCurrentLevelCompleted
  ]);

  return (
    <Grid container direction="column" alignItems="center" sx={{ width: '100%', height: 700 }}>
      <Box sx={{
        position: 'absolute',
        bottom: '23%', // Changed from top/right positioning
        left: '10%', // Changed from right positioning
        width: '220px',
        height: '215px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Stack direction='row'>
          <Box sx={{
            width: '220px',
            height: '215px',
            position: 'relative', // Changed from absolute
            ml: 80,
            mb: 10
          }}>
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={MCNoWeaponArm}
                alt="Player"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '220px',
                  height: '215px',
                  zIndex: 3
                }}
              />
              <img
                src={MCNoWeaponAnimated}
                alt="Player"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '220px',
                  height: '215px',
                  zIndex: 1
                }}
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
                    height: '215px',
                    zIndex: 2
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Stack>
      </Box>
      {/* Level Title */}
      <Box
        sx={{
          width: 470,
          height: 350,
          position: "absolute",
          color: '#4b8efb',
          right: 165,
          bottom: 280,
        }}>
        <Typography sx={{ fontSize: 75, WebkitTextStroke: '1px #180f0c' }}>
          Level {currentLevelIndex + 1}
        </Typography>
        <Typography sx={{ lineHeight: 1.3, fontSize: 55, WebkitTextStroke: '1px #180f0c', mt: -1 }}>
          {currentLevel?.levelName || "Unknown Level"}
        </Typography>
        {!dungeonIsOpen && (
          <Box sx={{ justifyItems: 'center', width: 400, position: "absolute", bottom: 20, ml: 2 }}>
            <Typography sx={{ fontSize: 22, color: '#ffe578' }}>
              Unlock previous
            </Typography>
            <Typography sx={{ fontSize: 22, color: '#ffe578' }}>
              level to proceed
            </Typography>
          </Box>
        )}
        {dungeonIsOpen && (
          <Box sx={{ justifyItems: 'center', width: 450, position: "absolute", bottom: 30 }}>
            <Typography sx={{ fontSize: 22, color: '#4b8efb', ml: 8 }}>
              {dungeonMessage}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Arrows */}
      {currentLevelIndex < levelDetails.length - 1 && (
        <Button
          onClick={() => {
            playDungeonClick(); // Play sound for navigation
            setCurrentLevelIndex(prev => Math.min(levelDetails.length - 1, prev + 1))
          }}
          sx={{
            backgroundImage: `url(${DungeonArrowRight})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            width: 120,
            height: 70,
            position: "absolute",
            right: 50,
            bottom: 390,
          }}
        />
      )}

      {currentLevelIndex > 0 && (
        <Button
          onClick={() => {
            playDungeonClick(); // Play sound for navigation
            setCurrentLevelIndex(prev => Math.max(0, prev - 1))
          }}
          sx={{
            backgroundImage: `url(${DungeonArrowLeft})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            width: 120,
            height: 70,
            position: "absolute",
            left: 50,
            bottom: 390,
          }}
        />
      )}

      {/* Return button */}
      <Button
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          height: 60,
          width: 300,
          backgroundImage: `url(${GameTextField})`,
          backgroundSize: 'cover',
          fontSize: 19,
          pr: 3
        }}
        onClick={() => { playCancel(); closeModal(); }} // Added playCancel
      >
        <Typography sx={{ fontFamily: 'RetroGaming' }}>
          ⮘ Return to Town
        </Typography>
      </Button>

      {/* Door click button */}
      <Button
        //disabled={!dungeonIsOpen}
        onClick={() => {if(dungeonIsOpen){
          playDoorOpen();
          setDungeonPreparatory(true);
          setCurrentPage(0);}
          else{
            playDenied();
          }
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

      {/* Tablet modal with backdrop */}
      {dungeonPreperatory && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Tablet itself */}
          <Box
            sx={{
              backgroundImage: `url(${Tablet})`,
              backgroundSize: 'cover',
              width: '50%',
              height: '65%',
              position: 'relative',
            }}
          >
            <Grid container direction="column" alignItems="center" sx={{ p: 4 }}>
              <Button
                sx={{ color: '#4b8efb', alignSelf: 'flex-end', mb: 2, fontSize: 30 }}
                onClick={() => {
                  playCancel(); // Play cancel when closing the tablet
                  setDungeonPreparatory(false);
                }}
              >
                X
              </Button>

              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 500,
                  height: 430,
                  borderRadius: 2,
                  p: 4,
                }}
              >
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}
                  spacing={3}
                >
                  {/* Left Arrow Slot */}
                  <Box sx={{ width: 80, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentPage > 0 && (
                      <Button
                        onClick={() => {
                          playDungeonClick(); // Play sound for flipping pages
                          setCurrentPage((prev) => Math.max(0, prev - 1));
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${DungeonArrowLeft})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                  </Box>

                  {/* Page Content */}
                  <Box
                    sx={{
                      width: 300,
                      height: 360,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    {/* Monster Pages */}
                    {currentPage < monsterList.length && monsterList[currentPage] ? (
                      <>
                        <Typography
                          color="#4b8efb"
                          variant='h1'
                          sx={{ textAlign: "left", position: "absolute", top: 10, left: -51, width: 500, WebkitTextStroke: '1px #180f0c' }}
                        >
                          In this room you will encounter:
                        </Typography>
                        <Box sx={{ width: "220px", height: "215px", mt: 4 }}>
                          <img
                            src={`data:image/png;base64,${monsterList[currentPage].imageData}`}
                            alt="Enemy"
                            style={{ width: "220px", height: "215px", mt: 2 }}
                          />
                        </Box>
                        <Typography color="#4b8efb" variant={'h3'} sx={{ mt: 2, WebkitTextStroke: '1px #180f0c', width: 500 }}>
                          Tagalog Name: {monsterList[currentPage].tagalogName}
                        </Typography>
                        <Typography color="#4b8efb" variant={'h3'} sx={{ mt: 2, WebkitTextStroke: '1px #180f0c', width: 500 }}>
                          English Name: {monsterList[currentPage].englishName}
                        </Typography>
                      </>
                    ) : null}

                    {/* Final Page */}
                    {currentPage === monsterList.length && (
                      <>
                        <Typography color="#4b8efb" variant='h1' sx={{ mb: 3, WebkitTextStroke: '1px #180f0c' }}>
                          Are you ready?
                        </Typography>
                        <Button sx={{
                          backgroundImage: `url(${EnterDungeonBox})`,
                          backgroundSize: 'cover',
                          width: '200px',
                          height: '60px',
                          color: '#4b8efb'
                        }}
                          onClick={() => {
                            playConfirm(); // Play confirm before navigating to dungeon
                            console.log("Navigating with state:",
                              {
                                levelId: currentLevel?.levelId,
                                userId: user?.userId,
                                isCurrentLevelCompleted: isCurrentLevelCompleted,
                              }); navigate('/dungeon',
                                {
                                  state:
                                  {
                                    levelId: currentLevel?.levelId,
                                    userId: user?.userId,
                                    isCurrentLevelCompleted: isCurrentLevelCompleted,
                                  },
                                });
                          }} />
                      </>
                    )}
                  </Box>

                  {/* Right Arrow Slot */}
                  <Box sx={{ width: 80, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentPage < monsterList.length && (
                      <Button
                        onClick={() => {
                          playDungeonClick(); // Play sound for flipping pages
                          setCurrentPage((prev) => Math.min(monsterList.length, prev + 1))
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${DungeonArrowRight})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Box>
        </Box>
      )}
    </Grid>
  );
}