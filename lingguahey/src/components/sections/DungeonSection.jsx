import React, { useEffect, useState } from 'react';
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
}) {
  const navigate = useNavigate();
  const [dungeonIsOpen, setDungeonIsOpen] = useState(false);
  const [dungeonMessage, setDungeonMessage] = useState("");
  const [monsterList, setMonsterList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!completedLevels || completedLevels.length === 0) {
      if (currentLevelIndex === 0) {
        setDungeonBackground(DungeonOpen);
        setDungeonIsOpen(true);
        setDungeonMessage("← Click door to proceed");
      } else {
        setDungeonBackground(DungeonClosed);
        setDungeonIsOpen(false);
        setDungeonMessage("Level locked");
      }
      return;
    }

    if (currentLevelIndex === 0) {
      setDungeonBackground(DungeonOpen);
      setDungeonIsOpen(true);

      const currentLevelCompleted = completedLevels.some(
        level => level.levelId === currentLevel?.levelId
      );

      setDungeonMessage(
        currentLevelCompleted ? "Level completed" : "← Click door to proceed"
      );
    } else {
      const prevLevel = levelDetails[currentLevelIndex - 1];
      const prevLevelCompleted = completedLevels.some(
        level => level.levelId === prevLevel.levelId
      );
      const currentLevelCompleted = completedLevels.some(
        level => level.levelId === currentLevel?.levelId
      );

      if (prevLevelCompleted) {
        setDungeonBackground(DungeonOpen);
        setDungeonIsOpen(true);

        setDungeonMessage(
          currentLevelCompleted ? "Level completed" : "← Click door to proceed"
        );
      } else {
        setDungeonBackground(DungeonClosed);
        setDungeonIsOpen(false);
        setDungeonMessage("Level locked");
      }
    }
  }, [
    completedLevels,
    currentLevelIndex,
    currentLevel,
    levelDetails,
    setDungeonBackground,
  ]);

  return (
    <Grid container direction="column" alignItems="center" sx={{ width: '100%', height: 700 }}>
      {/* Level Title */}
      <Box
        sx={{
          width: 470,
          height: 350,
          position: "absolute",
          color: '#3361AB',
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
          <Box sx={{ justifyItems: 'center', width: 400, position: "absolute", bottom: 20,ml: 2 }}>
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
            <Typography sx={{ fontSize: 22, color: '#3361AB', ml: 8 }}>
              {dungeonMessage}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Arrows */}
      {currentLevelIndex < levelDetails.length - 1 && (
        <Button
          onClick={() =>
            setCurrentLevelIndex(prev => Math.min(levelDetails.length - 1, prev + 1))
          }
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
          onClick={() => setCurrentLevelIndex(prev => Math.max(0, prev - 1))}
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

      {/* Door click button */}
      <Button
        disabled={!dungeonIsOpen}
        onClick={() => {
          setDungeonPreparatory(true);
          setCurrentPage(0); // reset to first monster slide
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
            backgroundColor: 'rgba(0,0,0,0.5)', // dark overlay
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
                sx={{ color: '#3361AB', alignSelf: 'flex-end', mb: 2, fontSize: 30 }}
                onClick={() => setDungeonPreparatory(false)}
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
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
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
                        color="#3361AB"
                        variant='h1'
                        
                        sx={{textAlign: "left",position:"absolute",top: 10,left:-51,width:500, WebkitTextStroke: '1px #180f0c'}}
                        > In this room you will encounter:</Typography>
                        <Box sx={{ width: "220px", height: "215px",mt:4 }}>
                          <img
                            src={`data:image/png;base64,${monsterList[currentPage].imageData}`}
                            alt="Enemy"
                            style={{ width: "220px", height: "215px" }}
                          />
                        </Box>
                        <Typography color="#3361AB" variant={'h3'} sx={{ mt: 3, WebkitTextStroke: '1px #180f0c',width:500 }}>
                          Tagalog Name: {monsterList[currentPage].tagalogName}
                        </Typography>
                        <Typography color="#3361AB" variant={'h3'} sx={{ mt: 3, WebkitTextStroke: '1px #180f0c',width:500 }}>
                          English Name: {monsterList[currentPage].englishName}
                        </Typography>
                      </>
                    ) : null}

                    {/* Final Page */}
                    {currentPage === monsterList.length && (
                      <>
                        <Typography color="#3361AB" variant='h1' sx={{ mb: 3, WebkitTextStroke: '1px #180f0c' }}>
                          Are you ready?
                        </Typography>
                        <Button
                          sx={{
                            backgroundImage: `url(${EnterDungeonBox})`,
                            backgroundSize: 'cover',
                            width: '200px',
                            height: '60px',
                            color: '#3361AB'
                          }}
                          onClick={() =>
                            navigate('/dungeon', {
                              state: {
                                levelId: currentLevel?.levelId,
                                userId: user?.userId,
                              },
                            })
                          }
                        />
                      </>
                    )}
                  </Box>

                  {/* Right Arrow Slot */}
                  <Box sx={{ width: 80, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentPage < monsterList.length && (
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(monsterList.length, prev + 1))
                        }
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
