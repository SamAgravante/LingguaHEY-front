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
  Button
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import axios from 'axios';
import PhraseTranslation from "./PhraseTranslationGame";
import WordTranslation from "./WordTranslationGame";
import OnePicFourWord from "./OnePicFourWordGame";
import { mockQuestions } from "./mockQuestions";
import { getUserFromToken } from "../../utils/auth";
import API from "../../api"; 
import { useAuth } from "../../contexts/AuthContext";

export default function Homepage() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("");
  const [activities, setActivities] = useState([]);
  const [current, setCurrent] = useState(null);
  const [classroom, setClassroom] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [userActivities, setUserActivities] = useState([]);

  useEffect(() => {
    if (!token) return;
    const decoded = getUserFromToken();
    if (decoded?.userId) setUser(decoded);
  }, [token]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const userResp = await API.get(`users/${user.userId}`);
        setUserDetails(userResp.data);

        const classResp = await API.get(`classrooms`);
        const userClass = classResp.data.find(c =>
          c.users.some(u => u.userId === user.userId)
        );
        if (userClass) setClassroom(userClass.classroomID);

        const actResp = await API.get(`activities/users/${user.userId}`);
        setUserActivities(actResp.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!classroom) return;
    API.get(`activities/${classroom}/activities`)
      .then(res => setActivities(res.data))
      .catch(() => {
        setActivities(mockQuestions.map(q => ({
          activityId: q.questionId,
          activityName: q.questionDescription || q.questionText,
          gameType: q.questionDescription ? 'GAME2' : q.questionImage ? 'GAME1' : 'GAME3'
        })));
      });
  }, [classroom]);

  const openModal = key => { setSection(key); setCurrent(null); setOpen(true); };
  const closeModal = () => { setOpen(false); setSection(''); setCurrent(null); };
  const startActivity = act => setCurrent(act);

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
                  {a.gameType === 'GAME1' ? 'One Pic Four Words'
                    : a.gameType === 'GAME2' ? 'Phrase Translation'
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
          onBack={() => { setCurrent(null); closeModal(); }}
          isCompleted={isCompleted}
        />
      );
    }

    if (section === 'Vocabulary') {
      return current.gameType === 'GAME1'
        ? (
          <OnePicFourWord
            activityId={current.activityId}
            onBack={() => { setCurrent(null); closeModal(); }}
            isCompleted={isCompleted}
          />
        )
        : (
          <WordTranslation
            activityId={current.activityId}
            onBack={() => { setCurrent(null); closeModal(); }}
            isCompleted={isCompleted}
          />
        );
    }

    return null;
  };

  const sections = [
    { key: 'Vocabulary', icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />, bg: '#FFEBEE' },
    { key: 'Grammar', icon: <GTranslateIcon sx={{ fontSize: 48, color: '#1E88E5' }} />, bg: '#E3F2FD' },
    { key: 'Activity', icon: <SportsEsportsIcon sx={{ fontSize: 48, color: '#388E3C' }} />, bg: '#E8F5E9' }
  ];

  return (
    <Grid container direction="column" alignItems="center" sx={{ p: 2, backgroundColor: '#E1F5FE' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#4E342E' }}>
        {userDetails.firstName ? `Welcome, ${userDetails.firstName}!` : 'Welcome!'}
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: '#6D4C41' }}>
        Choose a section to start learning:
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 4 }}>
        {sections.map(s => (
          <Box key={s.key} onClick={() => openModal(s.key)}
            sx={{
              backgroundColor: s.bg,
              width: 360, height: 560,
              borderRadius: 3,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer', transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)' }
            }}>
            {s.icon}
            <Typography variant="subtitle1" sx={{ mt: 1, color: '#4E342E' }}>{s.key}</Typography>
          </Box>
        ))}
      </Stack>

      <Modal open={open} onClose={closeModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={open}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '98vw', height: '100vh', bgcolor: '#FFFFFF', p: 3 }}>
            <Stack direction="row" justifyContent="space-between">
              <IconButton onClick={closeModal}><ArrowBackIcon fontSize="large" /></IconButton>
              <IconButton onClick={closeModal}><CloseIcon fontSize="large" /></IconButton>
            </Stack>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {renderBody()}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Grid>
  );
}
