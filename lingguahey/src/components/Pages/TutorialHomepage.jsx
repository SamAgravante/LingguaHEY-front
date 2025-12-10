// src/components/Pages/TutorialHomepage.jsx (Refactored for Tutorial Navigation)
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  Grid,
  Stack,
  Box,
  Typography,
  Modal,
  Fade,
  IconButton,
  LinearProgress,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// --- API & Auth Imports ---
import API from '../../api';
import { getUserFromToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

// --- Context and Style Imports ---
import { MusicContext } from '../../contexts/MusicContext';
import { styled } from '@mui/system';

// Mock Component Imports (Keep for structure)
import SettingsNav from '../sections/SettingsNav';
import LiveActivityGame from './LiveActivityGame';

// Asset Imports (Retained)
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import ForestwithShopsAnimated from "../../assets/images/backgrounds/ForestwithShopsAnimated.gif";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/Itembox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Gems from "../../assets/images/objects/Gems.png";
import Gears from "../../assets/images/objects/gears.png";
import MultiplayerIcon from "../../assets/images/objects/MultiplayerIcon.png";
import CodexBroken from "../../assets/images/objects/CodexBroken.png";
import TabMarkCodex from "../../assets/images/objects/TabMarkCodex.png";
import TabMarkInventory from "../../assets/images/objects/TabMarkInventory.png";
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import MCNoWeaponArm from '../../assets/images/characters/MCNoWeaponArm.png';
import MCNoWeaponAnimated from '../../assets/images/characters/MCNoWeaponAnimated.png';
import ArrowNext from "../../assets/images/objects/ArrowNext.png";
import ArrowPrev from "../../assets/images/objects/ArrowPrev.png";
import InventoryCharacterArea from "../../assets/images/objects/InventoryCharacterArea.png";
import InventoryUIArea from "../../assets/images/objects/InventoryUIArea.png";
import InventoryItemArea from "../../assets/images/objects/InventoryItemArea.png";
import GameShopBoxSmall from '../../assets/images/backgrounds/GameShopBoxSmall.png';
import ScrollBig from '../../assets/images/objects/ScrollBig.png';
import PixieFly from '../../assets/images/characters/PixieFly.png'; 
import DungeonOpen from '../../assets/images/backgrounds/DungeonOpen.png'; 

// Mock Base64 Data (Used for Inventory/Codex)
const WEAPON_BASIC_STAFF_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==';
const HELLFIRE_STAFF_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADlgBmgwA2yQAAAABJRU5ErkJggg==';

// --- MOCK DATA (Initial values) ---
const MOCK_COINS = 500;
const MOCK_GEMS = 10;
const MOCK_EQUIPPED_ID = 'basic-staff-1';

const initialMockUserDetails = {
  userId: null,
  firstName: 'Loading...',
  coins: MOCK_COINS,
  gems: MOCK_GEMS,
  equipped_cosmetic_id: MOCK_EQUIPPED_ID,
  role: 'STUDENT',
  potions: { HEALTH: 5, SHIELD: 2, SKIP: 1, },
  shopTutorialCheckpoint: false,
  summonTutorialCheckpoint: false,
  dungeonTutorialCheckpoint: false, 
};

const mockInventory = [
  { cosmeticId: MOCK_EQUIPPED_ID, name: 'Basic Staff', rarity: 'COMMON', cosmeticImage: WEAPON_BASIC_STAFF_BASE64 },
  { cosmeticId: 'hellfire-staff-2', name: 'Hellfire Staff', rarity: 'LEGENDARY', cosmeticImage: HELLFIRE_STAFF_BASE64 },
  { cosmeticId: 'some-item-3', name: 'Magic Wand', rarity: 'RARE', cosmeticImage: WEAPON_BASIC_STAFF_BASE64 },
  null, null, null, null, null, null, null
].slice(0, 10);

const mockMonsterList = [
  { tagalogName: 'Tikbalang', englishName: 'Horse Demon', description: 'A half-man, half-horse creature.', imageData: WEAPON_BASIC_STAFF_BASE64 },
  { tagalogName: 'Aswang', englishName: 'Vampire/Ghoul', description: 'A shapeshifting monster that preys on people.', imageData: HELLFIRE_STAFF_BASE64 },
  { tagalogName: 'Kapre', englishName: 'Tree Giant', description: 'A tall, hairy giant smoking a large cigar.', imageData: WEAPON_BASIC_STAFF_BASE64 },
  { tagalogName: 'Manananggal', englishName: 'Flying Torso', description: 'A woman who detaches her upper torso to fly.', imageData: HELLFIRE_STAFF_BASE64 },
  { tagalogName: 'Siyokoy', englishName: 'Merman', description: 'A hostile fish-like creature.', imageData: WEAPON_BASIC_STAFF_BASE64 },
  { tagalogName: 'Nuno sa Punso', englishName: 'Dwende (Dwarf)', description: 'A goblin-like spirit living in an anthill.', imageData: HELLFIRE_STAFF_BASE64 },
];

// --- TUTORIAL SCRIPT (Step 7 dialogue fixed and uses 'CONTINUE') ---
const TUTORIAL_STEPS = {
    1: {
        dialog: "Welcome back! Before we go into the Dungeon, let's make sure you know how to navigate.",
        pointer: null,
        waitFor: 'CONTINUE',
    },
    2: {
        dialog: "First, we check the **Shop Tutorial** status. If you haven't completed it, you will be guided there.",
        pointer: null,
        waitFor: 'CHECK_SHOP',
    },
    3: {
        dialog: "You have not completed the **Shop Tutorial** yet. Click the **Shop** button to begin!",
        pointer: 'SHOP_BUTTON',
        waitFor: 'SHOP_NAVIGATION',
    },
    4: {
        dialog: "Great! You have completed the **Shop Tutorial**. Now, let's move on to the **Summon** section.",
        pointer: null,
        waitFor: 'CONTINUE',
    },
    5: {
        dialog: "If you haven't completed the **Summon Tutorial**, you will be guided there now.",
        pointer: null,
        waitFor: 'CHECK_SUMMON',
    },
    6: {
        dialog: "You have not completed the **Summon Tutorial** yet. Click the **Summon** button to proceed!",
        pointer: 'SUMMON_BUTTON',
        waitFor: 'SUMMON_NAVIGATION',
    },
    7: {
        dialog: "Excellent! You have now navigated all the major sections of the Homepage. The tutorial is complete. Click **Continue** to go to the main game!",
        pointer: null, 
        waitFor: 'CONTINUE', 
    }
};

// Placeholder for the Pointer component (The Arrow)
const Pointer = ({ style }) => (
    <div style={{
        position: 'absolute',
        top: '25%', 
        left: '50%',
        transform: 'translateX(-50%) translateY(-100%)',
        fontSize: '40px',
        color: 'yellow',
        animation: 'bounce 1s infinite',
        textShadow: '0 0 5px black',
        zIndex: 200, 
        ...style
    }}>
        👇
    </div>
);


// --- STYLED COMPONENTS (Retained) ---

const PastelProgress = styled(LinearProgress)(() => ({
  height: '12px',
  borderRadius: '8px',
  backgroundColor: '#EAEAEA',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(to right, #BAFFC9, #FFB3BA)',
    borderRadius: '8px',
  },
}));

// --- COMPONENT ---

export default function TutorialHomepage() {
  // --- STATE & HOOKS ---
  const { setSrc, playCancel, playEquip, playFlip, playDenied, playConfirm } = useContext(MusicContext);

  // User/API State
  const [user, setUser] = useState({ userId: null });
  const [details, setDetails] = useState(initialMockUserDetails);
  const [coins, setCoins] = useState(MOCK_COINS);
  const [gems, setGems] = useState(MOCK_GEMS);
  const [isLoading, setIsLoading] = useState(true);

  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState(1);
  const [dialogText, setDialogText] = useState("");
  const [shopTutorialComplete, setShopTutorialComplete] = useState(false);
  const [summonTutorialComplete, setSummonTutorialComplete] = useState(false);
  const totalSteps = Object.keys(TUTORIAL_STEPS).length; 
  const currentStepData = TUTORIAL_STEPS[tutorialStep];


  // Navigation Hook
  const navigate = useNavigate();

  // Modals 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [codexOpen, setCodexOpen] = useState(false);
  const [multiplayerOpen, setMultiplayerOpen] = useState(false);

  // Other Mock States
  const [monsterList] = useState(mockMonsterList);
  const [inventory] = useState(mockInventory);
  const [leftPageCounter, setLeftPageCounter] = useState(0);
  const [rightPageCounter, setRightPageCounter] = useState(1);
  const [itemEquipped, setItemEquipped] = useState(mockInventory.find(item => item && item.cosmeticId === MOCK_EQUIPPED_ID));
  const liveActivityRef = useRef(null);
  const deployedActivityId = 'mock-deployed-activity-id';
  const secVisibility = true;

  const rarityBackgrounds = {
    COMMON: '#5D4037',
    RARE: '#a1ccce',
    MYTHIC: '#cb7275',
    LEGENDARY: '#fbf236',
  };

  // Mock functions (retained)
  const codexNavigationLeft = () => { playFlip(); setLeftPageCounter(prev => prev - 2); setRightPageCounter(prev => prev - 2); };
  const codexNavigationRight = () => { playFlip(); setLeftPageCounter(prev => prev + 2); setRightPageCounter(prev => prev + 2); };
  const equipItemMock = (item) => { playEquip(); setItemEquipped(item); setDetails(prev => ({ ...prev, equipped_cosmetic_id: item.cosmeticId })) };


  // --- API INTEGRATION: PHASE 1 (Token Check) ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = getUserFromToken(token);
      if (decodedUser && decodedUser.userId) {
        setUser({ userId: decodedUser.userId });
        return;
      }
    }
    setUser({ userId: 'mock-guest-id' });
  }, []);

  // --- API INTEGRATION: PHASE 2 (User's Snippet Logic + Checkpoints) ---
  useEffect(() => {
    if (!user || !user.userId) return;

    if (user.userId === 'mock-guest-id') {
      setIsLoading(false);
      setDetails(prev => ({ ...prev, firstName: 'Tutorial Guest', shopTutorialCheckpoint: false, summonTutorialCheckpoint: false }));
      return;
    }

    let isMounted = true;

    const fetchUserDetails = async () => {
      let userResp;

      try {
        userResp = await API.get(`/users/${user.userId}`);
        console.log(userResp.data);

        if (isMounted) {
          setDetails(prev => ({ ...prev, ...userResp.data }));
          setCoins(userResp.data.coins);
          setGems(userResp.data.gems);
          setShopTutorialComplete(userResp.data.shopTutorialCheckpoint || false);
          setSummonTutorialComplete(userResp.data.summonTutorialCheckpoint || false);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response && err.response.status === 403) {
            navigate('/login', { state: { snackMessage: 'Session expired. Please log in again.', snackSeverity: 'error' } });
          } else {
            console.error('Error retrieving user details:', err);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]); 


  // --- TUTORIAL LOGIC (Updated to skip to Step 7 if Shop & Summon are complete at Step 2) ---

  // Effect to manage tutorial progression (Skipping steps if already complete)
  useEffect(() => {
    if (isLoading) return;

    const stepData = TUTORIAL_STEPS[tutorialStep];
    if (stepData) {
      setDialogText(stepData.dialog);

      if (stepData.waitFor === 'CHECK_SHOP') {
        if (shopTutorialComplete) {
            // **NEW LOGIC: Check for Summon completion here to skip Step 4**
            if (summonTutorialComplete) {
                setTutorialStep(7); // Skip directly to step 7 (Final dialogue)
            } else {
                setTutorialStep(4); // Go to step 4 (Continue to summon check)
            }
        } else {
          setTutorialStep(3); // Go to step 3 (Shop incomplete, guide to Shop button)
        }
      } else if (stepData.waitFor === 'CHECK_SUMMON') {
        if (summonTutorialComplete) {
          setTutorialStep(7); // Skip to step 7 (Summon complete, final step)
        } else {
          setTutorialStep(6); // Go to step 6 (Summon incomplete, guide to Summon button)
        }
      }
    }
  }, [tutorialStep, isLoading, shopTutorialComplete, summonTutorialComplete]);

  // Handler to proceed the tutorial on 'Continue' button click (Modified for final navigation)
  const handleContinue = useCallback(() => {
    playConfirm();

    // FINAL STEP LOGIC
    if (tutorialStep === totalSteps && currentStepData.waitFor === 'CONTINUE') { 
        setSrc('BGM_MainMenu.mp3'); 
        navigate("/homepage"); // Navigates to the real homepage on Step 7 Continue
        setTutorialStep(totalSteps + 1); // Mark tutorial as finished
        return;
    }

    // Normal progression logic
    const nextStep = tutorialStep + 1;
    if (currentStepData.waitFor === 'CONTINUE') {
        setTutorialStep(nextStep);
    }
  }, [currentStepData, tutorialStep, totalSteps, navigate, playConfirm, setSrc]);

  // Helper to determine if a specific button is disabled by the tutorial
  const isButtonDisabled = (key) => {
    // 1. If tutorial is finished or waiting for 'Continue', all main nav buttons are disabled (except after completion)
    if (!currentStepData || tutorialStep > totalSteps) {
      return false;
    }
    
    // If the step is waiting for 'CONTINUE' (e.g., Step 1, 4, or 7) or a check, disable all main navigation buttons.
    if (currentStepData.waitFor === 'CONTINUE' || currentStepData.waitFor === 'CHECK_SHOP' || currentStepData.waitFor === 'CHECK_SUMMON') {
        return true; 
    }


    // 2. Check for the specific navigation step and enable ONLY the target button
    if (currentStepData.waitFor === 'SHOP_NAVIGATION') {
      return key !== 'Shop'; // true for Summon/Dungeon, false for Shop
    }
    if (currentStepData.waitFor === 'SUMMON_NAVIGATION') {
      return key !== 'Summon'; // true for Shop/Dungeon, false for Summon
    }
    
    // 3. If we are on a step that requires no main navigation (like CHECK_SHOP/CHECK_SUMMON), disable all.
    return true; 
  };


  // --- REFACTORED NAVIGATION FUNCTIONS ---

  const openModal = key => {
    // Deny click if the button is disabled by the tutorial
    if (isButtonDisabled(key)) {
      playDenied();
      return;
    }

    playConfirm(); // Use confirm for successful navigation

    let path = '';
    switch (key) {
      case 'Dungeon':
        // Clicking Dungeon now only leads to the Tutorial Dungeon (as the final step is handled by Continue)
        path = '/TutorialDungeon'; 
        setSrc('BGM_DungeonLevelSelect.wav');
        break;
      case 'Shop':
        path = '/TutorialShop';
        if (currentStepData.waitFor === 'SHOP_NAVIGATION') {
            setShopTutorialComplete(true); // Mocking completion (will be verified on return)
            setTutorialStep(4); // Advance to the 'Shop Complete' dialogue on return
        }
        break;
      case 'Summon':
        path = '/TutorialSummon';
        if (currentStepData.waitFor === 'SUMMON_NAVIGATION') {
            setSummonTutorialComplete(true); // Mocking completion (will be verified on return)
            setTutorialStep(7); // Advance to the 'Summon Complete' dialogue on return
        }
        break;
      default:
        return;
    }
    navigate(path);
  };

  // --- HANDLER FOR SETTINGS MODAL ---
  const handleProfileUpdated = (updatedDetails) => {
    console.log("Profile updated from SettingsNav. Closing modal.");
    setSettingsOpen(false); 
  };


    function renderGemAndCoinsTab() {
      // ... (Currency rendering logic)
      return (
        <>
          {/* Gem Tab */}
          <Box
            sx={{
              position: 'absolute', top: 16, right: 180, backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 90, height: 120, display: 'flex', alignItems: 'center', paddingLeft: 2, justifyContent: 'center', paddingRight: 2, paddingTop: 1,
            }}
          >
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
                {gems || 0}
              </Typography>
            </Stack>
          </Box>

          {/* Gold Tab */}
          <Box
            sx={{
              position: 'absolute', top: 16, right: 16, backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 90, height: 120, display: 'flex', alignItems: 'center', paddingLeft: 2, justifyContent: 'center', paddingRight: 2, paddingTop: 1,
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
                {coins || 0}
              </Typography>
            </Stack>
          </Box>
        </>
      );
    }

    function renderCharacter() {
      // ... (Character rendering logic)
      return (
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '220px',
          height: '215px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Stack direction='row'>
            <Box sx={{
              width: '220px',
              height: '215px',
              position: 'relative',
              ml: 80,
              mb: 10
            }}>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={MCNoWeaponArm}
                  alt="Player"
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '220px', height: '215px', zIndex: 3
                  }}
                />
                <img
                  src={MCNoWeaponAnimated}
                  alt="Player"
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '220px', height: '215px', zIndex: 1
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>
      );
    }

  // --- MAIN RENDER ---

  if (isLoading) {
    return <Typography variant="h1" color="white" sx={{ p: 5 }}>Loading...</Typography>;
  }

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      sx={{
        backgroundImage: `url(${ForestwithShopsAnimated})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '56.25vw',
        maxHeight: '100vh',
        maxWidth: '177.78vh',
        margin: 'auto',
        position: 'relative',
        overflow: 'auto'
      }}
    >
      {/* --- Top Left Player Info --- */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, backgroundImage: `url(${NameTab})`, backgroundSize: 'cover', width: 730, height: 150, display: 'flex', alignItems: 'center', paddingLeft: 2 }}>
        <img src={MCHeadshot} alt="Player" style={{ width: 100, height: 100, marginLeft: 10 }} />
        <Stack direction={'column'}>
          <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 5 }}>
            {details.firstName}
          </Typography>
        </Stack>
      </Box>

      {/* --- Top Right Currency --- */}
      {renderGemAndCoinsTab()}
      {/* --- Player Character --- */}
      {renderCharacter()}

      {/* --- Left Side Icons (Settings, Inventory, Codex, Multiplayer) --- */}
      {/* Settings */}
      <Box
        sx={{ position: 'absolute', top: 200, left: 16, backgroundImage: `url(${Gears})`, backgroundSize: 'cover', width: 50, height: 65, display: 'flex', alignItems: 'center', paddingLeft: 2, cursor: 'pointer', opacity: tutorialStep > totalSteps ? 1 : 0.5 }}
        onClick={() => { if(tutorialStep > totalSteps) { playCancel(); setSettingsOpen(!settingsOpen) } else { playDenied(); } }}
      >
      </Box>

      {/* Inventory */}
      <Box
        sx={{ position: 'absolute', top: 280, left: 16, backgroundImage: `url(${TabMarkInventory})`, backgroundSize: 'cover', width: 140, height: 65, display: 'flex', alignItems: 'center', paddingLeft: 2, cursor: 'pointer', opacity: tutorialStep > totalSteps ? 1 : 0.5 }}
        onClick={() => { if(tutorialStep > totalSteps) { playCancel(); setInventoryOpen(!inventoryOpen) } else { playDenied(); } }}
      >
      </Box>

      {/* Codex */}
      <Box
        sx={{ position: 'absolute', top: 360, left: 16, backgroundImage: `url(${TabMarkCodex})`, backgroundSize: 'cover', width: 140, height: 65, display: 'flex', alignItems: 'center', paddingLeft: 2, cursor: 'pointer', opacity: tutorialStep > totalSteps ? 1 : 0.5 }}
        onClick={() => { if(tutorialStep > totalSteps) { playCancel(); setCodexOpen(!codexOpen) } else { playDenied(); } }}
      >
      </Box>

      {/* Multiplayer */}
      <Box
        sx={{ position: 'absolute', top: 450, left: 24, backgroundImage: `url(${MultiplayerIcon})`, backgroundSize: 'cover', width: 65, height: 65, display: 'flex', alignItems: 'center', cursor: 'pointer', zIndex: 10, opacity: tutorialStep > totalSteps ? 1 : 0.5 }}
        onClick={() => { if(tutorialStep > totalSteps) { playCancel(); setMultiplayerOpen(true); } else { playDenied(); } }}
      />


      {/* --- Main Navigation Buttons (Shop, Summon, Dungeon) --- */}
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
        {/* Left structure button (Shop) */}
        <Button
          onClick={() => openModal('Shop')}
          disabled={isButtonDisabled('Shop')}
          sx={{
            width: '200px', height: '200px', borderRadius: '16px', opacity: isButtonDisabled('Shop') ? 0.3 : 0.9, position: 'relative', left: '1%',
            '&:hover': { transform: 'scale(1.1)', opacity: 1 }
          }}
        >
            {currentStepData?.pointer === 'SHOP_BUTTON' && <Pointer />}
        </Button>

        {/* Middle structure button (Summon) */}
        <Button
          onClick={() => openModal('Summon')}
          disabled={isButtonDisabled('Summon')}
          sx={{
            width: '200px', height: '200px', borderRadius: '16px', opacity: isButtonDisabled('Summon') ? 0.3 : 0.9, position: 'relative', right: '-2%',
            '&:hover': { transform: 'scale(1.1)', opacity: 1 }
          }}
        >
            {currentStepData?.pointer === 'SUMMON_BUTTON' && <Pointer />}
        </Button>

        {/* Right structure button (Dungeon) */}
        <Button
          onClick={() => openModal('Dungeon')}
          disabled={isButtonDisabled('Dungeon')}
          sx={{
            width: '200px', height: '200px', borderRadius: '16px', opacity: isButtonDisabled('Dungeon') ? 0.3 : 0.9, position: 'relative', right: '-8%',
            '&:hover': { transform: 'scale(1.1)', opacity: 1 }
          }}
        >
             {/* Pointer removed from Dungeon button for Step 7 */}
        </Button>
      </Stack>


      {/* --- TUTORIAL DIALOGUE OVERLAY (Centered) --- */}
      {tutorialStep <= totalSteps && (
        <Box
            sx={{
                position: 'absolute',
                bottom: '10%',
                left: '50%', // Centering fix applied
                transform: 'translateX(-50%)', // Centering fix applied
                width: '80%',
                maxWidth: 700,
                minHeight: 120,
                backgroundImage: `url(${NameTab})`,
                backgroundSize: '100% 100%',
                padding: 2,
                paddingTop: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 100
            }}
        >
            <Typography color="#5D4037" sx={{ fontFamily: 'RetroGaming', fontSize: 18 }}>
                {dialogText}
            </Typography>
            {(currentStepData?.waitFor === 'CONTINUE') && (
                <Button
                    variant="contained"
                    onClick={handleContinue}
                    sx={{ alignSelf: 'flex-start', mb: 1, ml:1, fontFamily: 'RetroGaming', backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388E3C' } }}
                >
                    Continue
                </Button>
            )}
            <Stack direction="row"
                sx={{
                    position: 'absolute', bottom: 8, right: 8, width:300, alignItems: 'center'
                }}>
                <Typography variant="caption" color="#5D4037" sx={{ fontFamily: 'RetroGaming', fontSize: 16, fontWeight: 'bold', pb:3 }}>
                    Pixie: Step {tutorialStep} of {Object.keys(TUTORIAL_STEPS).length}
                </Typography>
                <img
                    src={PixieFly}
                    alt="Pixie"
                    style={{ width: '70px', height: '70px', position: 'absolute', bottom: 8, right: 8, }}
                />
            </Stack>

        </Box>
      )}


      {/* --- Modals (Retained below this line) --- */}

      {/* --- Settings Modal --- */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        closeAfterTransition
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={settingsOpen}>
          <Box
            sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 370, backgroundImage: `url(${MenuBoxVert})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', height: 600, borderRadius: 2, p: 16,
            }}
          >
            <SettingsNav onProfileUpdated={handleProfileUpdated} userDetails={details} />
          </Box>
        </Fade>
      </Modal>

      {/* --- Codex Modal --- */}
      <Modal
        open={codexOpen}
        onClose={() => setCodexOpen(false)}
        closeAfterTransition
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={codexOpen}>
          <Box
            sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 650, backgroundImage: `url(${CodexBroken})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', height: 430, borderRadius: 2, p: 16,
            }}
          >
            <IconButton onClick={() => { playCancel(); setCodexOpen(false) }} sx={{ position: 'absolute', right: 30, top: 50 }}>
              <CloseIcon />
            </IconButton>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', ml: 2 }} spacing={3}>
              {/* Left Navigation */}
              <Button onClick={() => { playFlip(); codexNavigationLeft() }} disabled={leftPageCounter <= 0} sx={{ position: "absolute", width: 100, height: 40, left: 70, bottom: 160, backgroundImage: `url(${ArrowPrev})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', }} > </Button>

              {/* Left Page Content */}
              <Box sx={{ width: 800, height: 360, display: "flex", alignItems: "center", justifyContent: "center", pr: 7 }}>
                <Stack direction="column" sx={{ alignItems: "center", justifyContent: "center", textAlign: "center", mt: 2 }}>
                  {monsterList[leftPageCounter] ? (
                    <>
                      <Box sx={{ width: "220px", height: "215px" }}> <img src={`data:image/png;base64,${monsterList[leftPageCounter].imageData}`} alt="Enemy" style={{ width: "220px", height: "215px" }} /> </Box>
                      <Typography color="#5D4037" sx={{ mt: 3, width: 250 }}> Tagalog: {monsterList[leftPageCounter].tagalogName} </Typography>
                      <Typography color="#5D4037" sx={{ width: 250 }}> English: {monsterList[leftPageCounter].englishName} </Typography>
                      <Typography color="#5D4037" sx={{ mt: 1, width: 250 }}> "{monsterList[leftPageCounter].description}" </Typography>
                    </>
                  ) : (
                    <Typography color="#5D4037">Page Empty</Typography>
                  )}
                </Stack>
              </Box>

              {/* Right Page Content */}
              <Box sx={{ width: 800, height: 360, display: "flex", alignItems: "center", justifyContent: "center", pl: 7 }}>
                <Stack direction="column" sx={{ alignItems: "center", justifyContent: "center", textAlign: "center", mt: 2 }}>
                  {monsterList[rightPageCounter] ? (
                    <>
                      <Box sx={{ width: "220px", height: "215px" }}> <img src={`data:image/png;base64,${monsterList[rightPageCounter].imageData}`} alt="Enemy" style={{ width: "220px", height: "215px" }} /> </Box>
                      <Typography color="#5D4037" sx={{ mt: 3, width: 250 }}> Tagalog: {monsterList[rightPageCounter].tagalogName} </Typography>
                      <Typography color="#5D4037" sx={{ width: 250 }}> English: {monsterList[rightPageCounter].englishName} </Typography>
                      <Typography color="#5D4037" sx={{ mt: 1, width: 250 }}> "{monsterList[rightPageCounter].description}" </Typography>
                    </>
                  ) : (
                    <Typography color="#5D4037">No monster data available</Typography>
                  )}
                </Stack>
              </Box>

              {/* Right Navigation */}
              <Button color="#5D4037" onClick={() => { playFlip(); codexNavigationRight() }} disabled={rightPageCounter >= (monsterList.length - 1)} sx={{ position: "absolute", width: 100, height: 40, right: 70, bottom: 160, backgroundImage: `url(${ArrowNext})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', }} > </Button>
              <Typography color="#5D4037" sx={{ position: "absolute", width: 100, height: 40, left: 70, top: 80, fontSize: 40 }}> Codex </Typography>
            </Stack>
          </Box>
        </Fade>
      </Modal>

      {/* --- Inventory Modal --- */}
      <Modal
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        closeAfterTransition
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={inventoryOpen}>
          <Box
            sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundImage: `url(${InventoryUIArea})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', height: 505, width: 750, borderRadius: 2, p: 16,
            }}
          >
            <IconButton onClick={() => { playCancel(); setInventoryOpen(false) }} sx={{ position: 'absolute', right: 30, top: 40 }}>
              <CloseIcon />
            </IconButton>

            <Stack direction="row">
              {/* Character Display Area */}
              <Box position="relative" sx={{ width: '300px', height: '415px', backgroundImage: `url(${InventoryCharacterArea})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', display: "flex", alignItems: "center", justifyContent: "center", bottom: 70, right: 40 }}>
                <Box sx={{ width: '320px', height: '315px', }}>
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={MCNoWeaponArm} alt="Player" style={{ position: 'absolute', top: 0, left: 0, width: '320px', height: '315px', zIndex: 3 }} />
                    <img src={MCNoWeaponAnimated} alt="Player" style={{ position: 'absolute', top: 0, left: 0, width: '320px', height: '315px', zIndex: 1 }} />
                    {itemEquipped?.cosmeticImage ? (
                      <img src={`data:image/png;base64,${itemEquipped.cosmeticImage}`} alt="Weapon" style={{ position: 'absolute', top: 0, left: 0, width: '320px', height: '315px', zIndex: 2 }} />
                    ) : null}
                  </Box>
                </Box>
              </Box>

              {/* Equipped Item Info (Top Middle) */}
              <Stack direction="column" alignItems="center">
                <Box sx={{ width: 150, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mt: 10 }}>
                  <Box sx={{ width: 100, height: 100, backgroundImage: `url(${ItemBox})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    {itemEquipped?.cosmeticImage ? (
                      <img src={`data:image/png;base64,${itemEquipped.cosmeticImage}`} alt={itemEquipped.name} style={{ width: 100, height: 100 }} />
                    ) : null}
                  </Box>
                  <Typography variant="h5" color={rarityBackgrounds[itemEquipped?.rarity] || '#5D4037'} sx={{ WebkitTextStroke: '.4px #180f0c', textAlign: 'center', mt: 1 }}>
                    {itemEquipped?.name || 'Nothing'}
                  </Typography>
                </Box>
              </Stack>

              {/* Potion List (Right Side) */}
              <Stack direction="column" spacing={2} sx={{ ml: 6, }}>
                {['HEALTH', 'SHIELD', 'SKIP'].map((potionType) => (
                  <Box key={potionType} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundImage: `url(${GameShopBoxSmall})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: 290, height: 80, justifyContent: 'center', }}>
                    <img src={potionType === 'HEALTH' ? HealthPotion : potionType === 'SHIELD' ? ShieldPotion : SkipPotion} alt={`${potionType} Potion`} style={{ width: '40px', height: '50px' }} />
                    <Stack direction="column" spacing={0} sx={{ alignItems: 'center', justifyContent: 'center', marginLeft: 1 }}>
                      <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}> {potionType.charAt(0) + potionType.slice(1).toLowerCase()} Potion </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}> (Amount: {details?.potions?.[potionType] || 0}) </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>

            {/* Inventory Item List area */}
            <Box position="relative" sx={{ width: '850px', height: '200px', backgroundImage: `url(${InventoryItemArea})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', display: "flex", alignItems: "center", justifyContent: "center", bottom: 40, right: 43, mt: 1 }}>
              <Box sx={{ width: '900px', height: '115px', display: "flex", alignItems: "center", justifyContent: "center", }}>
                <Grid container spacing={1} columns={10} sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
                  {mockInventory.map((item, index) => {
                    const isEquipped = item && details.equipped_cosmetic_id === item.cosmeticId;

                    return (
                      <Grid item xs={1} key={index}>
                        <Button variant="contained" onClick={() => item && equipItemMock(item)} disabled={!item} sx={{ backgroundImage: `url(${ItemBox})`, backgroundSize: "cover", backgroundPosition: "center", border: isEquipped ? "3px solid gold" : "1px solid gray", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textTransform: "none", color: isEquipped ? "gold" : "white", width: 70, height: 75 }} >
                          {item ? (
                            <Box component="img" src={`data:image/png;base64,${item.cosmeticImage}`} alt={item?.name} sx={{ width: 60, height: 60, mb: 0.5 }} />
                          ) : null}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* --- Multiplayer Modal --- */}
      <Modal
        open={multiplayerOpen}
        onClose={() => { setMultiplayerOpen(false); }}
        closeAfterTransition
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={multiplayerOpen} >
          <Box
            sx={{ position: 'relative', top: 30, left: 240, width: '74%', height: '90%', backgroundImage: `url(${ScrollBig})`, backgroundRepeat: 'no-repeat', backgroundSize: "cover", backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', }}
          >
            <IconButton onClick={() => { playCancel(); setMultiplayerOpen(false); setSrc('BGM_MainMenu.mp3') }} sx={{ position: 'absolute', right: 140, top: 100 }}> <CloseIcon /> </IconButton>

            <Typography variant="h1" color="#5D4037" sx={{ textAlign: 'center', visibility: secVisibility ? 'visible' : 'hidden', mb: 3, fontWeight: 'bold' }} > King of the Hill! </Typography>

            <Box sx={{ flexGrow: 0, maxHeight: '80vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '25px' }, '&::-webkit-scrollbar-track': { background: '#FFF0F5', borderRadius: '8px', }, '&::-webkit-scrollbar-thumb': { background: '#F5C0E7', borderRadius: '8px', }, '&::-webkit-scrollbar-thumb:hover': { background: '#E79FD9' }, scrollbarColor: '#F5C0E7 #FFF0F5', scrollbarWidth: 'thick', }} >
              <LiveActivityGame
                ref={liveActivityRef}
                activityId={deployedActivityId}
                userId={user?.userId}
                onStarted={() => setMultiplayerOpen(false)}
                onReturn={() => setMultiplayerOpen(false)}
              />
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Grid>
  );
}