// src/components/Pages/Homepage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Stack,
  Box,
  Typography,
  Modal,
  Fade,
  Backdrop,
  IconButton,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookIcon from '@mui/icons-material/Book';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import API from '../../api';
import PhraseTranslation from './PhraseTranslationGame';
import WordTranslation from './WordTranslationGame';
import OnePicFourWord from './OnePicFourWordGame';
import LiveActivityGame from './LiveActivityGame';
import { mockQuestions } from './mockQuestions';
import { getUserFromToken } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import modalBg from '../../assets/images/backgrounds/activity-modal-bg.png';
import bunnyWave from '../../assets/images/characters/lingguahey-char1-wave.png';
import { MusicContext } from '../../contexts/MusicContext';
import { styled } from '@mui/system';


const PastelProgress = styled(LinearProgress)(() => ({
  height: '12px',
  borderRadius: '8px',
  backgroundColor: '#EAEAEA',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(to right, #BAFFC9, #FFB3BA)',
    borderRadius: '8px',
  },
}));

export default function Homepage() {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState('');
  const [activities, setActivities] = useState([]);
  const [current, setCurrent] = useState(null);
  const [classroom, setClassroom] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [userActivities, setUserActivities] = useState([]);
  const { musicOn, toggleMusic, setActivityMode } = useContext(MusicContext);
  const [progressVocab, setProgressVocab] = useState(0);
  const [progressGrammar, setProgressGrammar] = useState(0);
  const [secVisibility, setSecVisibility] = useState(true);

  // Decode token → user
  useEffect(() => {
    if (!token) return;
    const decoded = getUserFromToken(token);
    if (decoded?.userId) setUser(decoded);
  }, [token]);

  // Fetch classroom, user details, progress
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    (async () => {
      try {
        const classResp = await API.get(`classrooms/user/${user.userId}`);
        if (!isMounted) return;
        setClassroom(classResp.data.classroomID);

        const userResp = await API.get(`/users/${user.userId}`);
        setUserDetails(userResp.data);

        const prog = await API.get(`/activities/${user.userId}/progress`);
        setProgressVocab(prog.data.gameSet1Progress * 100);
        setProgressGrammar(prog.data.gameSet2Progress * 100);

        await fetchUserActivities();
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { isMounted = false; };
  }, [user]);

  // Load activities whenever section changes
  useEffect(() => {
    if (!classroom || !section) return;

    if (section === 'Activity') {
      API.get(`/live-activities/${classroom}/live-activities`)
        .then(res => setActivities(res.data))
        .catch(err => {
          console.error('Failed to fetch live activities:', err);
          setActivities([]);
        });
    } else {
      API.get(`/activities`)
        .then(res => setActivities(res.data))
        .catch(() => {
          setActivities(
            mockQuestions.map(q => ({
              activityId: q.questionId,
              topicNumber: q.topicNumber || 0,
              lessonNumber: q.lessonNumber || 0,
              lessonName: q.lessonName || '',
              activityName: q.questionDescription || q.questionText,
              gameType: q.questionDescription
                ? 'GAME2'
                : q.questionImage
                  ? 'GAME1'
                  : 'GAME3',
            }))
          );
        });
    }
  }, [classroom, section]);

  const fetchUserActivities = async () => {
    try {
      const resp = await API.get(`activities/users/${user.userId}`);
      setUserActivities(resp.data);
      setSecVisibility(true);
    } catch (err) {
      console.error('Failed to fetch user activities:', err);
    }
  };

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
    setActivityMode(false);
  };

  const startActivity = act => {
    setSecVisibility(false);
    setActivityMode(true);
    setCurrent(act);
  };

  const backToList = () => {
    fetchUserActivities();
    setCurrent(null);
    setActivityMode(false);
  };

  const handleBackClick = () => (current ? backToList() : closeModal());

  // ---------------- renderBody ----------------
  function renderBody() {
    // 1) Before selecting any item
    if (!current) {
      // If in Activity section → multiplayer lobby
      if (section === 'Activity') {
        return (
          <LiveActivityGame
            activityId={classroom}
            userId={user?.userId}
            onStarted={closeModal}
          />
        );
      }

      // Otherwise, Vocabulary/Grammar lists
      const flatList =
        section === 'Vocabulary'
          ? activities.filter(a => ['GAME1', 'GAME3'].includes(a.gameType))
          : activities.filter(a => a.gameType === 'GAME2');

      // Group by lessonNumber + lessonName
      const lessonsMap = flatList.reduce((acc, act) => {
        const key = `${act.lessonNumber}__${act.lessonName}`;
        if (!acc[key]) {
          acc[key] = {
            lessonNumber: act.lessonNumber,
            lessonName: act.lessonName,
            topics: [],
          };
        }
        acc[key].topics.push(act);
        return acc;
      }, {});

      // Convert to array and sort by lessonNumber
      const groupedLessons = Object.values(lessonsMap)
        .sort((a, b) => a.lessonNumber - b.lessonNumber)
        .map(lesson => ({
          ...lesson,
          topics: lesson.topics.sort((x, y) => x.topicNumber - y.topicNumber),
        }));

      return (
        <Stack
          spacing={3}
          sx={{
            mt: 4,
            px: 2,
            justifyContent: 'center',
            alignItems: 'center', // center each lesson horizontally
          }}
        >
          {groupedLessons.map(lesson => (
            <Box 
              key={`${lesson.lessonNumber}-${lesson.lessonName}`} 
              sx={{ width: '100%', maxWidth: 800 }} // limit width, center via Stack
            >
              {/* Lesson Header */}
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
              >
                Lesson {lesson.lessonNumber}: {lesson.lessonName}
              </Typography>

              {/* Vertical list of activity cards, centered */}
              <Stack
                direction="column"
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                {lesson.topics.map(act => {
                  const isCompleted = userActivities.some(
                    ua =>
                      ua.activity_ActivityId === act.activityId && ua.completed
                  );
                  return (
                    <Box
                      key={act.activityId}
                      onClick={() => startActivity(act)}
                      sx={{
                        backgroundColor: isCompleted ? '#C8E6C9' : '#FFF8E1',
                        borderRadius: 4,
                        p: 3,
                        width: '80%',
                        paddingBottom: 2,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      {/* Display activityName & game mode */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {act.activityName}
                      </Typography>
                      <Typography variant="body2">
                        {act.gameType === 'GAME1'
                          ? 'One Pic Four Words'
                          : act.gameType === 'GAME2'
                          ? 'Phrase Translation'
                          : 'Word Translation'}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}
        </Stack>
      );
    }

    // 2) Once an item is selected
    const isCompleted = userActivities.some(
      ua => ua.activity_ActivityId === current.activityId && ua.completed
    );

    if (section === 'Activity') {
      return (
        <LiveActivityGame
          activityId={current.activityId}
          userId={user?.userId}
          onStarted={closeModal}
        />
      );
    } else if (section === 'Grammar') {
      return (
        <PhraseTranslation
          activityId={current.activityId}
          onBack={backToList}
          isCompleted={isCompleted}
        />
      );
    } else if (section === 'Vocabulary') {
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
  }
  // ---------------------------------------------

  const sections = [
    {
      key: 'Vocabulary',
      icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />,
      bg: '#FFEBEE',
      progress: progressVocab,
    },
    {
      key: 'Grammar',
      icon: <GTranslateIcon sx={{ fontSize: 48, color: '#1E88E5' }} />,
      bg: '#E3F2FD',
      progress: progressGrammar,
    },
    {
      key: 'Activity',
      icon: <SportsEsportsIcon sx={{ fontSize: 48, color: '#388E3C' }} />,
      bg: '#E8F5E9',
      progress: 0,
    },
  ];

  return (
    <Grid container direction="column" alignItems="center" sx={{ p: 2, bgcolor: '#E1F5FE' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
        <Grid container direction="column" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {userDetails.firstName ? `Welcome, ${userDetails.firstName}!` : 'Welcome!'}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Choose a section to start learning:
          </Typography>
        </Grid>
        <img src={bunnyWave} alt="Bunny Wave" width={80} height={120} />
      </Stack>

      {/* Section Cards */}
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
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            {s.icon}
            <Typography variant="h3" sx={{ mt: 1, fontSize: 30 }}>
              {s.key}
            </Typography>
            {s.key !== 'Activity' && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <PastelProgress
                    variant="determinate"
                    value={s.progress}
                    sx={{ width: '100%' }}
                  />
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    {s.progress.toFixed(0)}% Completed
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      {/* Modal */}
      <Modal
        open={open}
        onClose={closeModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '98vw',
              height: '100vh',
              backgroundImage: `url(${modalBg})`,
              backroundRepeat: 'no-repeat',
              p: 3,
              overflowY: 'auto',
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <IconButton onClick={handleBackClick}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="h2" sx={{ textAlign: 'center', visibility: secVisibility ? 'visible' : 'hidden' }}>
              {section} Activities!
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                maxHeight: '80vh',
                overflowY: 'auto',
                // Center contents horizontally
                //display: 'flex',
                justifyContent: 'center',
                // WebKit scrollbar styling
                '&::-webkit-scrollbar': {
                  width: '25px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#FFF0F5', // pastel lavender track
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#F5C0E7', // pastel pink thumb
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#E79FD9', // slightly darker on hover
                },
                // Firefox scrollbar styling
                scrollbarColor: '#F5C0E7 #FFF0F5',
                scrollbarWidth: 'thick',
              }}
            >
              {renderBody()}
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Music Toggle */}
      <button
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#FFCC80',
          color: '#5D4037',
          border: 'none',
          borderRadius: 8,
          padding: '0.6em 1.2em',
          fontSize: '1em',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        onClick={toggleMusic}
      >
        {musicOn ? '🎵 Mute Music' : '🔇 Play Music'}
      </button>
    </Grid>
  );
}
