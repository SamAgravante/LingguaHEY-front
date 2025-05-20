import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getUserFromToken } from '../../utils/auth';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import API from '../../api';

const BASE = import.meta.env.VITE_API_BASE_URL;

const LiveActivityGame = forwardRef(function LiveActivityGame({ activityId, userId, onStarted, onReturn }, ref) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);

  const user = userId || getUserFromToken().userId;
  const role = useRef(getUserFromToken().role?.toUpperCase());
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const didInitRef = useRef(false);
  const skipCleanupRef = useRef(true);
  const onStartedRef = useRef(onStarted);

  // Keep onStarted ref up-to-date without causing reconnects
  useEffect(() => {
    onStartedRef.current = onStarted;
  }, [onStarted]);

  useEffect(() => {
    if (!activityId || !user || didInitRef.current) return;
    didInitRef.current = true;
    setJoining(true);
    setError('');

    // 1) Join via REST
    API.post(`/lobby/${activityId}/join`, null, { params: { userId: user } })
      .then(() => API.get(`/lobby/${activityId}/users`))
      .then(res => setUsers(res.data))
      .catch(err => {
        if (err.response && err.response.status === 409) {
          // User already in lobby, just fetch users
          API.get(`/lobby/${activityId}/users`)
            .then(res => setUsers(res.data))
            .catch(e => {
              setError('Failed to fetch lobby users');
              console.error('Error fetching lobby users:', e);
            });
        } else {
          console.error('Error joining or fetching users:', err);
          setError('Failed to join lobby or fetch users');
        }
      })
      .finally(() => setJoining(false));

    // 2) STOMP over SockJS
    const socket = new SockJS(`${BASE}/ws`);
    const client = Stomp.over(socket);
    client.debug = () => {};
    stompClientRef.current = client;

    client.connect({}, () => {
      console.log('STOMP connected');
      subscriptionRef.current = client.subscribe(
        `/topic/lobby/${activityId}`,
        msg => {
          console.log('STOMP message received:', msg.body); // <-- Log the raw message
          let payload;
          try {
            payload = JSON.parse(msg.body);
          } catch (e) {
            console.error('Invalid STOMP message payload:', e);
            return;
          }

          // If the payload is a full user list (from backend), update users directly
          if (payload && Array.isArray(payload.users)) {
            setUsers(payload.users);
            return;
          }

          // Otherwise, handle event-based messages
          if (payload && payload.type) {
            switch (payload.type) {
              case 'JOIN':
                if (payload.user) {
                  setUsers(prev => {
                    // Only add if userId does not already exist
                    if (prev.some(u => u.userId === payload.user.userId)) {
                      return prev;
                    }
                    return [...prev, payload.user];
                  });
                }
                break;
              case 'START':
                onStartedRef.current?.();
                break;
              default:
                console.warn('Unknown message type:', payload.type);
            }
          }
        }
      );
    }, err => {
      console.error('STOMP connection error:', err);
      setError('WebSocket connection failed');
    });

    // Cleanup on unmount (but skip first unmount in StrictMode)
    return () => {
      if (skipCleanupRef.current) {
        skipCleanupRef.current = false;
        return;
      }
      const client = stompClientRef.current;

      // Leave lobby via REST
      API.delete(`/lobby/${activityId}/leave`, { params: { userId: user } })
        .catch(err => console.error('Error leaving lobby on unmount:', err))
        .finally(() => {
          // Unsubscribe & disconnect STOMP
          if (subscriptionRef.current) {
            try { subscriptionRef.current.unsubscribe(); } catch {}
          }
          if (client) {
            try {
              client.disconnect(() => console.log('STOMP disconnected on unmount'));
            } catch (e) {
              console.warn('Error during STOMP disconnect:', e);
            }
          }
        });
    };
  }, [activityId, user]);

  const handleStart = () => {
    setStarting(true);
    API.post(`/lobby/${activityId}/start`, null, { params: { teacherId: user } })
      .then(() => onStartedRef.current?.())
      .catch(err => {
        console.error('Failed to start activity:', err);
        setError('Failed to start activity');
      })
      .finally(() => setStarting(false));
  };

  const handleReturn = () => {
    const client = stompClientRef.current;
    API.delete(`/lobby/${activityId}/leave`, { params: { userId: user } })
      .catch(err => console.error('Error leaving lobby on return:', err))
      .finally(() => {
        if (subscriptionRef.current) {
          try { subscriptionRef.current.unsubscribe(); } catch {};
        }
        if (client) {
          try {
            client.disconnect(() => {
              console.log('STOMP disconnected by return');
              onReturn?.();
            });
          } catch (e) {
            console.warn('STOMP disconnect error on return:', e);
            onReturn?.();
          }
        } else {
          onReturn?.();
        }
      });
  };

  // Expose handleReturn to parent via ref
  useImperativeHandle(ref, () => ({
    handleReturn,
  }));

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Live Activity Lobby
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="subtitle1" gutterBottom>
        Users in Lobby:
      </Typography>

      {joining && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2">Joining lobby...</Typography>
        </Box>
      )}

      <List dense sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
        {users.length === 0 ? (
          <ListItem>
            <Typography variant="body2" color="text.secondary">
              No users in the lobby yet.
            </Typography>
          </ListItem>
        ) : (
          users.map((u, idx) => (
            <ListItem key={u.userId != null ? String(u.userId) : `user-${idx}`} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              <ListItemText primary={`${u.firstName} ${u.lastName}`} secondary={u.role} />
            </ListItem>
          )))
        }
      </List>

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
    </Box>
  );
});

export default LiveActivityGame;
