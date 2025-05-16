// src/components/Homepage.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Stack,
  Box,
  Typography,
  Modal,
  Fade,
  Backdrop,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import API from "../../api"; 
import PhraseTranslation from "./PhraseTranslationGame";
import WordTranslation from "./WordTranslationGame";
import OnePicFourWord from "./OnePicFourWordGame";
import { mockQuestions } from "./mockQuestions";
import { getUserFromToken } from "../../utils/auth";
import { useAuth } from "../../contexts/AuthContext";
import modalBg from '../../assets/images/backgrounds/activity-modal-bg.png';
import bunnyWave from '../../assets/images/characters/lingguahey-char1-wave.png';

import { useContext } from "react";
import { MusicContext } from "../../contexts/MusicContext";

export default function Homepage() {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("");
  const [activities, setActivities] = useState([]);
  const [current, setCurrent] = useState(null);
  const [classroom, setClassroom] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [userActivities, setUserActivities] = useState([]);
  const { musicOn, toggleMusic, setActivityMode } = useContext(MusicContext);

  

  // Decode token → user
  useEffect(() => {
    if (!token) return;
    const decoded = getUserFromToken();
    if (decoded?.userId) setUser(decoded);
  }, [token]);

  // Fetch classroom & initial userActivities once
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchClassAndActivities = async () => {
      try {
        // get classroom
        const classResp = await API.get(`classrooms/user/${user.userId}`);
        if (!isMounted) return;
        const userClass = classResp.data;
        if (userClass) setClassroom(userClass.classroomID);

        // initial load of userActivities
        await fetchUserActivities();
      } catch (err) {
        console.error(err);
      }
    };

    fetchClassAndActivities();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch activities for the classroom
  useEffect(() => {
    if (!classroom) return;
    API.get(`activities/${classroom}/activities`)
      .then(res => setActivities(res.data))
      .catch(() => {
        // fallback to mockQuestions
        setActivities(mockQuestions.map(q => ({
          activityId: q.questionId,
          activityName: q.questionDescription || q.questionText,
          gameType: q.questionDescription
            ? 'GAME2'
            : q.questionImage
            ? 'GAME1'
            : 'GAME3'
        })));
      });
  }, [classroom]);

  // helper to refresh only when needed
  const fetchUserActivities = async () => {
    try {
      const actResp = await API.get(`activities/users/${user.userId}`);
      setUserActivities(actResp.data);
    } catch (err) {
      console.error("Failed to fetch user activities:", err);
    }
  };

  // openModal now also refreshes userActivities
  const openModal = async key => {
    await fetchUserActivities();
    setSection(key);
    setCurrent(null);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setSection('');
    setCurrent(null);
    setActivityMode(false); // Switch back to default music
  };
  const startActivity = act => {
    setActivityMode(true); // Switch to activity music
    setCurrent(act);
  };

  // when arrow back is clicked:
  const handleBackClick = () => {
    if (current) {
      // inside an activity → refresh completions then go back to list
      backToList();
    } else {
      // already at list → close modal
      closeModal();
    }
  };

  const backToList = () => {
    fetchUserActivities();
    setCurrent(null);
    setActivityMode(false); // Switch back to default music
  };


  const renderBody = () => {
    if (!current) {
      const list = section === 'Vocabulary'
        ? activities.filter(a => ['GAME1','GAME3'].includes(a.gameType))
        : activities.filter(a => a.gameType === 'GAME2');

      return (
        <Stack spacing={3} sx={{ mt: 4, px: 2 }}>
          {list.map(a => {
            const isCompleted = userActivities.some(ua =>
              ua.activity_ActivityId === a.activityId && ua.completed
            );
            return (
              <Box
                key={a.activityId}
                onClick={() => startActivity(a)}
                sx={{
                  backgroundColor: isCompleted ? '#C8E6C9' : '#FFF8E1',
                  borderRadius: 4,
                  p: 3,
                  width: '95%',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 'bold' }}>
                  {a.activityName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                  {a.gameType === 'GAME1'
                    ? 'One Pic Four Words'
                    : a.gameType === 'GAME2'
                    ? 'Phrase Translation'
                    : 'Word Translation'}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      );
    }

    const isCompleted = userActivities.some(ua =>
      ua.activity_ActivityId === current.activityId && ua.completed
    );

    if (section === 'Grammar') {
      return (
        <PhraseTranslation
          activityId={current.activityId}
          onBack={backToList}
          isCompleted={isCompleted}
        />
      );
    }

    if (section === 'Vocabulary') {
      return current.gameType === 'GAME1' ? (
        <OnePicFourWord
          activityId={current.activityId}
          onBack={backToList}
          isCompleted={isCompleted}
        />
      ) : (
        <WordTranslation
          activityId={current.activityId}
          onBack={backToList}
          isCompleted={isCompleted}
        />
      );
    }

    return null;
  };

  const sections = [
    {
      key: 'Vocabulary',
      icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />,
      bg: '#FFEBEE'
    },
    {
      key: 'Grammar',
      icon: <GTranslateIcon sx={{ fontSize: 48, color: '#1E88E5' }} />,
      bg: '#E3F2FD'
    },
    {
      key: 'Activity',
      icon: <SportsEsportsIcon sx={{ fontSize: 48, color: '#388E3C' }} />,
      bg: '#E8F5E9'
    }
  ];

  return (
    <Grid container direction="column" alignItems="center" sx={{ p: 2, backgroundColor: '#E1F5FE' }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
        <Grid container direction="column" alignItems="center" sx={{ p: 2, backgroundColor: '#E1F5FE' }}>
          <Typography variant="h4" sx={{ mb: 2, color: '#4E342E' }}>
            {userDetails.firstName ? `Welcome, ${userDetails.firstName}!` : 'Welcome!'}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: '#6D4C41' }}>
            Choose a section to start learning:
          </Typography>
        </Grid>
        <img src={bunnyWave} alt="Bunny Wave" style={{ width: 100, height: 120 }} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 4 }}>
        {sections.map(s => (
          <Box
            key={s.key}
            onClick={() => openModal(s.key)}
            sx={{
              backgroundColor: s.bg,
              width: 360,
              height: 560,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          >
            {s.icon}
            <Typography variant="subtitle1" sx={{ mt: 1, color: '#4E342E' }}>
              {s.key}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Modal
        open={open}
        onClose={closeModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 5000 }}
      >
        <Fade in={open}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '98vw', height: '100vh', 
            //bgcolor: '#FFF',
            backgroundImage: `url(${modalBg})`, 
            p: 3 }}>
            <Stack direction="row" justifyContent="space-between">
              <IconButton onClick={handleBackClick}>
                <ArrowBackIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={closeModal} >
                <CloseIcon fontSize="large" />
              </IconButton>
            </Stack>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {renderBody()}
            </Box>
          </Box>
        </Fade>
      </Modal>
      <button
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 2000,
          background: "#FFCC80",
          color: "#5D4037",
          border: "none",
          borderRadius: 8,
          padding: "0.6em 1.2em",
          fontSize: "1em",
          fontWeight: 500,
          cursor: "pointer"
        }}
        onClick={toggleMusic}
      >
        {musicOn ? "🎵 Mute Music" : "🔇 Play Music"}
      </button>
    </Grid>
  );
}
