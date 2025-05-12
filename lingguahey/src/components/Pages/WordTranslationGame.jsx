// src/components/WordTranslationGame.jsx
import React, { useState, useEffect } from 'react';
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
  DialogActions
} from '@mui/material';
import { styled } from '@mui/system';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';

// 🎨 Styled components for pastel aesthetic
const PastelContainer = styled(Box)(() => ({
  backgroundColor: '#fff4de',
  padding: '24px',
  minHeight: '100vh',
  fontFamily: 'Comic Sans MS, sans-serif',
}));

const ChoiceButton = styled(Button)(() => ({
  backgroundColor: '#DFF7E4',
  color: '#2E2E34',
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '12px 16px',
  margin: '8px',
  width: '100%',
  '&:hover': {
    backgroundColor: '#C8E6C9',
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
  
  const token = localStorage.getItem('token');

  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/`,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

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

  const handleChoice = (choice) => {
    const isCorrect = choice.correct;
    const earnedScore = isCorrect ? (q.score?.score || 1) : 0;
    const newScore = score + earnedScore;

    setScore(newScore);
    const nextIndex = index + 1;
    setProgress((nextIndex / questions.length) * 100);

    if (!isCompleted && userId) {
      API.post(
        `scores/award/translation/questions/${q.questionId}/users/${userId}`,
        [choice.choiceId]
      ).catch(err => console.error('Error awarding translation score:', err));
    }

    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      setFinalScore(newScore);
      setShowDialog(true);

      if (!isCompleted && newScore === questions.length && userId) {
        API.put(`activities/${activityId}/completed/${userId}`)
          .then(() => console.log('Activity marked completed 🎯'))
          .catch(err => console.error('Error marking activity as completed:', err));
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (onBack) onBack();  // ← this will now refresh + go back
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ textAlign: 'center', color: '#2E2E34' }}>
          {q.questionText}
        </Typography>
        <Button
          variant="contained"
          sx={{ marginLeft: '20px' }}
          onClick={() => synthesizeSpeech(q.questionText)}
        >
          TTS
        </Button>
      </Box>

      <Grid container spacing={2}>
        {shuffledOptions.map(choice => (
          <Grid item xs={6} key={choice.choiceId}>
            <ChoiceButton onClick={() => handleChoice(choice)}>
              {choice.choiceText}
            </ChoiceButton>
          </Grid>
        ))}
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
