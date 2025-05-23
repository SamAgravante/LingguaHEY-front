// MultiplayerGameRoom.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getUserFromToken } from '../../utils/auth';
import API from '../../api.jsx';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack as MuiStack
} from '@mui/material';
import { styled } from '@mui/system';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import modalBg from '../../assets/images/backgrounds/activity-select-bg.png';
import bunnyStand from '../../assets/images/characters/lingguahey-char1-stand.png';
import speechBubble from '../../assets/images/objects/speech-bubble.png';
import { mockQuestions } from './mockQuestions';

const pastels = [
  '#FFCDD2', // light red
  '#C8E6C9', // light green
  '#BBDEFB', // light blue
  '#FFF9C4', // light yellow
  '#D1C4E9', // light purple
];

const PastelContainer = styled(Box)(() => ({
  backgroundImage: `url(${modalBg})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: '24px',
  minHeight: '720px',
  fontFamily: 'Comic Sans MS, sans-serif',
  borderRadius: '20px',
  width: '90vw',
  maxWidth: 1200,
  margin: 'auto',
}));

const ChoiceButton = styled(Button)(() => ({
  color: '#2E2E34',
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '12px 16px',
  margin: '8px',
  width: '100%',
  '&:hover': {
    filter: 'brightness(1.1)',
    transform: 'scale(1.05)',
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

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MultiplayerGameRoom({ activityId: propActivityId, onLeave }) {
  const token = localStorage.getItem('token');
  let activityId = propActivityId;
  const { state } = useLocation();
  if (!activityId && state?.activityId) activityId = state.activityId;
  const userId = getUserFromToken()?.userId;

  const [userRole, setUserRole] = useState(null);
  const [liveActivityUpdate, setLiveActivityUpdate] = useState(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]); 
  
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [pendingAnswer, setPendingAnswer] = useState(null); // Store answer until teacher advances
  const [waitingForTeacher, setWaitingForTeacher] = useState(false); // For students after submitting

  useEffect(() => {
    if (!userId) return;
    API.get(`/users/${userId}`)
      .then(res => {
        const role = res.data?.role?.toUpperCase?.();
        setUserRole(role);
      })
      .catch(() => setUserRole(null));
  }, [userId]);

  // --- WebSocket logic: listen for NEXT_QUESTION and submit answer then advance ---
  useEffect(() => {
    if (!activityId) return;
    const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`);
    const client = Stomp.over(socket);
    client.debug = () => {};
    stompClientRef.current = client;

    client.connect({}, () => {
      subscriptionRef.current = client.subscribe(
        `/topic/activity/${activityId}`,
        async msg => {
          const payload = JSON.parse(msg.body);
          setLiveActivityUpdate(payload);

          // On NEXT_QUESTION, submit answer if present, then advance
          if (payload.status === "NEXT_QUESTION" && payload.payload?.questionIndex !== undefined) {
            if (pendingAnswer !== null) {
              await submitPendingAnswer();
            }
            setPendingAnswer(null);
            setWaitingForTeacher(false);
            setIndex(payload.payload.questionIndex);
            setProgress(((payload.payload.questionIndex + 1) / questions.length) * 100);
            fetchLeaderboard();
          }
          // Handle FINISH_QUIZ event for all users
          if (payload.status === "FINISH_QUIZ") {
            if (pendingAnswer !== null) {
              await submitPendingAnswer();
              setPendingAnswer(null);
            }
            setShowDialog(true);
            fetchLeaderboard();
            // Leave lobby/game room for all users after quiz finishes
            try {
              if (activityId && userId) {
                await API.delete(`/lobby/${activityId}/leave`, { params: { userId } });
              }
            } catch (e) {}
            // Unsubscribe and return to lobby (call onLeave)
            setTimeout(() => {
              if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
              if (stompClientRef.current && stompClientRef.current.connected) stompClientRef.current.disconnect();
              if (onLeave) onLeave({ completed: true });
            }, 1200);
          }
        }
      );
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
      if (stompClientRef.current?.connected) stompClientRef.current.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, questions.length, pendingAnswer]);

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
    if (!activityId) return;
    API.get(`/questions/liveactivities/${activityId}`)
      .then(res => {
        setQuestions(Array.isArray(res.data) && res.data.length ? res.data : mockQuestions);
      })
      .catch(() => setQuestions(mockQuestions));
  }, [activityId]);

  // Fetch leaderboard from API
  async function fetchLeaderboard() {
    if (!activityId) return;
    try {
      const res = await API.get(`/scores/live-activities/${activityId}/leaderboard`);
      if (Array.isArray(res.data)) {
        // Deduplicate by userId, keep highest score
        const unique = {};
        res.data.forEach(entry => {
          const id = entry.userId;
          const score = entry.score ?? entry.totalScore ?? 0;
          if (!unique[id] || unique[id].score < score) {
            unique[id] = {
              userId: id,
              name: entry.name || `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim(),
              score
            };
          }
        });
        setLeaderboard(Object.values(unique));
      }
    } catch (e) {}
  }

  // Fetch leaderboard on mount, on question index change, and every 5 seconds
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    //Test Purposes
    //const interval = setInterval(fetchLeaderboard, 500000);
    return () => clearInterval(interval);
  }, [activityId, index]);

  // --- Helper to submit answer depending on game type ---
  async function submitPendingAnswer() {
    if (!userId || !q) return;
    try {
      if (q.gameType === 'GAME1' || q.gameType === 'GAME3') {
        console.log('Pending answer submitted:', pendingAnswer, 'userId:', userId, 'questionId:', q.questionId);
        await API.post(
          `/scores/award/questions/${q.questionId}/users/${userId}?selectedChoiceId=${pendingAnswer}`
        );
      } else if (q.gameType === 'GAME2') {
        console.log('Pending answer submitted:', pendingAnswer, 'userId:', userId, 'questionId:', q.questionId);
        await API.post(
          `/scores/award/translation/questions/${q.questionId}/users/${userId}`,
          Array.isArray(pendingAnswer) ? pendingAnswer : []
        );
      }
      await fetchLeaderboard();
    } catch (err) {
      if (err.response) {
        console.error('Award score error:', err.response.status, err.response.data);
      } else {
        console.error('Award score error:', err);
      }
    }
  }

  useEffect(() => {
    if (!questions.length) return;
    const q = questions[index];
    if (q.gameType === 'GAME2') {
      setShuffledChoices(shuffleArray(q.choices || []));
      setSelected([]);
    } else {
      setShuffledOptions(shuffleArray(q.choices || []));
    }
    setPendingAnswer(null);
    setWaitingForTeacher(false);
  }, [questions, index]);

  if (!activityId) return <div style={{ padding: 24, color: 'red' }}>No activity ID provided.</div>;
  if (!questions.length) return <Typography>Loading or no questions available.</Typography>;

  const q = questions[index];

  const synthesizeSpeech = async text => {
    try {
      const response = await APItts.post('/synthesize', { text }, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      new Audio(url).play();
    } catch {}
  };

  // --- Choice handlers: store answer locally, disable input, show waiting for teacher ---
  const handleChoice = choice => {
    if (waitingForTeacher || pendingAnswer !== null) return;
    setPendingAnswer(choice.choiceId);
    setWaitingForTeacher(userRole !== 'TEACHER');
  };

  // Update handleSelect and handleRemove to always update pendingAnswer for GAME2
  const handleSelect = choice => {
    if (waitingForTeacher) return;
    setSelected(prev => {
      if (prev.includes(choice.choiceId)) return prev;
      const updated = [...prev, choice.choiceId];
      if (q && q.gameType === 'GAME2') setPendingAnswer(updated);
      return updated;
    });
  };
  const handleRemove = id => {
    if (waitingForTeacher) return;
    setSelected(prev => {
      const updated = prev.filter(cid => cid !== id);
      if (q && q.gameType === 'GAME2') setPendingAnswer(updated);
      return updated;
    });
  };

  const handleSubmit = () => {
    if (waitingForTeacher || !selected.length) return;
    setPendingAnswer([...selected]);
    setWaitingForTeacher(userRole !== 'TEACHER');
  };

  const handleNext = () => {
    if (index < questions.length - 1) {
      API.post(
        `/lobby/${activityId}/next-question`,
        null,
        { params: { questionIndex: index + 1, teacherId: userId } }
      ).catch(() => {});
    }
  };

  const handleLeave = async () => {
    if (!activityId || !userId) return;
    try {
      await API.delete(`/lobby/${activityId}/leave`, { params: { userId } });
      if (onLeave) onLeave();
      else window.location.reload();
    } catch {
      onLeave?.();
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    if (onLeave) onLeave();
    else window.location.reload();
  };

  // --- Leaderboard block, always rendered at the top of the question area ---
  const leaderboardBlock = leaderboard.length > 0 && (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Typography variant="h6">Leaderboard</Typography>
      {leaderboard.map(entry => (
        <Typography key={entry.userId}>
          {entry.name}: {entry.score}
        </Typography>
      ))}
    </Box>
  );

  // Render per game type
  function renderGame() {
    if (!q) return null;
    if (q.gameType === 'GAME1') {
      // One Pic Four Words
      return (
        <PastelContainer>
          {leaderboardBlock}
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
            One Pic Four Words
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
            <MuiStack direction="row">
              <Box sx={{ minHeight: 250, minWidth: 100, backgroundImage: `url(${bunnyStand})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
              <Box sx={{ height: '180px', width: '250px', minWidth: 100, maxWidth: 400, backgroundImage: `url(${speechBubble})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Grid>
                  <MuiStack direction="column" alignItems="center">
                    <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34', maxWidth: '80%', marginBottom: 4 }}>
                      Can you tell me what is this?
                    </Typography>
                  </MuiStack>
                </Grid>
              </Box>
              {q.questionImage && (
                <Box sx={{ textAlign: 'center', mb: 2, minWidth: 300, minHeight: 300 }}>
                  <img src={`data:image/png;base64,${q.questionImage}`} alt="quiz" style={{ width: 200, height: 200 }} />
                </Box>
              )}
            </MuiStack>
          </Grid>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            {shuffledOptions.map((choice, i) => (
              <Grid item xs={6} key={choice.choiceId} sx={{ minHeight: 150, minWidth: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChoiceButton
                  onClick={() => handleChoice(choice)}
                  sx={{ fontSize: '3rem', height: '100%', backgroundColor: pastels[i % pastels.length], '&:hover': { scale: 1.05 } }}
                  disabled={pendingAnswer !== null}
                >
                  {choice.choiceText}
                </ChoiceButton>
              </Grid>
            ))}
          </Grid>
          {waitingForTeacher && userRole !== 'TEACHER' && (
            <Typography sx={{ mt: 3, fontSize: 28, color: '#2E2E34', textAlign: 'center' }}>Waiting for teacher...</Typography>
          )}
        </PastelContainer>
      );
    } else if (q.gameType === 'GAME2') {
      // Phrase Translation
      return (
        <PastelContainer>
          {leaderboardBlock}
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
            Phrase Translation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <PastelProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>
              {index + 1} / {questions.length}
            </Typography>
          </Box>
          <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MuiStack direction="row">
              <Box sx={{ minHeight: 250, minWidth: 100, backgroundImage: `url(${bunnyStand})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
              <Box sx={{ minHeight: 250, minWidth: 100, maxWidth: 400, backgroundImage: `url(${speechBubble})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', justifyItems: 'center' }}>
                <Grid>
                  <MuiStack direction="column" alignItems="center" sx={{ padding: 2 }}>
                    <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                      What does
                    </Typography>
                    <MuiStack direction="row" alignItems="center" sx={{ flexWrap: 'wrap' }}>
                      <Typography variant="h3" sx={{ textAlign: 'center', color: '#E6bbad', textShadow: '-1px -1px 0 #bb998f, 1px -1px 0 #bb998f, -1px 1px 0 #bb998f, 1px 1px 0 #bb998f' }}>
                        {q.questionDescription}
                      </Typography>
                      <IconButton onClick={() => synthesizeSpeech(q.questionDescription)}>
                        <VolumeUpIcon sx={{ fontSize: 32, color: '#2E2E34' }} />
                      </IconButton>
                    </MuiStack>
                    <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                      mean?
                    </Typography>
                  </MuiStack>
                </Grid>
              </Box>
            </MuiStack>
          </Grid>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2, minHeight: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: '#BBDEFB', p: 1, borderRadius: 1, marginBottom: 4 }}>
            {selected.map(id => {
              const choice = q.choices.find(c => c.choiceId === id) || {};
              return (
                <Chip
                  key={id}
                  label={choice.choiceText}
                  onDelete={() => handleRemove(id)}
                  onClick={() => handleRemove(id)}
                  deleteIcon={<CloseIcon sx={{ color: '#bb998f', fontSize: 28, '&:hover': { color: '#E6bbad' } }} />}
                  sx={{ m: 0.5, backgroundColor: '#FFECB3', color: '#2E2E34', fontSize: '2rem', minHeight: 70, minWidth: 50, paddingRight: '8px', '& .MuiChip-label': { fontSize: '2rem', paddingRight: '6px' } }}
                  disabled={pendingAnswer !== null && userRole !== 'TEACHER'}
                />
              );
            })}
          </Box>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            {shuffledChoices.map((c, i) => (
              <Grid item xs={6} key={c.choiceId} sx={{ minHeight: 150, minWidth: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChoiceButton
                  onClick={() => handleSelect(c)}
                  variant={selected.includes(c.choiceId)}
                  disabled={selected.includes(c.choiceId) || waitingForTeacher}
                  sx={{ backgroundColor: pastels[i % pastels.length], fontSize: '3rem', height: '100%' }}
                >
                  {c.choiceText}
                </ChoiceButton>
              </Grid>
            ))}
          </Grid>
          {waitingForTeacher && userRole !== 'TEACHER' && (
            <Typography sx={{ mt: 3, fontSize: 28, color: '#2E2E34', textAlign: 'center' }}>Waiting for teacher...</Typography>
          )}
        </PastelContainer>
      );
    } else if (q.gameType === 'GAME3') {
      // Word Translation
      return (
        <PastelContainer>
          {leaderboardBlock}
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E2E34', mb: 1 }}>
            Word Translation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <PastelProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="body2" sx={{ ml: 2, color: '#2E2E34' }}>
              {index + 1} / {questions.length}
            </Typography>
          </Box>
          <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '10vh' }}>
            <MuiStack direction="row">
              <Box sx={{ minHeight: 250, minWidth: 100, backgroundImage: `url(${bunnyStand})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
              <Box sx={{ minHeight: 250, minWidth: 300, backgroundImage: `url(${speechBubble})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', justifyItems: 'center' }}>
                <Grid>
                  <MuiStack direction="column" alignItems="center" sx={{ paddingTop: 5 }}>
                    <Typography variant="h4" sx={{ textAlign: 'center', color: '#2E2E34' }}>
                      What does this mean?
                    </Typography>
                    <MuiStack direction="row" alignItems="center">
                      <Typography variant="h3" sx={{ textAlign: 'center', color: '#E6bbad', textShadow: '-1px -1px 0 #bb998f, 1px -1px 0 #bb998f, -1px 1px 0 #bb998f, 1px 1px 0 #bb998f' }}>
                        {q.questionText}
                      </Typography>
                      <IconButton onClick={() => synthesizeSpeech(q.questionText)}>
                        <VolumeUpIcon sx={{ fontSize: 32, color: '#2E2E34' }} />
                      </IconButton>
                    </MuiStack>
                  </MuiStack>
                </Grid>
              </Box>
            </MuiStack>
          </Grid>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            {shuffledOptions.map((choice, i) => (
              <Grid item xs={6} key={choice.choiceId} sx={{ minHeight: 150, minWidth: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChoiceButton
                  onClick={() => handleChoice(choice)}
                  sx={{ fontSize: '3rem', height: '100%', backgroundColor: pastels[i % pastels.length], '&:hover': { scale: 1.05 } }}
                  disabled={pendingAnswer !== null}
                >
                  {choice.choiceText}
                </ChoiceButton>
              </Grid>
            ))}
          </Grid>
          {waitingForTeacher && userRole !== 'TEACHER' && (
            <Typography sx={{ mt: 3, fontSize: 28, color: '#2E2E34', textAlign: 'center' }}>Waiting for teacher...</Typography>
          )}
        </PastelContainer>
      );
    }
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
      }}
    >
      <button
        onClick={handleLeave}
        style={{
          position: 'absolute',
          top: 24,
          right: 32,
          background: '#FF5252',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 1400,
        }}
      >
        Leave
      </button>
      <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', mt: 4 }}>
        {renderGame()}
      </Box>
      {/* Teacher-only Next/Finish button, only if not in completion dialog */}
      {userRole === 'TEACHER' && !showDialog && (
        index < questions.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            sx={{ position: 'fixed', bottom: 40, right: 60, zIndex: 1500, fontSize: 22, px: 4, py: 2, borderRadius: 3 }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              // Teacher triggers FINISH_QUIZ for all users
              if (userRole === 'TEACHER') {
                await API.post(`/lobby/${activityId}/finish-quiz`, null, { params: { teacherId: userId } }).catch(() => {});
              }
            }}
            sx={{ position: 'fixed', bottom: 40, right: 60, zIndex: 1500, fontSize: 22, px: 4, py: 2, borderRadius: 3 }}
          >
            Finish
          </Button>
        )
      )}
      <Dialog open={showDialog} onClose={handleDialogClose}>
        <DialogTitle>🎉 Quiz Complete!</DialogTitle>
        <DialogContent>
          <Typography>Your final scores:</Typography>
          {leaderboard.length > 0 ? (
            leaderboard.map(entry => (
              <Typography key={entry.userId}>
                {entry.name}: {entry.score}
              </Typography>
            ))
          ) : (
            <Typography>No leaderboard data.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}