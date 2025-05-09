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
  LinearProgress
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
  '&:hover': { backgroundColor: '#C8E6C9' },
  '&.MuiButton-contained': { backgroundColor: '#BAFFC9' }
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
 *  - onBack: callback to return to parent
 *  - isCompleted: boolean indicating if activity was already completed
 */
export default function PhraseTranslation({ activityId, onBack, isCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem('token');
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey`,
    timeout: 1000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
  });

  // Fetch questions and userId
  useEffect(() => {
    const user = getUserFromToken();
    if (user?.userId) setUserId(user.userId);
    API.get(`/questions/activities/${activityId}?gameType=GAME2`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : mockQuestions.filter(q => q.questionDescription);
        setQuestions(data);
      })
      .catch(() => setQuestions(mockQuestions.filter(q => q.questionDescription)));
  }, [activityId]);

  // Shuffle on load or index change
  useEffect(() => {
    if (!questions.length) return;
    const choices = questions[index].choices || [];
    setShuffledChoices(shuffleArray(choices));
    setSelected([]);
  }, [questions, index]);

  if (!questions.length) return <Typography>Loading or no questions available.</Typography>;

  const q = questions[index];

  const handleSelect = (choice) => setSelected(prev => [...prev, choice.choiceId]);
  const handleRemove = (choiceId) => setSelected(prev => prev.filter(id => id !== choiceId));

  const handleDialogClose = () => { setShowDialog(false); onBack?.(); };

  const handleSubmit = async () => {
    const correctSeq = q.choices.filter(c => c.correct)
      .sort((a, b) => (a.choiceOrder || 0) - (b.choiceOrder || 0))
      .map(c => c.choiceId);
    const isCorrect = correctSeq.length === selected.length && correctSeq.every((id, i) => id === selected[i]);
    const newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);

    const nextIndex = index + 1;
    setProgress((nextIndex / questions.length) * 100);

    // Only send if not completed
    if (userId && !isCompleted) {
      await API.post(`/scores/award/translation/questions/${q.questionId}/users/${userId}`, selected)
        .catch(console.error);
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

  return (
    <PastelContainer>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>Phrase Translation</Typography>
      <Typography variant="subtitle1" sx={{ color: '#2E2E34', mb: 2 }}>Score: {score}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}><PastelProgress variant="determinate" value={progress} /></Box>
        <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>{index + 1} / {questions.length}</Typography>
      </Box>

      <Typography variant="h6" sx={{ mb: 2, color: '#2E2E34' }}>{q.questionDescription}</Typography>

      {selected.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
          {selected.map(id => {
            const choice = q.choices.find(c => c.choiceId === id) || {};
            return <Chip key={id} label={choice.choiceText} onDelete={() => handleRemove(id)} sx={{ m: 0.5, backgroundColor: '#FFECB3', color: '#2E2E34' }} />;
          })}
        </Box>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {shuffledChoices.map(c => (
          <Grid item xs={6} key={c.choiceId}>
            <ChoiceButton variant={selected.includes(c.choiceId) ? 'contained' : 'outlined'} disabled={selected.includes(c.choiceId)} onClick={() => handleSelect(c)}>
              {c.choiceText}
            </ChoiceButton>
          </Grid>
        ))}
      </Grid>

      <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }} disabled={!selected.length}>Submit</Button>

      <Dialog open={showDialog} onClose={handleDialogClose}>
        <DialogTitle>🎉 Quiz Complete!</DialogTitle>
        <DialogContent><Typography>Your final score is {finalScore} / {questions.length}</Typography></DialogContent>
        <DialogActions><Button onClick={handleDialogClose} variant="contained">Close</Button></DialogActions>
      </Dialog>
    </PastelContainer>
  );
}