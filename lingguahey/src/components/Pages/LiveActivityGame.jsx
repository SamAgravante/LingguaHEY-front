// src/components/Pages/LiveActivityGame.jsx
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getUserFromToken } from '../../utils/auth';
import axios from 'axios';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import char_1 from '../../assets/images/characters/lingguahey-char1-wave.png';
import char_2 from '../../assets/images/characters/lingguahey-char1-stand.png';
import MultiplayerGameRoom from './MultiplayerGameRoom';

const CHARACTERS = [
  { key: 'char_1', img: char_1, label: 'Char 1', value: 1 },
  { key: 'char_2', img: char_2, label: 'Char 2', value: 2 },
];

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LiveActivityGame = forwardRef(function LiveActivityGame({
  activityId,
  userId,
  onStarted,
  onReturn
}, ref) {
  const navigate = useNavigate();

  // ---- AUTHENTICATED API INSTANCES ----
  const token = localStorage.getItem('token');
  const USER_API = axios.create({
    baseURL: `${BASE_URL}/api/lingguahey/users`,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const LOBBY_API = axios.create({
    baseURL: `${BASE_URL}/api/lingguahey/lobby`,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // ---- STATE ----
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [localUserChar, setLocalUserChar] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [gameRoomOpen, setGameRoomOpen] = useState(false);
  const [frozenInitialUsers, setFrozenInitialUsers] = useState([]);
  const [hasDeployedActivity, setHasDeployedActivity] = useState(true); // Add this state

  const user = userId || getUserFromToken().userId;
  const role = useRef(getUserFromToken().role?.toUpperCase());
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const didInitRef = useRef(false);
  const skipCleanupRef = useRef(true);
  const onStartedRef = useRef(onStarted);
  const lastNonEmptyUsersRef = useRef([]); // Always keep the latest non-empty user list
  useEffect(() => { onStartedRef.current = onStarted; }, [onStarted]);

  // ---- FETCH USER DETAILS ----
  useEffect(() => {
    USER_API.get(`/${user}`)
      .then(res => setUserDetails(res.data))
      .catch(() => setError('Could not load user profile'));
  }, [user]);

  const disconnectWebsocket = () => {
    try {
      subscriptionRef.current?.unsubscribe();
    } catch {}
    try {
      stompClientRef.current?.disconnect();
    } catch {}
  };

  // ---- LOBBY JOIN & WEBSOCKET ----
  useEffect(() => {
    if (!activityId || !user || !hasJoined || didInitRef.current) return;
    didInitRef.current = true;
    setJoining(true);
    setError('');

    // 1) Join via REST
    LOBBY_API.post(`/${activityId}/join`, { character: selectedChar }, { params: { userId: user } })
      .then(() => LOBBY_API.get(`/${activityId}/users`))
      .then(res => {
        setUsers(res.data);
        const me = res.data.find(u => u.userId === user);
        if (!me?.character && selectedChar) setLocalUserChar(selectedChar);
      })
      .catch(err => {
        if (err.response?.status === 409) {
          // already joined: refresh users
          LOBBY_API.get(`/${activityId}/users`)
            .then(r => setUsers(r.data))
            .catch(() => setError('Failed to fetch lobby users'));
        } else {
          setError('Failed to join lobby or fetch users');
        }
      })
      .finally(() => setJoining(false));

    // 2) STOMP via SockJS
    const socket = new SockJS(`${BASE_URL}/ws`);
    const client = Stomp.over(socket);
    client.debug = () => {};
    stompClientRef.current = client;

    client.connect({}, () => {
      subscriptionRef.current = client.subscribe(
        `/topic/lobby/${activityId}`,
        msg => {
          console.log('[STOMP] Received message:', msg.body); // Debug log
          let payload;
          try { payload = JSON.parse(msg.body); } catch { return; }
          if (Array.isArray(payload.users)) {
            setUsers(payload.users);
            if (payload.users.length > 0) lastNonEmptyUsersRef.current = payload.users;
            const me = payload.users.find(u => u.userId === user);
            if (me?.role && role.current !== me.role.toUpperCase()) role.current = me.role.toUpperCase();
            if (!me?.character && selectedChar) setLocalUserChar(selectedChar);
            return;
          }
          if (payload.type === 'JOIN' && payload.user) {
            setUsers(prev => prev.some(u => u.userId === payload.user.userId) ? prev : [...prev, payload.user]);
          }
          if (payload.type === 'START') {
            console.log('users at START (from ref):', lastNonEmptyUsersRef.current); // Log the correct user list
            setFrozenInitialUsers(lastNonEmptyUsersRef.current); // Freeze the latest non-empty user list
            setGameRoomOpen(true);
            // onStartedRef.current?.();
            // navigate('/multiplayer', { state: { activityId } }); // <-- Remove this line to prevent redirect
          }
        }
      );
    }, () => setError('WebSocket connection failed'));

    return () => {
      if (skipCleanupRef.current) { skipCleanupRef.current = false; return; }
      LOBBY_API.delete(`/${activityId}/leave`, { params: { userId: user } })
        .finally(() => {
          subscriptionRef.current?.unsubscribe();
          stompClientRef.current?.disconnect();
        });
    };
  }, [activityId, user, hasJoined, selectedChar]);

  // ---- HANDLERS ----
  const handleStart = () => {
    setStarting(true);
    LOBBY_API.post(`/${activityId}/start`, null, { params: { teacherId: user } })
      .then(() => {
        // Do NOT navigate here; let the STOMP 'START' message trigger navigation for everyone
        // onStartedRef.current?.();
        // navigate('/multiplayer', { state: { activityId } });
      })
      .catch(() => setError('Failed to start activity'))
      .finally(() => setStarting(false));
  };

  const handleReturn = () => {
    // First try to leave the lobby gracefully
    LOBBY_API.delete(`/${activityId}/leave`, { params: { userId: user } })
      .catch(err => console.error('Error leaving lobby:', err))
      .finally(() => {
        // Cleanup websocket connections
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe();
          } catch (e) {
            console.error('Error unsubscribing:', e);
          }
        }
        if (stompClientRef.current) {
          try {
            stompClientRef.current.disconnect(() => {
              console.log('WebSocket disconnected');
              // Call onReturn callback after disconnecting
              onReturn?.();
            });
          } catch (e) {
            console.error('Error disconnecting:', e);
            // Still call onReturn even if disconnect fails
            onReturn?.();
          }
        } else {
          // If no WebSocket, still call onReturn
          onReturn?.();
        }
      });
  };

  useImperativeHandle(ref, () => ({ handleReturn }));

  // --- Character selection UI (unchanged) ---
  if (!hasJoined) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Select Your Character</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
          {CHARACTERS.map(char => (
            <Box
              key={char.key}
              sx={{
                border: selectedChar === char.value ? '3px solid #1E88E5' : '2px solid #ccc',
                borderRadius: '16px', p: 2, cursor: 'pointer',
                background: selectedChar === char.value ? '#E3F2FD' : '#fff',
                transition: 'border 0.2s, background 0.2s',
                boxShadow: selectedChar === char.value ? '0 0 8px #90caf9' : 'none',
              }}
              onClick={() => setSelectedChar(char.value)}
            >
              <img src={char.img} alt={char.label} style={{ width: 80, height: 80, marginBottom: 8 }} />
              <Typography variant="subtitle1">{char.label}</Typography>
            </Box>
          ))}
        </Box>
        <Button
          variant="contained"
          disabled={!selectedChar || joining || !userDetails}
          onClick={async () => {
            setJoining(true);
            setError('');
            try {
              const payload = {
                userId:      userDetails.userId,
                firstName:   userDetails.firstName,
                middleName:  userDetails.middleName,
                lastName:    userDetails.lastName,
                email:       userDetails.email,
                password:    userDetails.password,
                idNumber:    userDetails.idNumber,
                totalPoints: userDetails.totalPoints,
                profilePic:  selectedChar,
                role:        userDetails.role,
              };
              await USER_API.put(`/${user}`, payload);
              console.log ('Profile updated:', payload.role);
              setHasJoined(true);
            } catch (err) {
              setError(err?.response?.data?.message || 'Failed to update profile');
            } finally {
              setJoining(false);
            }
          }}
        >
          {joining ? <CircularProgress size={24} /> : 'Join Lobby'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    );
  }

  // --- Lobby view UI (unchanged) ---
  function getCharImgByValue(val) {
    const found = CHARACTERS.find(c => c.value === val);
    return found ? found.img : null;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Lobby</Typography>
      <Typography variant="subtitle1" gutterBottom>Users in Lobby:</Typography>
      <Box sx={{ mb: 2 }}>
        {users.length === 0
          ? <Typography variant="body2" color="text.secondary">No users in the lobby yet.</Typography>
          : users.map(u => (
            <Box key={u.userId} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <img
                src={getCharImgByValue(u.character || u.profilePic || (u.userId === user ? localUserChar : null))}
                alt="char"
                style={{ width: 36, height: 36, marginRight: 8 }}
              />
              <Typography>{u.name || u.firstName || u.userId}</Typography>
              {u.userId === user && <Typography sx={{ ml: 1, color: '#1E88E5' }}>(You)</Typography>}
              {u.role && <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>{u.role}</Typography>}
            </Box>
          ))}
      </Box>

      {joining && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Joining lobby...</Typography>
        </Box>
      )}

      {role.current === 'TEACHER' ? (
        <Button variant="contained" fullWidth size="large" onClick={handleStart} disabled={starting}>
          {starting ? 'Starting…' : 'Start Activity'}
        </Button>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Waiting for teacher to start…
        </Typography>
      )}

      <Button variant="outlined" fullWidth size="large" sx={{ mt: 2 }} onClick={handleReturn}>
        Return
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {/* Multiplayer Game Room Modal */}
      <Dialog open={gameRoomOpen} onClose={() => { disconnectWebsocket(); setGameRoomOpen(false); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Multiplayer Game Room
          <IconButton
            aria-label="close"
            onClick={() => { disconnectWebsocket(); setGameRoomOpen(false); }}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {/* Pass activityId and filtered users (excluding teachers) to MultiplayerGameRoom */}
        <MultiplayerGameRoom 
          activityId={activityId} 
          initialUsers={frozenInitialUsers.filter(user => user.role?.toUpperCase() !== 'TEACHER')} 
          onLeave={(e) => {
            disconnectWebsocket();
            setGameRoomOpen(false);
          }} 
        />
      </Dialog>

      {/* Deployed Activity Check (NEW) */}
      {!hasDeployedActivity && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          This activity is not deployed. Please contact your administrator.
        </Alert>
      )}
    </Box>
  );
});

export default LiveActivityGame;