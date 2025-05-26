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

const pastels = [
  '#FFCDD2', // light red
  '#C8E6C9', // light green
  '#BBDEFB', // light blue
  '#FFF9C4', // light yellow
  '#D1C4E9', // light purple
];

// --- PastelContainer: update to fit parent box strictly ---
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
  //console.log('Initial users:', initialUsers);
  const token = localStorage.getItem('token');
  let activityId = propActivityId;
  const { state } = useLocation();
  if (!activityId && state?.activityId) activityId = state.activityId;
  const userId = getUserFromToken()?.userId;

  const [userRole, setUserRole] = useState(null);
  const [liveActivityUpdate, setLiveActivityUpdate] = useState(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // State for managing game
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [lastConfirmedIndex, setLastConfirmedIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const lastConfirmedRef = useRef(-1); // Add ref to track last confirmed index

  const [leaderboard, setLeaderboard] = useState([]); 
  const [leaderboardInitialized, setLeaderboardInitialized] = useState(false); // Track if initialUsers have been used
  
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
            
            // Update index and progress together to ensure they stay in sync
            const nextIndex = payload.payload.questionIndex;
            const confirmedIndex = lastConfirmedRef.current;
            setIndex(nextIndex);
            setLastConfirmedIndex(confirmedIndex);
            setProgress(((confirmedIndex + 1) / questions.length) * 100);
            
            fetchLeaderboard();
          }
          // Handle FINISH_QUIZ event for all users
          if (payload.status === "FINISH_QUIZ") {
            if (pendingAnswer !== null) {
              await submitPendingAnswer();
              setPendingAnswer(null);
            }
            lastConfirmedRef.current = questions.length - 1;
            setLastConfirmedIndex(questions.length - 1);
            setProgress(100);
            setShowDialog(true);
            fetchLeaderboard();
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

  // Fetch leaderboard from API and merge with initial users
  async function fetchLeaderboard() {
    if (!activityId) return;
    try {
      const scoresRes = await API.get(`/scores/live-activities/${activityId}/leaderboard`);
      const scoresArr = Array.isArray(scoresRes.data) ? scoresRes.data : [];
      // On first call, use initialUsers; after that, only update scores
      if (!leaderboardInitialized) {
        const usersArr = Array.isArray(initialUsers) ? initialUsers : [];
        const scoreMap = {};
        scoresArr.forEach(entry => {
          const id = entry.userId;
          const score = entry.score ?? entry.totalScore ?? 0;
          scoreMap[id] = {
            userId: id,
            name: entry.name || `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim(),
            score
          };
        });          const merged = usersArr.map(user => {
          const id = user.userId;
          return {
            userId: id,
            name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
            score: scoreMap[id]?.score ?? 0,
            role: user.role,
          };
        });
        // Add any scores for users not in initialUsers
        scoresArr.forEach(entry => {
          if (!merged.find(u => u.userId === entry.userId)) {            merged.push({
              userId: entry.userId,
              name: entry.name || `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim(),
              score: entry.score ?? entry.totalScore ?? 0,
              role: entry.role,
            });
          }
        });
        setLeaderboard(merged);
        setLeaderboardInitialized(true);
      } else {
        // Only update scores for users already in leaderboard
        setLeaderboard(prev => {
          const prevMap = {};
          prev.forEach(u => { prevMap[u.userId] = u; });
          scoresArr.forEach(entry => {
            if (prevMap[entry.userId]) {
              prevMap[entry.userId] = {
                ...prevMap[entry.userId],
                score: entry.score ?? entry.totalScore ?? 0
              };
            } else {
              // New user (edge case)
              prevMap[entry.userId] = {
                userId: entry.userId,
                name: entry.name || `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim(),
                score: entry.score ?? entry.totalScore ?? 0,
              };
            }
          });
          return Object.values(prevMap);
        });
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
        //console.log('Pending answer submitted:', pendingAnswer, 'userId:', userId, 'questionId:', q.questionId);
        await API.post(
          `/scores/award/questions/${q.questionId}/users/${userId}?selectedChoiceId=${pendingAnswer}`
        );
      } else if (q.gameType === 'GAME2') {
        //console.log('Pending answer submitted:', pendingAnswer, 'userId:', userId, 'questionId:', q.questionId);
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
    if (userRole !== 'TEACHER') {
      setPendingAnswer(choice.choiceId);
      setWaitingForTeacher(true);
    }
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
      const currentIndex = index;
      const nextIndex = currentIndex + 1;
      
      // Update progress immediately based on the current question being confirmed
      lastConfirmedRef.current = currentIndex;
      setLastConfirmedIndex(currentIndex);
      setProgress(((currentIndex + 1) / questions.length) * 100);
      
      // Then send the next question request
      API.post(
        `/lobby/${activityId}/next-question`,
        null,
        { params: { questionIndex: nextIndex, teacherId: userId } }
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
  };  const handleDialogClose = async () => {
    setShowDialog(false);
    
    try {
      // Only teachers can stop the activity
      if (userRole === 'TEACHER') {
        // Stop the activity and clear scores
        await API.post(`/lobby/${activityId}/stop`, null, { params: { teacherId: userId } });
      }
      
      // Leave lobby/game room for all users after quiz finishes
      await API.delete(`/lobby/${activityId}/leave`, { params: { userId } });
      
      // Unsubscribe and disconnect WebSocket
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      if (stompClientRef.current?.connected) stompClientRef.current.disconnect();
      
      // Return to lobby for all users
      if (onLeave) onLeave({ completed: true });
      else window.location.reload();
    } catch (error) {
      console.error('Error ending activity:', error);
      // Even if there's an error, try to redirect
      if (onLeave) onLeave({ completed: true });
      else window.location.reload();
    }
  };
  // --- Leaderboard block, now with profile characters ---
  const leaderboardBlock = (
    <Box sx={{ 
      mt: 3, 
      mb: 2, 
      width: '100%', 
      height: '85vh', // Make height taller relative to viewport
      minHeight: '600px', // Increase minimum height
      position: 'relative', 
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h6" sx={{ 
        mb: '2vh', 
        fontWeight: 'bold', 
        color: '#2E2E34',
        fontSize: 'clamp(1rem, 2vw, 1.5rem)' // Responsive font size
      }}>
        Leaderboard - King of the Hill
      </Typography>
      {/* Hill background with enhanced gradient */}
      <Box sx={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: '90%', // Taller hill background
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, #81d4fa 0%, #a5d6a7 60%, #8bc34a 100%)',
        borderTopLeftRadius: '35%',
        borderTopRightRadius: '35%',
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)'
      }} />
      {/* Crown marker */}
      <Box sx={{
        position: 'absolute',
        left: '50%',
        top: '12%', // Position crown higher
        transform: 'translateX(-50%)',
        width: 'clamp(35px, 6vw, 55px)', // Slightly larger crown
        height: 'clamp(35px, 6vw, 55px)',
        backgroundImage: 'url(/crown.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        zIndex: 1,
        filter: 'drop-shadow(0 2px 8px rgba(255,215,0,0.6))',
      }} />
      {/* Characters climbing the hill */}      <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '90%', zIndex: 1 }}>
        {[...leaderboard]
          .filter(entry => entry.role?.toUpperCase() !== 'TEACHER') // Exclude teacher from leaderboard
          .sort((a, b) => b.score - a.score)
          .map((entry, idx, arr) => {            // Calculate height based on score relative to total questions
            const maxPossiblePoints = questions.length; // One point per question
            const heightPercent = Math.min(1, entry.score / maxPossiblePoints);
            const maxHeight = '70%'; // Maximum climb height as percentage of container
            const y = `calc(${maxHeight} * ${heightPercent})`; // Height increases with score
              // Calculate horizontal position with unique path for each character
            const angle = (idx * (2 * Math.PI / arr.length)) + (heightPercent * Math.PI * 2);
            const radius = `${30 - (heightPercent * 10)}%`; // Radius decreases as they climb
            const horizontalOffset = `calc(${Math.sin(angle)} * ${radius})`;
            const baseX = `calc(50% + ${horizontalOffset} + ${idx * 2}%)`; // Center-based positioning
            
            // Is this character the leader?
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
        {/* Left: Activity/Game Content */}
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
            pendingAnswer={pendingAnswer}
            userRole={userRole}
            waitingForTeacher={waitingForTeacher}
            pastels={pastels}
            synthesizeSpeech={synthesizeSpeech}
          />
        </Box>
        {/* Right: Leaderboard Only */}
        <Box sx={{ width: 850, height: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 4, boxShadow: 2, alignItems: 'center', justifyContent: 'flex-start', minWidth: 0, p: 3, ml: 0 }}>
          {leaderboardBlock}
        </Box>
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
                setLastConfirmedIndex(questions.length - 1); // Mark all questions as confirmed
                setProgress(100); // Set progress to 100%
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
            Array.isArray(initialUsers) && initialUsers.length > 0 ? (
              initialUsers.map(user => (
                <Typography key={user.userId}>
                  {(user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim())}: 0
                </Typography>
              ))
            ) : (
              <Typography>No scores available.</Typography>
            )
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