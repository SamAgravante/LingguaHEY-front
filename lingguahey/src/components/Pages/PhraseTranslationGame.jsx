import React, { useState, useEffect } from 'react';
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

// Pastel color palette
const pastels = [
  '#FFCDD2', // light red
  '#C8E6C9', // light green
  '#BBDEFB', // light blue
  '#FFF9C4', // light yellow
  '#D1C4E9', // light purple
];

// 🎨 Styled components
const PastelContainer = styled(Box)(() => ({
  backgroundImage: `url(${modalBg})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: '18px',
  maxHeight: '900px',
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
    transform: 'scale(1.05)',
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

// Fisher–Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PhraseTranslation({ activityId, onBack, isCompleted = false }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [userId, setUserId] = useState(null);

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
    const nextIndex = index + 1;
    setProgress((nextIndex / questions.length) * 100);

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
      if (newScore === questions.length && userId && !isCompleted) {
        API.put(`/activities/${activityId}/completed/${userId}`).catch(console.error);
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    onBack?.();
  };

  return (
    <PastelContainer>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
        Phrase Translation
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
            minWidth: 100,
            maxWidth: 400,
            backgroundImage: `url(${speechBubble})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            justifyItems: 'center',}}>
            <Grid>
              <Stack direction="column" alignItems="center" sx={{ padding: 2 }}>
                <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                  What does
                </Typography>
                <Stack direction="row" alignItems="center" sx={{flexWrap: 'wrap'}}>
                  <Typography variant="h3" sx={{ textAlign: 'center', color: '#E6bbad', textShadow: '-1px -1px 0 #bb998f, 1px -1px 0 #bb998f, -1px 1px 0 #bb998f, 1px 1px 0 #bb998f', }}>
                    {q.questionDescription}
                  </Typography>
                  <IconButton onClick={() => synthesizeSpeech(q.questionDescription)}>
                    <VolumeUpIcon sx={{ fontSize: 32, color: '#2E2E34' }} />
                  </IconButton>
                </Stack>
                <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                  mean?
                </Typography>

              </Stack>
            </Grid>
          </Box>
        </Stack>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          mb: 2,
          minHeight: 80,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#BBDEFB',
          p: 1,
          borderRadius: 1,
          marginBottom: 4,
        }}
      >
        {selected.map(id => {
          const choice = q.choices.find(c => c.choiceId === id) || {};
          return (
            <Chip
              key={id}
              label={choice.choiceText}
              onDelete={() => handleRemove(id)}
              onClick={() => handleRemove(id)}
              deleteIcon={
                <CloseIcon
                  sx={{
                    color: '#bb998f',
                    fontSize: 28,
                    '&:hover': { color: '#E6bbad' },
                  }}
                />
              }
              sx={{
                m: 0.5,
                backgroundColor: '#FFECB3',
                color: '#2E2E34',
                fontSize: '2rem',
                minHeight: 70,
                minWidth: 50,
                paddingRight: '8px',
                '& .MuiChip-label': {
                  fontSize: '2rem',
                  paddingRight: '6px',
                },
              }}
            />
          );
        })}
      </Box>

      <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
        {shuffledChoices.map((c, i) => (
          <Grid
            item
            xs={6}
            key={c.choiceId}
            sx={{
              minHeight: 150,
              minWidth: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChoiceButton
              onClick={() => handleSelect(c)}
              variant={selected.includes(c.choiceId) }
              disabled={selected.includes(c.choiceId)}
              sx={{
                backgroundColor: pastels[i % pastels.length],
                fontSize: '3rem',
                height: '100%',
              }}
            >
              {c.choiceText}
            </ChoiceButton>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ justifyContent: 'center', mt: 4 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            mt: 2, 
            backgroundColor: '#FFB3BA', 
            color: '#2E2E34',
            justifyContent: 'center',
          }}
          disabled={!selected.length}
        >
          Submit
        </Button>
      </Grid>


      <Dialog open={showDialog} onClose={handleDialogClose}>
        <DialogTitle>🎉 Quiz Complete!</DialogTitle>
        <DialogContent>
          <Typography>
            Your final score is {finalScore} / {questions.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PastelContainer>
  );
}
