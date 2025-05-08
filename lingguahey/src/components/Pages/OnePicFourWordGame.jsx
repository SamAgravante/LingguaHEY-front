import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/system';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';

// 🎨 Styled pastel UI
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

export default function OnePicFourWord({ activityId }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);  // New state to store selected words

  const token = localStorage.getItem('token');
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.userId) setUserId(user.userId);

    API.get(`activities/${activityId}/questions?gameType=GAME1`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length) {
          setQuestions(res.data);
        } else {
          console.warn('No GAME1 questions returned, using mockQuestions');
          setQuestions(mockQuestions.filter(q => q.questionImage));
        }
      })
      .catch(err => {
        console.error('Failed to fetch GAME1 questions, using mockQuestions', err);
        setQuestions(mockQuestions.filter(q => q.questionImage));
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

    setScore(newScore);
    const nextIndex = index + 1;
    setProgress(((nextIndex) / questions.length) * 100);

    // Add selected word to the selectedWords state
    setSelectedWords((prevWords) => [...prevWords, choice.choiceText]);

    // Send selected choice
    API.post('score', {
      questionId: q.questionId,
      choiceId: choice.choiceId
    }).catch(err => console.error('Error recording choice', err));

    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      setFinalScore(newScore);
      setShowDialog(true);
      // Mark complete if perfect
      if (newScore === questions.length && userId) {
        API.post(`activities/${activityId}/complete`)
          .then(() => console.log('Activity marked completed 🎯'))
          .catch(err => console.error('Error marking activity as completed', err));
      }
    }
  };

  return (
    <PastelContainer>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
        One Pic Four Words
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

      {q.questionImage && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={`data:image/png;base64,${q.questionImage}`}
            alt="quiz"
            style={{ width: 200, height: 200 }}
          />
        </Box>
      )}

      <Grid container spacing={2}>
        {options.map(choice => (
          <Grid item xs={6} key={choice.choiceId}>
            <ChoiceButton onClick={() => handleChoice(choice)}>
              {choice.choiceText}
            </ChoiceButton>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ color: '#2E2E34' }}>
          Selected Words:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedWords.map((word, index) => (
            <Box key={index} sx={{
              backgroundColor: '#DFF7E4',
              padding: '8px 16px',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}>
              {word}
            </Box>
          ))}
        </Box>
      </Box>

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
