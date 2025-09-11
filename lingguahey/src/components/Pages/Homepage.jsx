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
  Button,
  Divider,
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
import DungeonGame from './DungeonGame';
import { useNavigate } from 'react-router-dom';

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextBoxBig from "../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";
import ForestwithShops from "../../assets/images/backgrounds/ForestwithShops.png";
import ShopUI from "../../assets/images/backgrounds/ShopUI.png";
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import SummonUI from "../../assets/images/backgrounds/SummonUI.png";
import DungeonOpen from "../../assets/images/backgrounds/DungeonOpen.png";
import DungeonClosed from "../../assets/images/backgrounds/DungeonClosed.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import GoldCoins from "../../assets/images/objects/GoldCoins.png";


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
  const [shopHealthPotion, setShopHealthPotion] = useState(0);
  const [shopShieldPotion, setShopShieldPotion] = useState(0);
  const [shopSkipPotion, setShopSkipPotion] = useState(0);
  const [shopTotal, setShopTotal] = useState(0);
  const navigate = useNavigate();

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
        
        //console.log('User details:', userResp.data);        
        const endpoint = userResp.data.role === 'TEACHER' 
          ? `classrooms/teacher/${user.userId}`
          : `classrooms/user/${user.userId}`;
        //console.log('Fetching classroom from endpoint:', endpoint);
        const classResp = await API.get(endpoint);
        //console.log ('Classroom response:', classResp.data);
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
        //console.log('Calling handleReturn on LiveActivityGame');
        liveActivityRef.current.handleReturn();
      } else {
        //console.log('No handleReturn available, closing modal directly');
        await closeModal();
      }
    } else if (current) {
      //console.log('Going back to activity list');
      await backToList();
    } else {
      //console.log('Closing modal');
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
          setDeployedActivityId(res.data);
        } catch (err) {
          if (err.response && err.response.status === 403) {
            setDeployedActivityId(null);
          } else {
            console.error('Failed to fetch deployed activity:', err);
            setDeployedActivityId(null);
          }
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
          <Grid container direction="column" alignItems="center" sx={{ width: '100%', height: '100%' }}>
            <Typography variant="h4" align="center" sx={{ paddingTop: 2, paddingBottom: 2 }}>
              asda
              </Typography>
            <Button
              onClick={() => {
                closeModal(); // Close the modal first
                navigate('/dungeon'); // Then navigate to dungeon game
              }}
              sx={{
                width: '250px',
                height: '200px',
                borderRadius: '16px',
                opacity: 0.9,
                position: 'absolute',
                top: '50%',
                '&:hover': {
                  transform: 'scale(1.1)',
                  opacity: 1
                }
              }}
            >
            </Button>
          </Grid>
        );
      }
    else if (section === 'Shop'){
    
      return (
        <Grid container direction="column" alignItems="center" >
            <Box sx={{ position: 'absolute', top: 150, right: 150, 
              backgroundImage: `url(${GameShopField})`, 
              backgroundSize: 'cover',
              width: 538, 
              height: 738, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Stack direction={'column'} sx={{alignItems: 'center', textAlign: 'center'}}>
              <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming',fontSize: 60 }}>
                Potions
              </Typography>
              <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming',fontSize: 60 }}>
                For Sale
              </Typography>
              <Divider sx={{ borderBottomWidth: 5, borderColor: '#5D4037', my: 1, width:400 }} />
              <Stack direction="row" spacing={.5} sx={{alignItems: 'center', justifyContent: 'center'}}>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundImage: `url(${GameShopBoxSmall})`, 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: 290,
                  height: 80,
                  justifyContent: 'center',
                  }}>
                  <img src={HealthPotion} alt="Health Potion" style={{ width: '40px', height: '50px' }} />
                  <Stack direction="column" spacing={0} sx={{alignItems: 'center', justifyContent: 'center', marginLeft: 1}}>
                  
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    Health Potion
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{alignItems: 'center', justifyContent: 'center'}}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    100 Gold
                  </Typography>
                  <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                  </Stack>
                  </Stack>
                </Box>
                  <Button variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 10,
                    height: 60,
                    color: '#5D4037',}}
                    disabled={shopHealthPotion <= 0}
                    onClick={() => {setShopHealthPotion(shopHealthPotion - 1); setShopTotal(shopTotal - 100); }}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      -
                    </Typography>
                  </Button>
                  <Box variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 60,
                    height: 60,
                    color: '#5D4037',}}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      {shopHealthPotion}
                    </Typography>
                  </Box>
                  <Button variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 10,
                    height: 60,
                    color: '#5D4037',}}
                    onClick={() => {setShopHealthPotion(shopHealthPotion + 1); setShopTotal(shopTotal + 100); }}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      +
                    </Typography>
                  </Button>
              </Stack>
              <Stack direction="row" spacing={.5} sx={{alignItems: 'center', justifyContent: 'center', marginTop: 1}}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundImage: `url(${GameShopBoxSmall})`, 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: 290,
                  height: 80,
                  justifyContent: 'center',
                  }}>
                  <img src={ShieldPotion} alt="Shield Potion" style={{ width: '40px', height: '50px' }} />
                  <Stack direction="column" spacing={0} sx={{alignItems: 'center', justifyContent: 'center', marginLeft: 1}}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    Shield Potion
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{alignItems: 'center', justifyContent: 'center'}}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    200 Gold
                  </Typography>
                  <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                  </Stack>
                  </Stack>
                  
                </Box>
                  <Button variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 10,
                    height: 60,
                    color: '#5D4037',}}
                    disabled={shopShieldPotion <= 0}
                    onClick={() => {setShopShieldPotion(shopShieldPotion - 1); setShopTotal(shopTotal - 200); }}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      -
                    </Typography>
                  </Button>
                  <Box variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 60,
                    height: 60,
                    color: '#5D4037',}}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      {shopShieldPotion}
                    </Typography>
                  </Box>
                  <Button variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 10,
                    height: 60,
                    color: '#5D4037',}}
                    onClick={() => {setShopShieldPotion(shopShieldPotion + 1); setShopTotal(shopTotal + 200); }}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      +
                    </Typography>
                  </Button>
              </Stack>
              <Stack direction="row" spacing={.5} sx={{alignItems: 'center', justifyContent: 'center', marginTop: 1}}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundImage: `url(${GameShopBoxSmall})`, 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: 290,
                  height: 80,
                  justifyContent: 'center',
                  }}>
                  <img src={SkipPotion} alt="Skip Potion" style={{ width: '40px', height: '50px' }} />
                  <Stack direction="column" spacing={0} sx={{alignItems: 'center', justifyContent: 'center', marginLeft: 1}}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    Skip Potion
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{alignItems: 'center', justifyContent: 'center'}}>
                  <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                    300 Gold
                  </Typography>
                  <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                  </Stack>
                  </Stack>
                </Box>
                  <Button variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 10,
                    height: 60,
                    color: '#5D4037',}}
                    disabled={shopSkipPotion <= 0}
                    onClick={() => {setShopSkipPotion(shopSkipPotion - 1); setShopTotal(shopTotal - 300); }}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      -
                    </Typography>
                  </Button>
                  <Box variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 60,
                    height: 60,
                    color: '#5D4037',}}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      {shopSkipPotion}
                    </Typography>
                  </Box>
                  <Button variant="contained" sx={{
                    backgroundImage:`url(${ItemBox})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 10,
                    height: 60,
                    color: '#5D4037',}}
                    onClick={() => { setShopSkipPotion(shopSkipPotion + 1); setShopTotal(shopTotal + 300); }}>
                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                      +
                    </Typography>
                  </Button>
              </Stack>

              <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', marginTop: 2 }}>
                Total: {shopTotal} Gold
              </Typography>
              <Button 
                sx={{ 
                  width: 400,
                  height: 80,
                  marginTop: 2,
                  backgroundImage:`url(${GameTextField})`,
                  backgroundSize: 'cover',
                }}>
                <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                  Buy
                </Typography>
              </Button>
            </Stack>
          </Box>
        </Grid>
      );
    }
    else {
      return (
        <Grid container direction="column" alignItems="center" sx={{ mt: 2 }}> 
        <Button sx={{ mt: 2,
          position: 'absolute',
          top: '75%',
          left: '39%',
          backgroundImage:`url(${GameTextField})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: 400,
          height: 80,
          }} 
          variant="contained">
          <Stack direction="column" alignItems="center">
            <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
              Summon for
            </Typography>
            <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
              100 Gems
            </Typography>
          </Stack>
        </Button>
        </Grid>
      );
    }
    }

    return null;
  }
  // ---------------------------------------------

  const sections = [
    {
      key: 'Shop',
      icon: <BookIcon sx={{ fontSize: 48, color: '#6D4C41' }} />,
      bg: '#FFEBEE',
      progress: progressVocab,
    },
    {
      key: 'Summon',
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
    <Grid 
      container 
      direction="column" 
      alignItems="center" 
      sx={{ 
        backgroundImage: `url(${ForestwithShops})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '56.25vw', // This maintains 16:9 aspect ratio (9/16 = 0.5625)
        maxHeight: '100vh',
        maxWidth: '177.78vh', // This maintains 16:9 aspect ratio (16/9 = 1.7778)
        margin: 'auto',
        position: 'relative',
        overflow: 'auto'
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, left: 16, 
        backgroundImage: `url(${NameTab})`, 
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center', 
        width: 700, 
        height: 150, 
        display: 'flex', 
        alignItems: 'center', 
        paddingLeft: 2 }}>
          <Stack direction={'column'}>
            <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 25 }}>
              {userDetails.firstName}
            </Typography>
            <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 25 }}>
              Rank: Mage
            </Typography>
          </Stack>
  
      </Box>
      <Stack 
        direction="row" 
        spacing={4} 
        sx={{ 
          position: 'absolute',
          width: '100%',
          justifyContent: 'space-around',
          top: '60%',
          transform: 'translateY(-50%)'
        }}
      >
        {/* Left structure button */}
        <Button
          onClick={() => openModal('Shop')}
          sx={{
            width: '200px',
            height: '200px',
            borderRadius: '16px',
            opacity: 0.9,
            position: 'relative',
            left: '1%',  // Adjust this value to align with left structure
            '&:hover': {
              transform: 'scale(1.1)',
              opacity: 1
            }
          }}
        >
        </Button>

        {/* Middle structure button */}
        <Button
          onClick={() => openModal('Summon')}
          sx={{
            width: '200px',
            height: '200px',
            borderRadius: '16px',
            opacity: 0.9,
            position: 'relative',
            right: '-2%',  // Adjust this value to align with middle structure
            '&:hover': {
              transform: 'scale(1.1)',
              opacity: 1
            }
          }}
        >

        </Button>

        {/* Right structure button */}
        <Button
          onClick={() => openModal('Activity')}
          sx={{
            width: '200px',
            height: '200px',
            borderRadius: '16px',
            opacity: 0.9,
            position: 'relative',
            right: '-8%',  // Adjust this value to align with right structure
            '&:hover': {
              transform: 'scale(1.1)',
              opacity: 1
            }
          }}
        >
        </Button>
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
              backgroundImage: `url(${section === 'Shop' 
              ? ShopUI 
              : section === 'Summon' 
                ? SummonUI 
                : DungeonOpen})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100vw',
              height: '56.25vw', // This maintains 16:9 aspect ratio (9/16 = 0.5625)
              maxHeight: '100vh',
              maxWidth: '177.78vh', // This maintains 16:9 aspect ratio (16/9 = 1.7778)
              margin: 'auto',
              position: 'relative',
              overflow: 'auto'
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
            {/* Modal Content 
            <Typography variant="h2" sx={{ textAlign: 'center', visibility: secVisibility ? 'visible' : 'hidden' }}>
              {section === 'Activity' ? 'King of the Hill!' : `${section} Activities!`}
            </Typography>*/}
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
