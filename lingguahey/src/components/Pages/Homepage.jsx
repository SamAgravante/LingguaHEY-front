// src/components/Pages/Homepage.jsx
import React, { useState, useEffect, useContext, useRef, use } from 'react';
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
import DungeonSection from '../sections/DungeonSection';
import ShopSection from '../sections/ShopSection';
import SummonSection from '../sections/SummonSection';
import SettingsNav from '../sections/SettingsNav';

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
import Tablet from "../../assets/images/objects/Tablet.png";
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import Gems from "../../assets/images/objects/Gems.png";
import Gears from "../../assets/images/objects/gears.png";
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import MCNoWeapon from '../../assets/images/characters/MCNoWeapon.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';


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
  const [activities, setActivities] = useState([]); const [current, setCurrent] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [userActivities, setUserActivities] = useState([]);
  const { refreshScore } = useScore();
  const [progressVocab, setProgressVocab] = useState(0);
  const [progressGrammar, setProgressGrammar] = useState(0);
  const [secVisibility, setSecVisibility] = useState(true);
  const liveActivityRef = useRef(null);
  const [shopHealthPotion, setShopHealthPotion] = useState(0);
  const [shopShieldPotion, setShopShieldPotion] = useState(0);
  const [shopSkipPotion, setShopSkipPotion] = useState(0);
  const [shopTotal, setShopTotal] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const navigate = useNavigate();

  const [makeMessageAppear, setMakeMessageAppear] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [levelDetails, setLevelDetails] = useState([]);
  const [dungeonPreperatory, setDungeonPreparatory] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [monsterIndex, setMonsterIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  //function 
  async function buyPotion() {
    console.log('buyPotion Function is called');
    try {
      //Health Potion Loop
      for (let count = 0; count < shopHealthPotion; count++) {
        const buyResp = await API.post(`/potion-shop/buy`, {
          userId: userDetails.userId,
          potionType: 'HEALTH',
          cost: 100
        });
        console.log(buyResp.data);
      }

      //Shield Potion Loop
      for (let count = 0; count < shopShieldPotion; count++) {
        const buyResp = await API.post(`/potion-shop/buy`, {
          userId: userDetails.userId,
          potionType: 'SHIELD',
          cost: 200
        });
        console.log(buyResp.data);
      }

      //Skip Potion Loop
      for (let count = 0; count < shopSkipPotion; count++) {
        const buyResp = await API.post(`/potion-shop/buy`, {
          userId: userDetails.userId,
          potionType: 'SKIP',
          cost: 300
        });
        console.log(buyResp.data);
      }

      // Fetch updated user details after purchase
      const userResp = await API.get(`/users/${userDetails.userId}`);
      setUserDetails(userResp.data);
      setCoins(userResp.data.coins); // Update coins state

      setShopHealthPotion(0);
      setShopShieldPotion(0);
      setShopSkipPotion(0);
      setMakeMessageAppear(false);
      setShopTotal(0);
    } catch (err) {
      console.error(err);
    }
  }

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
        setCoins(userResp.data.coins); // Initialize coins state
        setGems(userResp.data.gems);

        //console.log('User details:', userResp.data);        
        const endpoint = userResp.data.role === 'TEACHER'
          ? `classrooms/teacher/${user.userId}`
          : `classrooms/user/${user.userId}`;
        //console.log('Fetching classroom from endpoint:', endpoint);
        const classResp = await API.get(endpoint);
        console.log('Classroom response:', classResp.data);
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

        //const prog = await API.get(`/activities/${user.userId}/progress`);
        //setProgressVocab(prog.data.gameSet1Progress * 100);
        //setProgressGrammar(prog.data.gameSet2Progress * 100);

        //Level Details
        const levelResp = await API.get(`/levels`);
        console.log(levelResp);
        setLevelDetails(levelResp.data);
        console.log(levelResp.data);

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
    setCoins(userDetails.coins);
    setGems(userDetails.gems);
  }; const closeModal = async () => {
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

  function renderGemAndCoinsTab() {
    return (
      <>
        {/* Gem Tab */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 180,
            backgroundImage: `url(${ItemBox})`,
            backgroundSize: 'cover',
            width: 90,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 2,
            justifyContent: 'center',
            paddingRight: 2,
            paddingTop: 1,
          }}
        >
          <Box sx={{ width: 1000, height: 400, right: '1000%', top: '360%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Stack direction='row'>
              <Box sx={{
                width: '220px', height: '215px', position: 'absolute', bottom: 0, left: 0,
                //border: '2px solid red' 
              }}>
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={MCNoWeapon} alt="Player" style={{ position: 'absolute', top: 0, left: 0, width: '220px', height: '215px' }} />
                  <img src={WeaponBasicStaff} alt="Weapon" style={{ position: 'absolute', top: 0, left: 0, width: '220px', height: '215px' }} />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="column"
            sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
          >
            <img src={Gems} alt="Gems" style={{ width: '17px', height: '42px' }} />
            <Typography
              variant="h4"
              color="#5D4037"
              sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}
            >
              {userDetails.gems || 0}
            </Typography>
          </Stack>
        </Box>

        {/* Gold Tab */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundImage: `url(${ItemBox})`,
            backgroundSize: 'cover',
            width: 90,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 2,
            justifyContent: 'center',
            paddingRight: 2,
            paddingTop: 1,
          }}
        >
          <Stack
            direction="column"
            sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
          >
            <img
              src={GoldCoins}
              alt="Gold Coins"
              style={{ width: '42px', height: '42px' }}
            />
            <Typography
              variant="h4"
              color="#5D4037"
              sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}
            >
              {coins || 0}  {/* Use coins state instead of userDetails.coins */}
            </Typography>
          </Stack>
        </Box>
      </>
    );
  }


  function renderBody() {
    // 1) Before selecting any item
    if (!current) {
      if (section === 'Dungeon') {
        const currentLevel = levelDetails[currentLevelIndex];
        return (
          <DungeonSection
            closeModal={closeModal}
            currentLevel={currentLevel}
            currentLevelIndex={currentLevelIndex}
            setCurrentLevelIndex={setCurrentLevelIndex}
            levelDetails={levelDetails}
            dungeonPreperatory={dungeonPreperatory}
            setDungeonPreparatory={setDungeonPreparatory}
            user={user}
          />
        );
      } else if (section === 'Shop') {
        return (
          <ShopSection
            shopHealthPotion={shopHealthPotion}
            setShopHealthPotion={setShopHealthPotion}
            shopShieldPotion={shopShieldPotion}
            setShopShieldPotion={setShopShieldPotion}
            shopSkipPotion={shopSkipPotion}
            setShopSkipPotion={setShopSkipPotion}
            shopTotal={shopTotal}
            setShopTotal={setShopTotal}
            makeMessageAppear={makeMessageAppear}
            setMakeMessageAppear={setMakeMessageAppear}
            buyPotion={buyPotion}
            handleBackClick={handleBackClick}
            renderGemAndCoinsTab={renderGemAndCoinsTab}
          />
        );
      } else if (section === 'Summon') {
        return (
          <SummonSection
            handleBackClick={handleBackClick}
            renderGemAndCoinsTab={renderGemAndCoinsTab}
          />
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
      <Box sx={{
        position: 'absolute', top: 16, left: 16,
        backgroundImage: `url(${NameTab})`,
        backgroundSize: 'cover',
        width: 730,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 2
      }}>
        <img src={MCHeadshot} alt="Player" style={{ width: 100, height: 100, marginLeft: 10 }} />
        <Stack direction={'column'}>
          <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 5 }}>
            {userDetails.firstName || 'Player Name'}
          </Typography>
          <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 5 }}>
            Rank: Mage
          </Typography>
        </Stack>
      </Box>
      {renderGemAndCoinsTab()}

      {/* Settings */}
      <Box
        sx={{
          position: 'absolute',
          top: 200,
          left: 16,
          backgroundImage: `url(${Gears})`,
          backgroundSize: 'cover',
          width: 50,
          height: 65,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 2,
          cursor: 'pointer'  // Add this to show it's clickable
        }}
        onClick={() => setSettingsOpen(!settingsOpen)}
      >
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
          onClick={() => openModal('Dungeon')}
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

      {/* Settings Modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={settingsOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 370,
              backgroundImage: `url(${MenuBoxVert})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              height: 600,
              borderRadius: 2,
              p: 16,
            }}
          >
            <SettingsNav onClose={() => setSettingsOpen(false)} />
          </Box>
        </Fade>
      </Modal>

    </Grid>
  );
}
