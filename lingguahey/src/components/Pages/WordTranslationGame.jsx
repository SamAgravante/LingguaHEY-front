// WordTranslationGame.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import { mockQuestions } from './mockQuestions';

export default function WordTranslation({ activityId }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/activities/${activityId}/questions?gameType=GAME3`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
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
    if (choice.correct) setScore(s => s + (q.score?.score || 1));
    const token = localStorage.getItem('token');
    axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/score`,
      { questionId: q.questionId, choiceId: choice.choiceId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .finally(() => {
      if (index + 1 < questions.length) setIndex(i => i + 1);
      else alert(`Final Score: ${score}/${questions.length}`);
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>{q.questionText}</Typography>
      {options.map(c => (
        <Button key={c.choiceId} onClick={() => handleChoice(c)} sx={{ m: 1 }}>
          {c.choiceText}
        </Button>
      ))}
      <Typography sx={{ mt: 2 }}>Score: {score}</Typography>
    </Box>
  );
}