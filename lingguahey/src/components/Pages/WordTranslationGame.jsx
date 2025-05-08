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

// 🔒 Secure axios instance


// Automatically attach token before each request
/*API.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Get latest token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});*/

// 🎨 Styled components for pastel aesthetic
const PastelContainer = styled(Box)({
  backgroundColor: '#fff4de',
  padding: '24px',
  minHeight: '100vh',
  fontFamily: 'Comic Sans MS, sans-serif',
});

const ChoiceButton = styled(Button)({
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
});

const PastelProgress = styled(LinearProgress)({
  height: '12px',
  borderRadius: '8px',
  backgroundColor: '#EAEAEA',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(to right, #BAFFC9, #FFB3BA)',
    borderRadius: '8px',
  },
});

export default function WordTranslation({ activityId }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const token = localStorage.getItem('token');
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/`,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,//Can be removed if interceptor is used
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

  if (!questions.length) {
    return <Typography>Loading or no questions available.</Typography>;
  }

  const q = questions[index];
  const options = Array.isArray(q.choices) ? q.choices : [];

  const handleChoice = (choice) => {
    const isCorrect = choice.correct;
    const earnedScore = isCorrect ? (q.score?.score || 1) : 0;
    const newScore = score + earnedScore;

    // Update local score and progress
    setScore(newScore);
    const nextIndex = index + 1;
    setProgress(((nextIndex) / questions.length) * 100);

    // Award score via the raw list endpoint (expects an array of ints)
    if (userId) {
      API.post(
        `scores/award/translation/questions/${q.questionId}/users/${userId}`,
        [choice.choiceId]
      )
      .catch(err => console.error('Error awarding translation score:', err));
    }

    // Advance or finish
    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      setFinalScore(newScore);
      setShowDialog(true);
      // Mark activity completed if perfect
      if (newScore === questions.length && userId) {
        API.put(`activities/${activityId}/completed/${userId}`)
          .then(() => console.log('Activity marked completed 🎯'))
          .catch(err => console.error('Error marking activity as completed:', err));
      }
    }
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

      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, color: '#2E2E34' }}>
        {q.questionText}
      </Typography>

      <Grid container spacing={2}>
        {options.map(choice => (
          <Grid item xs={6} key={choice.choiceId}>
            <ChoiceButton onClick={() => handleChoice(choice)}>
              {choice.choiceText}
            </ChoiceButton>
          </Grid>
        ))}
      </Grid>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>🎉 Quiz Complete!</DialogTitle>
        <DialogContent>
          <Typography>Your final score is {finalScore} / {questions.length}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </PastelContainer>
  );
}
