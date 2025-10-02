// MultiplayerGameRoom.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack as MuiStack
} from '@mui/material';
import { styled } from '@mui/system';
import modalBg from '../../assets/images/backgrounds/activity-select-bg.png';
import bunnyStand from '../../assets/images/characters/lingguahey-char1-stand.png';
import { mockQuestions } from './mockQuestions';
import MultiplayerGameRoomGameContent from './MultiplayerGameRoomGameContent';

import char_1 from '../../assets/images/characters/lingguahey-char1-wave.png';
import char_2 from '../../assets/images/characters/lingguahey-char1-stand.png';

// --- Global Constants (Outside Component) ---
const CHARACTERS = [
  { value: 1, img: char_1, label: 'Char 1' },
  { value: 2, img: char_2, label: 'Char 2' },
];

const CHARACTER_MAP = CHARACTERS.reduce((map, char) => {
  map[char.value] = char.img;
  return map;
}, {});

const pastels = [
  '#FFCDD2', // light red
  '#C8E6C9', // light green
  '#BBDEFB', // light blue
  '#FFF9C4', // light yellow
  '#D1C4E9', // light purple
];

// --- Styled Components (Outside Component) ---
const PastelContainer = styled(Box)(() => ({
  backgroundImage: `url(${modalBg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  padding: '12px',
  minHeight: 0,
  minWidth: 0,
  width: '100%',
  height: '100%',
  maxWidth: '100%',
  maxHeight: '100%',
  overflow: 'auto',
  fontFamily: 'Comic Sans MS, sans-serif',
  borderRadius: '20px',
  boxSizing: 'border-box',
}));

const ChoiceButton = styled(Button)(() => ({
  color: '#2E2E34',
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '12px',
  padding: '4px 8px',
  margin: '6px',
  width: '200px',
  height: '200px',
  minWidth: '200px',
  maxWidth: '200px',
  minHeight: '200px',
  maxHeight: '200px',
  fontSize: '1.1rem',
  display: 'grid',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFF',
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

export default function MultiplayerGameRoom({ activityId: propActivityId, onLeave, initialUsers }) {
  const token = localStorage.getItem('token');
  let activityId = propActivityId;
  const { state } = useLocation();
  if (!activityId && state?.activityId) activityId = state.activityId;
  const userId = getUserFromToken()?.userId;

  // --- START: ALL HOOKS MUST BE AT THE TOP LEVEL ---

  // 1. State Hooks
  const [userRole, setUserRole] = useState(null);
  const [liveActivityUpdate, setLiveActivityUpdate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [lastConfirmedIndex, setLastConfirmedIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardInitialized, setLeaderboardInitialized] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [waitingForTeacher, setWaitingForTeacher] = useState(false);

  // 2. Ref Hooks
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const lastConfirmedRef = useRef(-1);
  const pendingAnswerRef = useRef(null);

  // 3. Callback Hook (Ref Setter)
  const setPendingAnswerAndRef = useCallback((answer) => {
    setPendingAnswer(answer);
    pendingAnswerRef.current = answer;
  }, []);

  // 4. Constant Definitions (Axios instance)
  const APItts = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/tts`,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/octet-stream',
      Authorization: `Bearer ${token}`,
    },
  });


  // 5. useEffect and useCallback Definitions

  // Initial user role fetch
  useEffect(() => {
    if (!userId) return;
    API.get(`/users/${userId}`)
      .then(res => {
        const role = res.data?.role?.toUpperCase?.();
        setUserRole(role);
      })
      .catch(() => setUserRole(null));
  }, [userId]);

  // TTS function
  const synthesizeSpeech = useCallback(async text => {
    try {
      const response = await APItts.post('/synthesize', { text }, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      new Audio(url).play();
    } catch { }
  }, [APItts]);

  // Leaderboard Update Logic (Extracted for use by both REST and WebSocket)
  const updateLeaderboardState = useCallback((scoresArr, initialUsers, initialized, setLeaderboard, setLeaderboardInitialized) => {
    const scoreMap = {};
    scoresArr.forEach(entry => {
      const id = entry.userId;
      const score = entry.score ?? entry.totalScore ?? 0;
      const picInt = entry.profilePic;
      const profileCharacterUrl = CHARACTER_MAP[picInt] || null;

      scoreMap[id] = {
        score,
        picInt,
        profileCharacterUrl,
        name: entry.name || `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim(),
        role: entry.role,
      };
    });

    if (!initialized) {
      const usersArr = Array.isArray(initialUsers) ? initialUsers : [];
      const merged = usersArr.map(user => {
        const id = user.userId;
        const scoreUpdate = scoreMap[id];
        const score = scoreUpdate ? scoreUpdate.score : 0;
        const fallbackPicInt = user.profilePic || 1;
        const profileCharacterUrl = scoreUpdate?.profileCharacterUrl
          || CHARACTER_MAP[fallbackPicInt]
          || bunnyStand;

        return {
          userId: id,
          name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
          score,
          role: user.role,
          profileCharacterUrl,
        };
      });
      scoresArr.forEach(entry => {
        if (!merged.find(u => u.userId === entry.userId)) {
          merged.push({
            userId: entry.userId,
            name: scoreMap[entry.userId].name,
            score: scoreMap[entry.userId].score,
            role: scoreMap[entry.userId].role,
            profileCharacterUrl: scoreMap[entry.userId].profileCharacterUrl,
          });
        }
      });

      setLeaderboard(merged);
      setLeaderboardInitialized(true);
    } else {
      setLeaderboard(prev => {
        const updatedLeaderboard = prev.map(user => {
          const scoreUpdate = scoreMap[user.userId];
          if (scoreUpdate) {
            return {
              ...user,
              score: scoreUpdate.score,
              profileCharacterUrl: scoreUpdate.profileCharacterUrl || user.profileCharacterUrl,
            };
          }
          return user;
        });

        const prevUserIdMap = prev.reduce((map, user) => {
          map[user.userId] = true;
          return map;
        }, {});

        scoresArr.forEach(entry => {
          if (!prevUserIdMap[entry.userId]) {
            const newUserData = scoreMap[entry.userId];
            updatedLeaderboard.push({
              userId: entry.userId,
              name: newUserData.name,
              score: newUserData.score,
              role: newUserData.role,
              profileCharacterUrl: newUserData.profileCharacterUrl,
            });
          }
        });

        return updatedLeaderboard;
      });
    }
  }, [initialUsers]);

  // Fetch Leaderboard logic (Used for initial load and fallback sync only)
  const fetchLeaderboard = useCallback(async () => {
    if (!activityId) return;
    try {
      const scoresRes = await API.get(`/scores/live-activities/${activityId}/leaderboard`);
      const scoresArr = Array.isArray(scoresRes.data) ? scoresRes.data : [];

      updateLeaderboardState(scoresArr, initialUsers, leaderboardInitialized, setLeaderboard, setLeaderboardInitialized);

    } catch (e) {
      console.error(e);
    }
  }, [activityId, leaderboardInitialized, initialUsers, updateLeaderboardState]);

  // Submit Answer logic
  const submitPendingAnswer = useCallback(async () => {
    const answerToSubmit = pendingAnswerRef.current;
    const currentQuestion = questions[index];

    if (!userId || !currentQuestion || answerToSubmit === null) return;

    try {
      if (currentQuestion.gameType === 'GAME1' || currentQuestion.gameType === 'GAME3') {
        await API.post(
          `/scores/award/questions/${currentQuestion.questionId}/users/${userId}?selectedChoiceId=${answerToSubmit}`
        );
      } else if (currentQuestion.gameType === 'GAME2') {
        await API.post(
          `/scores/award/translation/questions/${currentQuestion.questionId}/users/${userId}`,
          Array.isArray(answerToSubmit) ? answerToSubmit : []
        );
      }

      // ----------------------------------------------------------------------
      // REAL-TIME PUSH: Tell the server an answer was submitted. The server 
      // should calculate the leaderboard and PUSH the update via WebSocket.
      // ----------------------------------------------------------------------
      if (stompClientRef.current?.connected) {
        stompClientRef.current.send(`/app/leaderboard/trigger/${activityId}`, {}, '');
      }

      pendingAnswerRef.current = null;
      setPendingAnswer(null);
    } catch (err) {
      if (err.response) {
        console.error('Award score error:', err.response.status, err.response.data);
      } else {
        console.error('Award score error:', err);
      }
    }
  }, [userId, questions, index, activityId]);

  // WebSocket connection
  useEffect(() => {
    let isSubscribed = true;

    async function connectWebSocket() {
      if (!activityId || !userId || questions.length === 0) return;

      if (stompClientRef.current?.connected) {
        try {
          subscriptionRef.current?.unsubscribe();
          stompClientRef.current.disconnect();
        } catch (err) { }
      }

      const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`);
      const client = Stomp.over(socket);
      client.debug = () => { };
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        await new Promise((resolve, reject) => {
          client.connect(
            headers, // Headers
            () => {
              if (!isSubscribed) {
                client.disconnect();
                return;
              }

              stompClientRef.current = client;
              subscriptionRef.current = client.subscribe(
                `/topic/activity/${activityId}`,
                async msg => {
                  if (!isSubscribed) return;

                  const payload = JSON.parse(msg.body);
                  setLiveActivityUpdate(payload);

                  // -----------------------------------------------------
                  // REAL-TIME HANDLER: Process PUSHED leaderboard data
                  // -----------------------------------------------------
                  if (payload.status === "LEADERBOARD_UPDATE" && payload.payload?.leaderboard) {
                    updateLeaderboardState(
                      payload.payload.leaderboard,
                      initialUsers,
                      leaderboardInitialized,
                      setLeaderboard,
                      setLeaderboardInitialized
                    );
                    return;
                  }

                  if (payload.status === "NEXT_QUESTION" && payload.payload?.questionIndex !== undefined) {
                    if (pendingAnswerRef.current !== null) {
                      await submitPendingAnswer();
                    }
                    setPendingAnswerAndRef(null);
                    setWaitingForTeacher(false);

                    const nextIndex = payload.payload.questionIndex;
                    const confirmedIndex = nextIndex - 1;
                    lastConfirmedRef.current = confirmedIndex;
                    setIndex(nextIndex);
                    setLastConfirmedIndex(confirmedIndex);
                    setProgress(((confirmedIndex + 1) / questions.length) * 100);

                    // Fallback fetch just to ensure sync on question transition
                    fetchLeaderboard();
                  }
                  if (payload.status === "FINISH_QUIZ") {
                    if (pendingAnswerRef.current !== null) {
                      await submitPendingAnswer();
                    }
                    lastConfirmedRef.current = questions.length - 1;
                    setLastConfirmedIndex(questions.length - 1);
                    setProgress(100);
                    setShowDialog(true);
                    fetchLeaderboard(); // Final fetch for the end screen
                  }
                }
              );
              resolve();
            },
            error => {
              console.error('STOMP error:', error);
              reject(error);
            }
          );
        });
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
      }
    }

    connectWebSocket();

    return () => {
      isSubscribed = false;
      if (subscriptionRef.current) { try { subscriptionRef.current.unsubscribe(); } catch { } }
      if (stompClientRef.current?.connected) { try { stompClientRef.current.disconnect(); } catch { } }
      subscriptionRef.current = null;
      stompClientRef.current = null;
    };
  }, [activityId, userId, questions.length, submitPendingAnswer, setPendingAnswerAndRef, fetchLeaderboard, updateLeaderboardState, leaderboardInitialized, initialUsers]);

  // Fetch Questions
  useEffect(() => {
    if (!activityId) return;
    API.get(`/questions/liveactivities/${activityId}`)
      .then(res => {
        setQuestions(Array.isArray(res.data) && res.data.length ? res.data : mockQuestions);
        // Initial fetch only happens here after the questions/activity is loaded
        fetchLeaderboard();
      })
      .catch(() => setQuestions(mockQuestions));
  }, [activityId]);

  // -----------------------------------------------------
  // REMOVED: Leaderboard Polling useEffect
  // The previous code block:
  // useEffect(() => {
  //      fetchLeaderboard();
  //      const interval = setInterval(fetchLeaderboard, 1000);
  //      return () => clearInterval(interval);
  // }, [activityId, index, fetchLeaderboard]);
  // is now GONE. Real-time updates are handled by the WebSocket useEffect above.
  // -----------------------------------------------------

  // Reset State on Question Change
  useEffect(() => {
    if (!questions.length) return;
    const q = questions[index];
    if (q?.gameType === 'GAME2') {
      setShuffledChoices(shuffleArray(q.choices || []));
      setSelected([]);
    } else {
      setShuffledOptions(shuffleArray(q.choices || []));
    }
    setPendingAnswerAndRef(null);
    setWaitingForTeacher(false);
  }, [questions, index, setPendingAnswerAndRef]);


  // Choice Handler
  const handleChoice = useCallback(choice => {
    if (userRole !== 'TEACHER') {
      setPendingAnswerAndRef(choice.choiceId);
      setWaitingForTeacher(true);
    }
  }, [userRole, setPendingAnswerAndRef]);

  // Select Handler (for multi-select/ordering games)
  const handleSelect = useCallback(choice => {
    const currentQ = questions[index];
    if (waitingForTeacher) return;
    setSelected(prev => {
      if (prev.includes(choice.choiceId)) return prev;
      const updated = [...prev, choice.choiceId];
      if (currentQ?.gameType === 'GAME2') setPendingAnswerAndRef(updated);
      return updated;
    });
  }, [waitingForTeacher, questions, index, setPendingAnswerAndRef]);

  // Remove Handler (for multi-select/ordering games)
  const handleRemove = useCallback(id => {
    const currentQ = questions[index];
    if (waitingForTeacher) return;
    setSelected(prev => {
      const updated = prev.filter(cid => cid !== id);
      if (currentQ?.gameType === 'GAME2') setPendingAnswerAndRef(updated);
      return updated;
    });
  }, [waitingForTeacher, questions, index, setPendingAnswerAndRef]);

  // Submit Handler (for multi-select/ordering games)
  const handleSubmit = useCallback(() => {
    if (waitingForTeacher || !selected.length) return;
    setPendingAnswerAndRef([...selected]);
    setWaitingForTeacher(userRole !== 'TEACHER');
  }, [waitingForTeacher, selected, userRole, setPendingAnswerAndRef]);

  // --- END: ALL HOOKS MUST BE AT THE TOP LEVEL ---


  // --- START: NON-HOOK LOGIC AND EARLY RETURNS ---

  // Define function handlers that don't need to be memoized or are not hooks
  const handleNext = () => {
    if (index < questions.length - 1) {
      const currentIndex = index;
      const nextIndex = currentIndex + 1;

      lastConfirmedRef.current = currentIndex;
      setLastConfirmedIndex(currentIndex);
      setProgress(((currentIndex + 1) / questions.length) * 100);

      API.post(
        `/lobby/${activityId}/next-question`,
        null,
        { params: { questionIndex: nextIndex, teacherId: userId } }
      ).catch(() => { });
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

  const handleDialogClose = async () => {
    setShowDialog(false);

    try {
      await API.delete(`/lobby/${activityId}/leave`, { params: { userId } });

      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClientRef.current?.connected) stompClientRef.current.disconnect();

      if (onLeave) onLeave({ completed: true });
      else window.location.reload();
    } catch (error) {
      console.error('Error ending activity or leaving:', error);
      if (onLeave) onLeave({ completed: true });
      else window.location.reload();
    }
  };

  // --- EARLY RETURN CHECKS (Must be AFTER all hooks) ---
  if (!activityId) return <div style={{ padding: 24, color: 'red' }}>No activity ID provided.</div>;

  if (!questions.length) return <Typography>Loading or no questions available.</Typography>;

  const q = questions[index];

  // --- JSX RENDER BLOCK ---

  // Leaderboard block definition
  const leaderboardBlock = (
    <Box sx={{
      mt: 3,
      mb: 2,
      width: '100%',
      height: '85vh',
      minHeight: '600px',
      position: 'relative',
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h6" sx={{
        mb: '2vh',
        fontWeight: 'bold',
        color: '#2E2E34',
        fontSize: 'clamp(1rem, 2vw, 1.5rem)'
      }}>
        Leaderboard - King of the Hill
      </Typography>
      <Box sx={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: '90%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, #81d4fa 0%, #a5d6a7 60%, #8bc34a 100%)',
        borderTopLeftRadius: '35%',
        borderTopRightRadius: '35%',
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)'
      }} />
      <Box sx={{
        position: 'absolute',
        left: '50%',
        top: '12%',
        transform: 'translateX(-50%)',
        width: 'clamp(35px, 6vw, 55px)',
        height: 'clamp(35px, 6vw, 55px)',
        backgroundImage: 'url(/crown.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        zIndex: 1,
        filter: 'drop-shadow(0 2px 8px rgba(255,215,0,0.6))',
      }} />
      <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '90%', zIndex: 1 }}>
        {[...leaderboard]
          .filter(entry => entry.role?.toUpperCase() !== 'TEACHER')
          .sort((a, b) => b.score - a.score)
          .map((entry, idx, arr) => {
            const maxPossiblePoints = questions.length;
            const heightPercent = maxPossiblePoints > 0 ? Math.min(1, entry.score / maxPossiblePoints) : 0;
            const maxHeight = '70%';
            const y = `calc(${maxHeight} * ${heightPercent})`;
            const angle = (idx * (2 * Math.PI / arr.length)) + (heightPercent * Math.PI * 2);
            const radius = `${30 - (heightPercent * 10)}%`;
            const horizontalOffset = `calc(${Math.sin(angle)} * ${radius})`;
            const baseX = `calc(50% + ${horizontalOffset} + ${idx * 2}%)`;

            const isLeader = idx === 0 && entry.score > 0;

            return (
              <Box
                key={entry.userId}
                sx={{
                  position: 'absolute',
                  left: baseX,
                  bottom: y,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 70,
                  transform: `translateX(-50%) ${isLeader ? 'scale(1.1)' : 'scale(1)'}`,
                  transition: 'all 0.5s cubic-bezier(.4,0,.2,1)',
                  zIndex: isLeader ? 2 : 1,
                }}
              >
                <Typography sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isLeader ? '#ffd700' : '#2E2E34',
                  textAlign: 'center',
                  maxWidth: 70,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textShadow: isLeader ? '0 0 4px rgba(255,215,0,0.5)' : 'none',
                  mb: 0.5
                }}>
                  {entry.name}
                </Typography>
                <Box
                  component="img"
                  src={entry.profileCharacterUrl || bunnyStand}
                  alt="character"
                  sx={{
                    height: 60,
                    width: 'auto',
                    objectFit: 'contain',
                    filter: isLeader ? 'drop-shadow(0 0 8px #ffd700)' : 'none',
                    transform: isLeader ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                />
                <Typography sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isLeader ? '#ffd700' : '#2E2E34',
                  textShadow: isLeader ? '0 0 4px rgba(255,215,0,0.5)' : 'none',
                  mt: 0.5
                }}>
                  {entry.score}
                </Typography>
              </Box>
            );
          })}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #FFECB3 30%, #E1F5FE 90%)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
      }}
    >
      <Button
        onClick={handleLeave}
        sx={{
          position: 'absolute',
          top: 24,
          right: 32,
          background: '#FF5252',
          color: 'white',
          border: 'none',
          borderRadius: 2,
          px: 3,
          py: 1.5,
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 1400,
          '&:hover': { background: '#ff1744' },
        }}
      >
        Leave
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: 1920, height: 520, justifyContent: 'center', alignItems: 'center', gap: 0 }}>
        <Box sx={{ width: 850, height: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 4, boxShadow: 2, alignItems: 'center', justifyContent: 'flex-start', minWidth: 0, p: 3, ml: 0 }}>
          <MultiplayerGameRoomGameContent
            q={q}
            progress={progress}
            index={index}
            questions={questions}
            shuffledOptions={shuffledOptions}
            shuffledChoices={shuffledChoices}
            selected={selected}
            handleChoice={handleChoice}
            handleSelect={handleSelect}
            handleRemove={handleRemove}
            handleSubmit={handleSubmit}
            pendingAnswer={pendingAnswer}
            userRole={userRole}
            waitingForTeacher={waitingForTeacher}
            pastels={pastels}
            synthesizeSpeech={synthesizeSpeech}
          />
        </Box>
        <Box sx={{ width: 850, height: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 4, boxShadow: 2, alignItems: 'center', justifyContent: 'flex-start', minWidth: 0, p: 3, ml: 0 }}>
          {leaderboardBlock}
        </Box>
      </Box>
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
              if (userRole === 'TEACHER') {
                setLastConfirmedIndex(questions.length - 1);
                setProgress(100);
                await API.post(`/lobby/${activityId}/finish-quiz`, null, { params: { teacherId: userId } }).catch(() => { });
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
            [...leaderboard].sort((a, b) => b.score - a.score).map((entry, idx) => (
              <Typography key={entry.userId} sx={{ fontWeight: idx === 0 ? 'bold' : 'normal' }}>
                {idx + 1}. {entry.name}: {entry.score}
              </Typography>
            ))
          ) : (
            <Typography>No scores available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export { PastelContainer, PastelProgress, ChoiceButton };