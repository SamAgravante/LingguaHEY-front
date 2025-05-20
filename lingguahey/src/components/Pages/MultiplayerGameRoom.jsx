// src/components/Pages/MultiplayerGameRoom.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { getUserFromToken } from '../../utils/auth';
import API from '../../api.jsx';

export default function MultiplayerGameRoom({ activityId: propActivityId, onLeave }) {
  let activityId = propActivityId;
  // Fallback to useLocation for route-based navigation (legacy)
  const { state } = useLocation();
  if (!activityId && state?.activityId) activityId = state.activityId;

  if (!activityId) {
    return <div style={{ padding: 24, color: 'red' }}>No activity ID provided.</div>;
  }

  const user = getUserFromToken()?.userId;

  const handleLeave = async () => {
    if (!activityId || !user) return;
    try {
      await API.delete(`/lobby/${activityId}/leave`, { params: { userId: user } });
      if (onLeave) {
        onLeave();
      } else {
        // fallback: reload if no handler provided
        window.location.reload();
      }
    } catch (e) {
      // Always allow the user to leave the game room UI, even if the API fails
      if (onLeave) {
        onLeave();
      }
      // Optionally, show a warning
      // alert('Failed to leave lobby, but you have exited the game room.');
    }
  };

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
      <h2 style={{ fontSize: 36, marginBottom: 16 }}>Multiplayer Game Room</h2>
      <p style={{ fontSize: 20 }}>Activity ID: {activityId}</p>
      {/* TODO: load and render the multiplayer game here */}
    </div>
  );
}
