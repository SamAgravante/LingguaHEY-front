import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';

export default function PhraseTranslation({ activityId }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [userId, setUserId] = useState(null);

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

    API.get(`/lingguahey/activities/${activityId}/questions?gameType=GAME2`)
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

  const handleCompletion = async () => {
    try {
      await API.post(`/activities/${activityId}/complete`);
      setCompleted(true);
    } catch (err) {
      console.error('Failed to mark activity as completed', err);
    }
  };

  const toggle = (choiceId) => {
    setSelected(prev =>
      prev.includes(choiceId)
        ? prev.filter(id => id !== choiceId)
        : [...prev, choiceId]
    );
  };

  const submit = async () => {
    const q = questions[index];
    const nextIndex = index + 1;

    try {
      if (userId) {
        await API.post(
          `/scores/award/translation/questions/${q.questionId}/users/${userId}`,
          selected
        );
        setScore(prev => prev + 1); // optimistic update assuming success = correct
      }
    } catch (err) {
      console.error('Failed to award score:', err);
    } finally {
      setSelected([]);
      if (nextIndex < questions.length) {
        setIndex(nextIndex);
      } else {
        handleCompletion();
      }
    }
  };

  if (!questions.length) {
    return <Typography>Loading or no questions available.</Typography>;
  }

  if (completed) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">🎉 Activity Completed!</Typography>
        <Typography>Your final score: {score} / {questions.length}</Typography>
      </Box>
    );
  }

  const q = questions[index];
  const options = Array.isArray(q.choices) ? q.choices : [];

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
