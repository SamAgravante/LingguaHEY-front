// src/components/OnePicFourWordGame.jsx
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
  DialogActions,
  Stack
} from '@mui/material';
import { styled } from '@mui/system';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';
import API from "../../api"; 
import modalBg from '../../assets/images/backgrounds/activity-select-bg.png';
import bunnyStand from '../../assets/images/characters/lingguahey-char1-stand.png';
import speechBubble from '../../assets/images/objects/speech-bubble.png';

// 🎨 Styled components for pastel aesthetic
const PastelContainer = styled(Box)(() => ({
  backgroundImage: `url(${modalBg})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: '24px',
  minHeight: '720px',
  fontFamily: 'Comic Sans MS, sans-serif',
  borderRadius: '20px',

}));

const pastels = [
  '#FFCDD2', // light red
  '#C8E6C9', // light green
  '#BBDEFB', // light blue
  '#FFF9C4', // light yellow
  '#D1C4E9', // light purple
];

const ChoiceButton = styled(Button)(() => ({
  backgroundColor: '#DFF7E4',
  color: '#2E2E34',
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '12px 16px',
  margin: '8px',
  width: '100%',
  '&:hover': { backgroundColor: '#C8E6C9' },
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

// Utility: Fisher–Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function OnePicFourWord({ activityId, onBack, isCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const user = getUserFromToken();
    if (user?.userId) setUserId(user.userId);

    API.get(`questions/activities/${activityId}?gameType=GAME1`)
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

  useEffect(() => {
    if (!questions.length) return;
    const opts = Array.isArray(questions[index].choices) ? questions[index].choices : [];
    setShuffledOptions(shuffleArray(opts));
  }, [questions, index]);

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

    if (userId && !isCompleted) {
      API.post(
        `scores/award/questions/${q.questionId}/users/${userId}?selectedChoiceId=${choice.choiceId}`
      ).catch(err => console.error('Error awarding score:', err));
    }

    if (nextIndex < questions.length) {
      setIndex(nextIndex);
    } else {
      setFinalScore(newScore);
      setShowDialog(true);
      if (newScore === questions.length && userId && !isCompleted) {
        API.put(`activities/${activityId}/completed/${userId}`)
          .catch(err => console.error('Error marking activity as completed:', err));
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (onBack) onBack();
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

      <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '5vh' }}>
        <Stack direction="row">
          <Box sx={{
            minHeight: 250,
            minWidth: 100,
            backgroundImage: `url(${bunnyStand})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }} />

          <Box sx={{
            height: '180px',
            width: '250px',
            minWidth: 100,
            maxWidth: 400,
            backgroundImage: `url(${speechBubble})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Grid>
              <Stack direction="column" alignItems="center">
                <Typography
                  variant="h4"
                  sx={{
                    textAlign: 'center',
                    color: '#2E2E34',
                    maxWidth: '80%',
                    marginBottom: 4,
                  }}
                >
                  Can you tell me what is this?
                </Typography>
              </Stack>
            </Grid>
          </Box>

          {q.questionImage && (
            <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 2, 
              minWidth: 300, 
              minHeight: 300 }}>
              <img
                src={`data:image/png;base64,${q.questionImage}`}
                alt="quiz"
                style={{ width: 200, height: 200 }}
              />
            </Box>
          )}
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
                '&:hover': { scale: 1.05 },
              }}
            >
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
