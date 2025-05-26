// src/components/Pages/Homepage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
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
import { useScore } from '../../contexts/ScoreContext';
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
  const [activities, setActivities] = useState([]);  const [current, setCurrent] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [userActivities, setUserActivities] = useState([]);  const { musicOn, toggleMusic, setActivityMode } = useContext(MusicContext);
  const { refreshScore } = useScore();
  const [progressVocab, setProgressVocab] = useState(0);
  const [progressGrammar, setProgressGrammar] = useState(0);
  const [secVisibility, setSecVisibility] = useState(true);
  const liveActivityRef = useRef(null);

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
        const userResp = await API.get(`/users/${user.userId}`);
        setUserDetails(userResp.data);
        
        console.log('User details:', userResp.data);        
        const endpoint = userResp.data.role === 'TEACHER' 
          ? `classrooms/teacher/${user.userId}`
          : `classrooms/user/${user.userId}`;
        console.log('Fetching classroom from endpoint:', endpoint);
        const classResp = await API.get(endpoint);
        console.log ('Classroom response:', classResp.data);
        if (!isMounted) return;
        
        // Handle teacher vs student response differently
        if (userResp.data.role === 'TEACHER') {
          // For teachers, take the first classroom if they have any
          if (Array.isArray(classResp.data) && classResp.data.length > 0) {
            setClassroom(classResp.data[0].classroomID);
          } else {
            setClassroom(null);
          }
        } else {
          // For students, take the single classroom ID
          setClassroom(classResp.data.classroomID);
        }

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
  };  const closeModal = async () => {
    try {
      // Fetch updated progress
      if (user) {
        const prog = await API.get(`/activities/${user.userId}/progress`);
        setProgressVocab(prog.data.gameSet1Progress * 100);
        setProgressGrammar(prog.data.gameSet2Progress * 100);
        refreshScore(); // Trigger score refresh in Layout
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }

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
  const backToList = async () => {
    await fetchUserActivities();
    try {
      if (user) {
        const prog = await API.get(`/activities/${user.userId}/progress`);
        setProgressVocab(prog.data.gameSet1Progress * 100);
        setProgressGrammar(prog.data.gameSet2Progress * 100);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
    setCurrent(null);
    setActivityMode(false);
  };

  const handleBackClick = async () => {
    // If we're in Activity section with no current activity
    if (!current && section === 'Activity') {
      if (liveActivityRef.current?.handleReturn) {
        console.log('Calling handleReturn on LiveActivityGame');
        liveActivityRef.current.handleReturn();
      } else {
        console.log('No handleReturn available, closing modal directly');
        await closeModal();
      }
    } else if (current) {
      console.log('Going back to activity list');
      await backToList();
    } else {
      console.log('Closing modal');
      await closeModal();
    }
  };

  // ---------------- renderBody ----------------
  const [deployedActivityId, setDeployedActivityId] = useState(null);

  useEffect(() => {
    const fetchDeployedActivity = async () => {
      if (section === 'Activity' && classroom) {
        try {
          const res = await API.get(`/live-activities/classrooms/${classroom}/deployed`);
          console.log('Deployed activity:', res.data);
          setDeployedActivityId(res.data);
        } catch (err) {
          console.error('Failed to fetch deployed activity:', err);
          setDeployedActivityId(null);
        }
      }
    };
    fetchDeployedActivity();
  }, [section, classroom]);

  function renderBody() {
    // 1) Before selecting any item
    if (!current) {
      // If in Activity section → multiplayer lobby
      if (section === 'Activity') {
        return (
          <LiveActivityGame
            ref={liveActivityRef}
            activityId={deployedActivityId}
            userId={user?.userId}
            onStarted={closeModal}
            onReturn={closeModal}
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

      // Helper function to check if an activity is accessible
      const isActivityAccessible = (activity, lessonIndex, activityIndex) => {
        // First activity of first lesson is always accessible
        if (lessonIndex === 0 && activityIndex === 0) return true;

        // Get all previous activities in current lesson
        const currentLessonActivities = groupedLessons[lessonIndex].topics;
        const previousActivitiesInLesson = currentLessonActivities.slice(0, activityIndex);

        // Get activities from previous lessons
        const previousLessonsActivities = groupedLessons
          .slice(0, lessonIndex)
          .flatMap(lesson => lesson.topics);

        // Calculate required completions
        const requiredCompletions = [
          ...previousLessonsActivities,
          ...previousActivitiesInLesson
        ].map(act => act.activityId);

        // Check if all required activities are completed
        const isUnlocked = requiredCompletions.every(actId =>
          userActivities.some(ua => ua.activity_ActivityId === actId && ua.completed)
        );

        return isUnlocked;
      };

      return (
        <Stack
          spacing={3}
          sx={{
            mt: 4,
            px: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {groupedLessons.map((lesson, lessonIndex) => (
            <Box 
              key={`${lesson.lessonNumber}-${lesson.lessonName}`} 
              sx={{ width: '100%', maxWidth: 800 }}
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
                {lesson.topics.map((act, activityIndex) => {
                  const isCompleted = userActivities.some(
                    ua => ua.activity_ActivityId === act.activityId && ua.completed
                  );
                  const isAccessible = isActivityAccessible(act, lessonIndex, activityIndex);
                  const hasPrerequisites = !(lessonIndex === 0 && activityIndex === 0);

                  const getStatusMessage = () => {
                    if (isCompleted) return 'Activity completed!';
                    if (!isAccessible && hasPrerequisites) return 'Complete previous activities to unlock';
                    return 'Ready to start!';
                  };

                  return (
                    <Box
                      key={act.activityId}
                      onClick={() => isAccessible && startActivity(act)}
                      title={getStatusMessage()}
                      sx={{
                        backgroundColor: isCompleted
                          ? '#C8E6C9'  // Green for completed
                          : isAccessible
                            ? '#FFF8E1' // Yellow for accessible
                            : '#ECEFF1', // Grey for locked
                        borderRadius: 4,
                        p: 3,
                        width: '80%',
                        paddingBottom: 2,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        cursor: isAccessible ? 'pointer' : 'not-allowed',
                        opacity: isAccessible ? 1 : 0.7,
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': isAccessible ? { 
                          transform: 'scale(1.02)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                        } : {}
                      }}
                    >
                      {/* Activity Name & Game Mode */}
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
                      {/* Status indicator */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          mt: 1,
                          color: isCompleted 
                            ? '#2E7D32'  // Dark green
                            : isAccessible 
                              ? '#1565C0'  // Blue
                              : '#757575'  // Grey
                        }}
                      >
                        {getStatusMessage()}
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
          ref={liveActivityRef}
          activityId={current.activityId}
          userId={user?.userId}
          onStarted={closeModal}
          onReturn={closeModal}
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
          {classroom ? (
            <Typography variant="h5" sx={{ mb: 4 }}>
              Choose a section to start learning:
            </Typography>
          ) : (
            <Typography variant="h5" sx={{ mb: 4, color: '#666' }}>
              {userDetails.role === 'TEACHER' 
                ? 'Please create a classroom.'
                : 'Please wait for a teacher to assign you to a classroom.'}
            </Typography>
          )}
        </Grid>
        <img src={bunnyWave} alt="Bunny Wave" width={80} height={120} />
      </Stack>

      {/* Section Cards - only show if classroom exists */}
      {classroom && (
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
      )}

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
