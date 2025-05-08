import {
  Grid, Stack, Box, Typography, Modal, Fade, Backdrop, IconButton, Button
} from "@mui/material";
import { useState, useEffect } from "react";
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

export default function Homepage() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("");
  const [activities, setActivities] = useState([]);
  const [current, setCurrent] = useState(null);
  const [classroom, setClassroom] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [userActivities, setUserActivities] = useState([]);

  // Secure axios instance with token
  const token = localStorage.getItem('token');
  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/`,
    timeout: 1000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Decode token on mount
  useEffect(() => {
    const decoded = getUserFromToken();
    if (decoded && decoded.userId) {
      setUser(decoded);
    }
  }, []);

  // Fetch user and classroom when user is ready
  useEffect(() => {
    if (!user) return;
    const fetchUserAndClassroom = async () => {
      try {
        const userResponse = await API.get(`users/${user.userId}`);
        const userData = userResponse.data;
        setUserDetails(userData);
        const classroomResponse = await API.get(`classrooms`);
        const classrooms = classroomResponse.data;

        const userClassroom = classrooms.find(c =>
          c.users.some(u => u.userId === userData.userId)
        );

        if (userClassroom) {
          setClassroom(userClassroom.classroomID);
        }

        // Fetch user activities
        const activitiesResponse = await API.get(`activities/users/${user.userId}`);
        setUserActivities(activitiesResponse.data);
      } catch (error) {
        console.error("Failed to fetch user or classroom data", error);
      }
    };

    fetchUserAndClassroom();
  }, [user]);

  // Fetch activities when classroom is set
  useEffect(() => {
    if (!classroom) return;

    API.get(`activities/${classroom}/activities`)
      .then(res => {
        const data = res.data;
        if (Array.isArray(data) && data.length) {
          setActivities(data);
        } else {
          throw new Error('empty');
        }
      })
      .catch(() => {
        setActivities(mockQuestions.map(q => ({
          activityId: q.questionId,
          activityName: q.questionDescription || q.questionText,
          gameType: q.questionDescription ? 'GAME2' : q.questionImage ? 'GAME1' : 'GAME3'
        })));
      });
  }, [classroom]);

  const openModal = (key) => { setSection(key); setCurrent(null); setOpen(true); };
  const closeModal = () => { setOpen(false); setSection(''); setCurrent(null); };
  const start = (act) => setCurrent(act);

  const renderBody = () => {
    if (!current) {
      const list = section === 'Vocabulary'
        ? activities.filter(a => ['GAME1', 'GAME3'].includes(a.gameType))
        : activities.filter(a => a.gameType === 'GAME2');

      return (
        <Stack spacing={3} sx={{ mt: 4, px: 2 }}>
          {list.map(a => {
            // Check if the activity is completed
            const isCompleted = userActivities.some(activity => activity.activity_ActivityId === a.activityId && activity.completed);

            return (
              <Box
                key={a.activityId}
                onClick={() => start(a)}
                sx={{
                  backgroundColor: isCompleted ? '#C8E6C9' : '#FFF8E1',  // Green if completed
                  borderRadius: 4,
                  p: 3,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 'bold' }}>
                  {a.activityName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                  {a.gameType === 'GAME1' ? 'One Pic Four Words' :
                    a.gameType === 'GAME2' ? 'Phrase Translation' : 'Word Translation'}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      );
    }

    // Render the correct game component
    if (section === 'Vocabulary') {
      return current.gameType === 'GAME1'
        ? <OnePicFourWord activityId={current.activityId} />
        : <WordTranslation activityId={current.activityId} />;
    }

    return <PhraseTranslation activityId={current.activityId} />;
  };

  const sections = [
    { key: 'Vocabulary', icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />, bg: '#FFEBEE' },
    { key: 'Grammar', icon: <GTranslateIcon sx={{ fontSize: 48, color: '#1E88E5' }} />, bg: '#E3F2FD' },
    { key: 'Activity', icon: <SportsEsportsIcon sx={{ fontSize: 48, color: '#388E3C' }} />, bg: '#E8F5E9' }
  ];

  return (
    <Grid container direction="column" alignItems="center" sx={{ minHeight: '100vh', p: 2, backgroundColor: '#E1F5FE' }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#4E342E' }}>
        {user ? `Welcome, ${userDetails.firstName}!` : 'Welcome, Friend!'}
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: '#6D4C41' }}>
        Choose a section to start learning:
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
        {sections.map(s => (
          <Box
            key={s.key}
            onClick={() => openModal(s.key)}
            sx={{
              backgroundColor: s.bg,
              width: 360, height: 560,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer', transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.05)', boxShadow: '0 6px 12px rgba(0,0,0,0.15)' }
            }}>
            {s.icon}
            <Typography variant="subtitle1" sx={{ mt: 1, color: '#4E342E' }}>{s.key}</Typography>
          </Box>
        ))}
      </Stack>
      <Modal open={open} onClose={closeModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={open}>
          <Box sx={{ position: 'fixed', top: 0, left: 0, width: '98vw', height: '100vh', bgcolor: '#FFFFFF', color: '#3E2723', p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <IconButton onClick={closeModal}><ArrowBackIcon fontSize='large' sx={{ color: '#6D4C41' }} /></IconButton>
              <IconButton onClick={closeModal}><CloseIcon fontSize='large' sx={{ color: '#6D4C41' }} /></IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{renderBody()}</Box>
          </Box>
        </Fade>
      </Modal>
    </Grid>
  );
}
