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
import Snackbar from '@mui/material/Snackbar'; // ✅ new
import MuiAlert from '@mui/material/Alert';  // ✅ for snackbar style
import char_1 from '../../assets/images/characters/lingguahey-char1-wave.png';
import char_2 from '../../assets/images/characters/lingguahey-char1-stand.png';
import MultiplayerGameRoom from './MultiplayerGameRoom';
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";

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
  const [reconnected, setReconnected] = useState(false); // ✅ snackbar trigger

  const user = userId || getUserFromToken().userId;
  const role = useRef(getUserFromToken().role?.toUpperCase());
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const didInitRef = useRef(false);
  const onStartedRef = useRef(onStarted);
  const lastNonEmptyUsersRef = useRef([]); // Always keep the latest non-empty user list
  const isLeavingRef = useRef(false);

  function logs() {
    console.log("USERS: ", users);
    console.log("FROZEN USERS: ", frozenInitialUsers);

  }

  useEffect(() => {
    onStartedRef.current = onStarted;
  }, [onStarted]);

  // ---- FETCH USER DETAILS ----
  useEffect(() => {
    if (!user) return;
    USER_API.get(`/${user}`)
      .then(res => setUserDetails(res.data))
      .catch(() => setError('Could not load user profile'));
  }, [user]);

  const disconnectWebsocket = () => {
    isLeavingRef.current = true; // prevent reconnect
    try {
      subscriptionRef.current?.unsubscribe();
    } catch { }
    try {
      stompClientRef.current?.disconnect();
    } catch { }
  };

  useEffect(() => {
    if (!activityId || !user || !hasJoined || didInitRef.current) return;
    didInitRef.current = true;
    setJoining(true);
    setError('');

    // Wrap the API + STOMP logic in an async IIFE so we can use await
    (async () => {
      try {
        // ---- Fetch Lobby Users ----
        const res = await LOBBY_API.get(`/${activityId}/users`);
        console.log("📦 Lobby Users Data:", res.data); // ✅ inspect data from backend
        setFrozenInitialUsers(res.data);

        setUsers(res.data);

        const me = res.data.find(u => u.userId === user);
        if (!me?.character && selectedChar) {
          setLocalUserChar(selectedChar);
        }
      } catch (err) {
        console.error("❌ Failed to fetch lobby users:", err);
        // You can inspect backend response if available:
        console.error("Response data:", err.response?.data);
        console.error("Status:", err.response?.status);
        console.error("Headers:", err.response?.headers);

        setError("Failed to fetch lobby users");
      } finally {
        setJoining(false);
      }

      // ---- STOMP via SockJS ----
      const socket = new SockJS(`${BASE_URL}/ws`);
      const client = Stomp.over(socket);
      client.debug = () => { };
      client.heartbeat.outgoing = 20000;
      client.heartbeat.incoming = 20000;

      stompClientRef.current = client;
      isLeavingRef.current = false;

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const connectStomp = () => {
        if (!stompClientRef.current || isLeavingRef.current) return;

        stompClientRef.current.connect(
          headers,
          () => {
            console.log("✅ STOMP connected");
            setError("");

            subscriptionRef.current = stompClientRef.current.subscribe(
              `/topic/lobby/${activityId}`,
              msg => {
                let payload;
                try {
                  payload = JSON.parse(msg.body);
                } catch {
                  console.warn("⚠️ Failed to parse STOMP message:", msg.body);
                  return;
                }

                console.log("📩 Received WebSocket message:", payload);

                if (Array.isArray(payload.users)) {
                  console.log("👥 Full user list update:", payload.users);
                  setUsers(payload.users);

                  if (payload.users.length > 0) {
                    lastNonEmptyUsersRef.current = payload.users;
                  }

                  const me = payload.users.find(u => u.userId === user);
                  if (me?.role && role.current !== me.role.toUpperCase()) {
                    role.current = me.role.toUpperCase();
                  }
                  if (!me?.character && selectedChar) {
                    setLocalUserChar(selectedChar);
                  }

                  // Log after updating state (for debugging)
                  setTimeout(() => {
                    console.log("✅ Updated users (full list):", payload.users);
                    setFrozenInitialUsers(payload.users)
                  }, 100);

                  return;
                }

                if (payload.type === "JOIN" && payload.user) {
                  console.log("👤 User joined:", payload.user);
                  setUsers(prev => {
                    const updated = prev.some(u => u.userId === payload.user.userId)
                      ? prev
                      : [...prev, payload.user];

                    console.log("✅ Updated users (after JOIN):", updated);
                    return updated;
                  });
                }

                if (payload.type === "START") {
                  console.log("🚀 Game started payload:", payload);
                  //setFrozenInitialUsers(lastNonEmptyUsersRef.current);
                  logs();
                  setGameRoomOpen(true);
                  subscriptionRef.current?.unsubscribe();
                  stompClientRef.current?.disconnect();
                }
              }
            );

          },
          error => {
            if (isLeavingRef.current) {
              console.log("❌ STOMP closed intentionally, not reconnecting");
              return;
            }
            console.error("❌ STOMP connection error:", error);
            setError("WebSocket connection failed. Retrying in 5s...");
            setTimeout(connectStomp, 5000);
          }
        );
      };

      console.log("🧩 Current users state before STOMP connect:", users);
      connectStomp();
    })();

    // ---- Cleanup ----
    return () => {
      isLeavingRef.current = true;
      // ✅ MODIFICATION: Remove the user from frozenInitialUsers on unmount/cleanup
      setFrozenInitialUsers(prev => prev.filter(u => u.userId !== user)); 
      
      LOBBY_API.delete(`/${activityId}/leave`, { params: { userId: user } }).finally(() => {
        try {
          subscriptionRef.current?.unsubscribe();
        } catch { }
        try {
          stompClientRef.current?.disconnect();
        } catch { }
        didInitRef.current = false;
      });
    };
  }, [activityId, user, hasJoined, selectedChar, token]);


  // ---- HANDLERS ----
  const handleStart = () => {
    setStarting(true);
    LOBBY_API.post(
      `/${activityId}/start`,
      null,
      { params: { teacherId: user } }
    )
      .catch(() => setError('Failed to start activity'))
      .finally(() => setStarting(false));
  };

  const handleReturn = () => {
    isLeavingRef.current = true;
    
    // ✅ MODIFICATION: Remove the user from frozenInitialUsers when returning
    setFrozenInitialUsers(prev => prev.filter(u => u.userId !== user)); 

    LOBBY_API.delete(`/${activityId}/leave`, { params: { userId: user } })
      .catch(err => console.error('Error leaving lobby:', err))
      .finally(() => {
        try {
          subscriptionRef.current?.unsubscribe();
        } catch { }
        try {
          stompClientRef.current?.disconnect(() => {
            console.log('WebSocket disconnected intentionally');
            onReturn?.();
          });
        } catch {
          onReturn?.();
        }
      });
  };

  useImperativeHandle(ref, () => ({ handleReturn }));

  // --- Character selection UI ---
  if (!hasJoined) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Select Your Character</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
          {CHARACTERS.map(char => (
            <Box
              key={char.key}
              sx={{
                background: selectedChar === char.value ? '#E3F2FD' : '#fff',
                transition: 'border 0.2s, background 0.2s',
                boxShadow: selectedChar === char.value ? '0 0 8px #90caf9' : 'none',
                backgroundImage: `url(${GameShopField})`,
                backgroundSize: 'cover',
                width: '6vw',
                height: '13vh',
                justifyContent: 'center',
                alignItems: 'center', pt: 4
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
              // 1. Update the user's profile with the selected character
              const payload = {
                userId: userDetails.userId,
                firstName: userDetails.firstName,
                middleName: userDetails.middleName,
                lastName: userDetails.lastName,
                email: userDetails.email,
                password: userDetails.password,
                idNumber: userDetails.idNumber,
                totalPoints: userDetails.totalPoints,
                profilePic: selectedChar, // <-- THIS IS THE CRITICAL UPDATE
                role: userDetails.role,
              };
              await USER_API.put(`/${user}`, payload);

              // Update local user details with the new profilePic
              setUserDetails(prev => ({ ...prev, profilePic: selectedChar }));

              // 2. Join the lobby using the REST API (This should now pick up the profilePic)
              await LOBBY_API.post(
                `/${activityId}/join`,
                { character: selectedChar },
                { params: { userId: user } }
              );

              // 3. Proceed to the lobby state
              setHasJoined(true);

            } catch (err) {
              if (err.response?.status === 409) {
                // User was already joined. Re-fetch and proceed to lobby.
                try {
                  const res = await LOBBY_API.get(`/${activityId}/users`);
                  setUsers(res.data);
                  setHasJoined(true);
                  setReconnected(true);
                  setError('');
                } catch {
                  setError('Failed to fetch existing lobby state');
                }
              } else {
                setError(err?.response?.data?.message || 'Failed to update profile or join lobby');
              }
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

  // --- Lobby view UI ---
  function getCharImgByValue(val) {
    const found = CHARACTERS.find(c => c.value === val);
    return found ? found.img : null;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Lobby</Typography>
      <Typography variant="subtitle1" gutterBottom>Users in Lobby:</Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 2,
          justifyContent: 'center'
        }}
      >
        {users.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No users in the lobby yet.
          </Typography>
        ) : (
          users.map(u => {
            const charValue = u.character || u.profilePic || (u.userId === user ? localUserChar : null);
            const imgSrc = getCharImgByValue(charValue);
            return (
              <Box
                key={u.userId}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  minWidth: 80
                }}
              >
                {imgSrc ? (
                  <img src={imgSrc} alt="char" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                ) : (
                  <Box sx={{ width: 80, height: 80, backgroundColor: '#f0f0f0', borderRadius: '50%' }} />
                )}
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  {u.name || u.firstName || u.userId}
                  {u.userId === user && <span style={{ color: '#1E88E5' }}> (You)</span>}
                </Typography>
                {u.role && (
                  <Typography variant="caption" color="text.secondary">
                    {u.role}
                  </Typography>
                )}
              </Box>
            );
          })
        )}
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
      <Dialog
        open={gameRoomOpen}
        onClose={() => { disconnectWebsocket(); setGameRoomOpen(false); }}
        maxWidth="md"
        fullWidth
      >
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
        <MultiplayerGameRoom
          activityId={activityId}
          initialUsers={frozenInitialUsers.filter(u => u.role?.toUpperCase() !== 'TEACHER')}
          onLeave={() => {
            disconnectWebsocket();
            setGameRoomOpen(false);
            handleReturn();
          }}
        />
      </Dialog>

      {/* ✅ Snackbar for reconnection */}
      <Snackbar
        open={reconnected}
        autoHideDuration={3000}
        onClose={() => setReconnected(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert severity="info" elevation={6} variant="filled">
          Reconnected to lobby
        </MuiAlert>
      </Snackbar>
    </Box>
  );
});

export default LiveActivityGame;