import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Stack, styled } from '@mui/system';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';
import modalBg from '../../assets/images/backgrounds/activity-select-bg.png';
import bunnyStand from '../../assets/images/characters/lingguahey-char1-stand.png';
import speechBubble from '../../assets/images/objects/speech-bubble.png';
import API from '../../api';
import { MusicContext } from '../../contexts/MusicContext';

// Pastel color palette for choice buttons
const pastels = [
  '#FFCDD2', // light red
  '#C8E6C9', // light green
  '#BBDEFB', // light blue
  '#FFF9C4', // light yellow
  '#D1C4E9', // light purple
];

// 🎨 Styled components for pastel aesthetic
const PastelContainer = styled(Box)(() => ({
  backgroundImage: `url(${modalBg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: '24px',
  minHeight: '670px',
  fontFamily: 'Comic Sans MS, sans-serif',
  borderRadius: '20px',

}));

const ChoiceButton = styled(Button)(() => ({
  color: '#2E2E34',
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '12px 16px',
  margin: '8px',
  width: '100%',
  '&:hover': {
    filter: 'brightness(1.1)',
  },
}));

const PastelProgress = styled(LinearProgress)(() => ({
  height: '12px',
  borderRadius: '8px',
  backgroundColor: '#EAEAEA',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(to right, #BAFFC9, #FFB3BA)',
    borderRadius: '8px',
  },
}));

// Utility to shuffle an array
function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function WordTranslation({ activityId, onBack, isCompleted = false }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { setLevelClearMode } = useContext(MusicContext);

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

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.userId) setUserId(user.userId);

    API.get(`questions/activities/${activityId}?gameType=GAME3`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length) {
          setQuestions(res.data);
        } else {
          console.warn('No GAME3 questions returned, using mockQuestions');
          setQuestions(mockQuestions.filter(q => q.questionText && !q.questionImage));
        }
      })
      .catch(err => {
        console.error('Failed to fetch GAME3 questions, using mockQuestions', err);
        setQuestions(mockQuestions.filter(q => q.questionText && !q.questionImage));
      });
  }, [activityId]);

  useEffect(() => {
    if (!questions.length) return;
    setShuffledOptions(shuffleArray(questions[index].choices || []));
  }, [questions, index]);

  const synthesizeSpeech = async (text) => {
    try {
      const response = await APItts.post(
        '/synthesize',
        { text },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(response.data);
      new Audio(url).play();
    } catch (error) {
      console.error('Failed to synthesize speech', error);
    }
  };

  if (!questions.length) {
    return <Typography>Loading or no questions available.</Typography>;
  }

  const q = questions[index];

  const handleChoice = async (choice) => {
    const isCorrect = choice.correct;
    const earnedScore = isCorrect ? (q.score?.score || 1) : 0;
    const newScore = score + earnedScore;

    setScore(newScore);

    // If this was the last question
    if (index === questions.length - 1) {
      setFinalScore(newScore);
      setShowDialog(true);
      setLevelClearMode(true); // Play level clear music
      
      // Revert to default music after 4 seconds
      setTimeout(() => {
        setLevelClearMode(false);
      }, 4000);
    } else {
      setIndex(index + 1);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (onBack) onBack();
  };

  return (
    <PastelContainer>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
        Word Translation
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#2E2E34', mb: 2 }}>
        Score: {score}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <PastelProgress variant="determinate" value={progress} />
        </Box>
        <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>
          {index + 1} / {questions.length}
        </Typography>
      </Box>

      <Grid sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingBottom: '10vh' 
        }}>
        <Stack direction="row" >
          <Box sx={{
            minHeight: 250,
            minWidth: 100,
            backgroundImage: `url(${bunnyStand})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }}>
          </Box>
          <Box sx={{
            minHeight: 250,
            minWidth: 300,
            backgroundImage: `url(${speechBubble})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            justifyItems: 'center',}}>
            <Grid>
              <Stack direction="column" alignItems="center" sx={{ paddingTop: 5 }}>
                <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                  What does this mean?
                </Typography>
                <Stack direction="row" alignItems="center">
                  <Typography variant="h3" sx={{ textAlign: 'center', color: '#E6bbad', textShadow: '-1px -1px 0 #bb998f, 1px -1px 0 #bb998f, -1px 1px 0 #bb998f, 1px 1px 0 #bb998f', }}>
                    {q.questionText}
                  </Typography>
                  <IconButton onClick={() => synthesizeSpeech(q.questionText)}>
                    <VolumeUpIcon sx={{ fontSize: 32, color: '#2E2E34' }} />
                  </IconButton>
                </Stack>

              </Stack>
            </Grid>
          </Box>
        </Stack>
      </Grid>
      

      <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
        {shuffledOptions.map((choice, i) => (
          <Grid
            item
            xs={6}
            key={choice.choiceId}
            sx={{
              minHeight: 150,
              minWidth: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              
            }}
          >
            <ChoiceButton
              onClick={() => handleChoice(choice)}
              sx={{
                fontSize: '3rem',
                height: '100%',
                backgroundColor: pastels[i % pastels.length],
                '&:hover': {
                  //backgroundColor: pastels[i % pastels.length],
                  //filter: 'brightness(1.2)',
                  scale: 1.05,
                }
              }}
            >
              {choice.choiceText}
            </ChoiceButton>
          </Grid>
        ))}e
      </Grid>

      <Dialog open={showDialog} onClose={handleDialogClose}>
        <DialogTitle>🎉 Quiz Complete!</DialogTitle>
        <DialogContent>
          <Typography>Your final score is {finalScore} / {questions.length}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </PastelContainer>
  );
}