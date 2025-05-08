// PhraseTranslationGame.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import { mockQuestions } from './mockQuestions';

export default function PhraseTranslation({ activityId }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/activities/${activityId}/questions?gameType=GAME2`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      if (Array.isArray(res.data) && res.data.length) {
        setQuestions(res.data);
      } else {
        console.warn('No GAME2 questions returned, using mockQuestions');
        setQuestions(mockQuestions.filter(q => q.questionDescription));
      }
    })
    .catch(err => {
      console.error('Failed to fetch GAME2 questions, using mockQuestions', err);
      setQuestions(mockQuestions.filter(q => q.questionDescription));
    });
  }, [activityId]);

  if (!questions.length) {
    return <Typography>Loading or no questions available.</Typography>;
  }

  const q = questions[index];
  const options = Array.isArray(q.choices) ? q.choices : [];
  const correctSeq = Array.isArray(q.choices)
    ? q.choices.filter(c => c.correct).sort((a, b) => (a.choiceOrder || 0) - (b.choiceOrder || 0)).map(c => c.choiceId)
    : [];

  const toggle = (choiceId) => {
    setSelected(sel => sel.includes(choiceId)
      ? sel.filter(id => id !== choiceId)
      : [...sel, choiceId]
    );
  };

  const submit = () => {
    if (JSON.stringify(selected) === JSON.stringify(correctSeq)) setScore(s => s + 1);
    const token = localStorage.getItem('token');
    axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/translation-score`,
      { questionId: q.questionId, selectedIds: selected },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .finally(() => {
      setSelected([]);
      if (index + 1 < questions.length) setIndex(i => i + 1);
      else alert(`Final Score: ${score}/${questions.length}`);
    });
  };

  return (
    <Box>
      <Typography variant="h6">{q.questionDescription}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
        {options.map(c => (
          <Button
            key={c.choiceId}
            variant={selected.includes(c.choiceId) ? 'contained' : 'outlined'}
            onClick={() => toggle(c.choiceId)}
            sx={{ m: 1 }}
          >
            {c.choiceText}
          </Button>
        ))}
      </Box>
      <Button onClick={submit} sx={{ mt: 2 }}>Submit</Button>
      <Typography sx={{ mt: 2 }}>Score: {score}</Typography>
    </Box>
  );
}
