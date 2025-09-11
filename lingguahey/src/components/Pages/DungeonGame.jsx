import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Stack
} from '@mui/material';
import { styled } from '@mui/system';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';
import API from '../../api';
import modalBg from '../../assets/images/backgrounds/activity-select-bg.png';
import bunnyStand from '../../assets/images/characters/lingguahey-char1-stand.png';
import speechBubble from '../../assets/images/objects/speech-bubble.png';
import CloseIcon from '@mui/icons-material/Close';
import { MusicContext } from '../../contexts/MusicContext';

// Background image for the game area
import DungeonRoom from '../../assets/images/backgrounds/DungeonRoom.png';
import DungeonBar from '../../assets/images/backgrounds/DungeonBar.png';
import DungeonHint from '../../assets/images/backgrounds/DungeonHint.png';

import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextBoxBig from "../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";
import ShopUI from "../../assets/images/backgrounds/ShopUI.png";
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";


// Fisher–Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DungeonGame({ activityId, onBack, isCompleted = false }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [userId, setUserId] = useState(null);
  const { setLevelClearMode } = useContext(MusicContext);  // Add this line

  // grab token and build TTS API client
  const token = localStorage.getItem('token');
  const APItts = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/tts`,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/octet-stream',
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch questions and userId
  useEffect(() => {
    const user = getUserFromToken();
    if (user?.userId) setUserId(user.userId);
    API.get(`/questions/activities/${activityId}?gameType=GAME2`)
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : mockQuestions.filter(q => q.questionDescription);
        setQuestions(data);
      })
      .catch(() =>
        setQuestions(mockQuestions.filter(q => q.questionDescription))
      );
  }, [activityId]);

  // Shuffle choices on load or index change
  useEffect(() => {
    if (!questions.length) return;
    setShuffledChoices(shuffleArray(questions[index].choices || []));
    setSelected([]);
  }, [questions, index]);

  if (!questions.length) {
    return <Typography>Loading or no questions available.</Typography>;
  }

  const q = questions[index];

  const synthesizeSpeech = async (text) => {
    try {
      const response = await APItts.post('/synthesize', { text }, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      new Audio(url).play();
    } catch (error) {
      console.error('Failed to synthesize speech', error);
    }
  };

  const handleSelect = (choice) =>
    setSelected(prev => [...prev, choice.choiceId]);

  const handleRemove = (choiceId) =>
    setSelected(prev => prev.filter(id => id !== choiceId));

  const handleSubmit = async () => {
    const correctSeq = q.choices
      .filter(c => c.correct)
      .sort((a, b) => (a.choiceOrder || 0) - (b.choiceOrder || 0))
      .map(c => c.choiceId);

    const isCorrect =
      correctSeq.length === selected.length &&
      correctSeq.every((id, i) => id === selected[i]);

    const newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);
    
    // Update progress before changing index
    const nextIndex = index + 1;
    const newProgress = (nextIndex / questions.length) * 100;
    setProgress(newProgress);

    if (userId && !isCompleted) {
      await API.post(
        `/scores/award/translation/questions/${q.questionId}/users/${userId}`,
        selected
      ).catch(console.error);
    }

    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      setFinalScore(newScore);
      setShowDialog(true);
      setLevelClearMode(true); // Play level clear music
      
      // Revert to default music after 4 seconds
      setTimeout(() => {
        setLevelClearMode(false);
      }, 4000);

      if (newScore === questions.length && userId && !isCompleted) {
        API.put(`/activities/${activityId}/completed/${userId}`).catch(console.error);
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    onBack?.();
  };

  // Generate mock letter tiles (14 per row, 2 rows)
  const mockTiles = Array.from({ length: 14 * 2 }, (_, i) => ({
    id: i,
    label: String.fromCharCode(65 + (i % 26)), // A-Z looping
  }));

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
          alignItems="center">
          {/* Potions */}
          <Box sx={{ 
            position: 'relative', 
            left: 16,
            width: '100',
          }}>
            <Stack direction="row" spacing={2}>
              
            <Stack direction="column" spacing={2}>
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
                  fontFamily: 'RetroGaming' 
                }}>
                  <img src={HealthPotion} alt="Health Potion" style={{ width: '40px', height: '50px' }} />
              </Button>
              <Typography variant="caption" align="center" sx={{ color: '#5D4037', fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                Health Potion
              </Typography>
            </Stack>
            <Stack direction="column" spacing={2}>
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
                  fontFamily: 'RetroGaming' 
                }}>
                  <img src={ShieldPotion} alt="Shield Potion" style={{ width: '40px', height: '50px' }} />
              </Button>
              <Typography variant="caption" align="center" sx={{ color: '#5D4037', fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                Shield Potion
              </Typography>
            </Stack>
            <Stack direction="column" spacing={2}>
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
                  fontFamily: 'RetroGaming' 
                }}>
                  <img src={SkipPotion} alt="Skip Potion" style={{ width: '40px', height: '50px' }} />
              </Button>
              <Typography variant="caption" align="center" sx={{ color: '#5D4037', fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                Skip Potion
              </Typography>
            </Stack>
            </Stack>
          </Box>
          {/* Letter Tiles */}
          <Box sx={{ position: 'relative', left: 32, paddingLeft: 35, paddingRight: 30 }}>
            <Grid container spacing={1}></Grid>
              {[0, 1].map(row => (
                <Grid item xs={12} key={row}>
                  <Stack direction="row" spacing={1}>
                    {mockTiles.slice(row * 7, (row + 1) * 7).map(tile => (
                      <Button
                        key={tile.id}
                        sx={{
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
                        }}
                      >
                        {tile.label}
                      </Button>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Box>
            <Box sx={{ position: 'relative', backgroundImage: `url(${DungeonHint})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', width: 350, height: 150, 
              
              right: 5}}>
            </Box>
            </Stack>
          </Box>
        </Grid>
  );
}
