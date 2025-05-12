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
  DialogActions
} from '@mui/material';
import { styled } from '@mui/system';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';
import API from "../../api"; 

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

/**
 * Props:
 *  - activityId: ID of the activity
 *  - onBack: callback to return to parent (should refresh + close)
 *  - isCompleted: boolean indicating if activity was already completed
 */
export default function OnePicFourWord({ activityId, onBack, isCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Fetch questions and user ID
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

  // Shuffle options on load or when index changes
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

    // Only send score if activity not already completed
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
      // Only mark complete if not already
      if (newScore === questions.length && userId && !isCompleted) {
        API.put(`activities/${activityId}/completed/${userId}`)
          .catch(err => console.error('Error marking activity as completed:', err));
      }
    }
  };

  // ▶️ When the dialog closes, this calls onBack(), which your Homepage
  //    should have wired up to fetchUserActivities() + setCurrent(null).
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
