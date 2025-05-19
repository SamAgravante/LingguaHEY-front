import React, { useEffect, useState, useRef } from 'react';
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
import API from "../../api"; 

const BASE = import.meta.env.VITE_API_BASE_URL;

export default function LiveActivityGame({ activityId, userId, onStarted, onReturn }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);

  const user = userId || getUserFromToken().userId;
  const stompClientRef = useRef(null);

  // Prevent double initialization under StrictMode
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!activityId || !user || didInitRef.current) return;
    didInitRef.current = true;

    setJoining(true);
    setError('');

    // 1) Join via REST
    API
      .post(`/lobby/${activityId}/join`, null, {
        params: { userId: user },
      })
      .then(() => API.get(`/lobby/${activityId}/users`))
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error('Error joining or fetching users:', err);
        setError('Failed to join lobby or fetch users');
      })
      .finally(() => setJoining(false));

    // 2) STOMP over SockJS
    const socket = new SockJS(`${BASE}/ws`);
    const client = Stomp.over(socket);
    stompClientRef.current = client;

    client.connect(
      {},
      () => {
        console.log('STOMP connected');
        client.subscribe(`/topic/activity/${activityId}`, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (payload.type === 'JOIN' && payload.user) {
              setUsers((prev) =>
                prev.some((u) => u.userId === payload.user.userId)
                  ? prev
                  : [...prev, payload.user]
              );
            }
            if (payload.type === 'START') {
              if (onStarted) onStarted();
            }
          } catch (e) {
            console.error('Failed to parse STOMP msg:', e);
          }
        });
      },
      (err) => {
        console.error('STOMP connection error:', err);
        setError('WebSocket connection failed');
      }
    );

    // Cleanup: if the component unmounts, also fire a leave request (just in case)
    return () => {
      const client = stompClientRef.current;
      if (client) {
        API.delete(`/lobby/${activityId}/leave`, { params: { userId: user } })
          .catch((err) => console.error("Error leaving lobby on unmount:", err))
          .finally(() => {
            try {
              client.disconnect(() => {
                console.log("STOMP disconnected after unmount leave");
              });
            } catch (e) {
              console.warn("STOMP disconnect error on unmount:", e);
            }
          });
      }
    };

  }, [activityId, user, onStarted]);

  const handleStart = () => {
    setStarting(true);
    API
      .post(`/lobby/${activityId}/start`, null, {
        params: { teacherId: user },
      })
      .then(() => {
        if (onStarted) onStarted();
      })
      .catch((err) => {
        console.error('Failed to start activity:', err);
        setError('Failed to start activity');
      })
      .finally(() => setStarting(false));
  };

  const handleReturn = () => {
    const client = stompClientRef.current;

    // 1) Tell the backend this user is leaving the lobby immediately
    API.delete(`/lobby/${activityId}/leave`, { params: { userId: user } })
      .catch((err) => {
        console.error("Error leaving lobby on return:", err);
      })
      .finally(() => {
        // 2) Once the leave request is sent, disconnect STOMP
        if (client) {
          try {
            client.disconnect(() => {
              console.log("STOMP disconnected by return");
              if (onReturn) onReturn();
            });
          } catch (e) {
            console.warn("STOMP disconnect error on return:", e);
            if (onReturn) onReturn();
          }
        } else {
          if (onReturn) onReturn();
        }
      });
  };

  const role = getUserFromToken().role?.toUpperCase();

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Live Activity Lobby
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
          users.map((u) => (
            <ListItem key={u.userId} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              <ListItemText primary={`${u.firstName} ${u.lastName}`} secondary={u.role} />
            </ListItem>
          ))
        )}
      </List>

      {role === 'TEACHER' ? (
        <Button variant="contained" fullWidth size="large" onClick={handleStart} disabled={starting}>
          {starting ? 'Starting…' : 'Start Activity'}
        </Button>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Waiting for teacher to start…
        </Typography>
      )}

      <Button
        variant="outlined"
        fullWidth
        size="large"
        sx={{ mt: 2 }}
        onClick={handleReturn}
      >
        Return
      </Button>
    </Box>
  );
}
