// OnePicFourWordGame.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Grid } from '@mui/material';
import { mockQuestions } from './mockQuestions';

export default function OnePicFourWord({ activityId }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/activities/${activityId}/questions?gameType=GAME1`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
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

  if (!questions || !questions.length) {
    return <Typography>Loading or no questions available.</Typography>;
  }

  const q = questions[index];
  const options = Array.isArray(q.choices) ? q.choices : [];

  const handleChoice = (choice) => {
    if (choice.correct) setScore(s => s + (q.score?.score || 1));
    axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/score`,
      { questionId: q.questionId, choiceId: choice.choiceId },
      { headers: { Authorization: `Bearer ${token}` } }
    ).finally(() => {
      if (index + 1 < questions.length) setIndex(i => i + 1);
      else alert(`Final Score: ${score}/${questions.length}`);
    });
  };

  return (
    <Box>
      {q.questionImage && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img src={q.questionImage} alt="quiz" style={{ width: 200, height: 200 }} />
        </Box>
      )}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {options.map(c => (
          <Grid item xs={6} key={c.choiceId}>
            <Button fullWidth onClick={() => handleChoice(c)}>
              {c.choiceText}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Typography sx={{ mt: 2 }}>Score: {score}</Typography>
    </Box>
  );
}