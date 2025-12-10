// src/components/Pages/sections/TutorialSummon.jsx

import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Grid, Typography, Button, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// --- API & Auth Imports (Required for Checkpoint Update) ---
// ⚠️ ASSUMPTION: These utility functions/modules exist in your project structure.
import API from '../../api';
import { getUserFromToken } from '../../utils/auth'; 
// --- End API & Auth Imports ---

// Image Imports (Assets from original files)
import SummonUIAnimated from "../../assets/images/backgrounds/SummonUIAnimated.gif";
import CommonItem from '../../assets/images/ui-assets/CommonItem.png';
import RareItem from '../../assets/images/ui-assets/RareItem.png';
import MythicalItem from '../../assets/images/ui-assets/MythicalItem.png';
import LegendaryItem from '../../assets/images/ui-assets/LegendaryItem.png';
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png';
import GameShopBoxSmall from '../../assets/images/backgrounds/GameShopBoxSmall.png';
import GameShopBoxSmallRed from '../../assets/images/backgrounds/GameShopBoxSmallRed.png';
import SummonAnimationGIF from '../../assets/images/effects/SummonAnimationv2.gif';
import GameTextBox from '../../assets/images/backgrounds/GameTextBox.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';
import PixieFly from '../../assets/images/characters/PixieFly.png';
import ItemBox from '../../assets/images/backgrounds/Itembox.png'; 
import GoldCoins from '../../assets/images/objects/GoldCoins.png'; 
import Gems from "../../assets/images/objects/Gems.png"; 

// Mock Constants
const BGM_MainMenu = "mock/path/BGM_MainMenu.mp3";
const SUMMON_COST = 100;
const TUTORIAL_START_GEMS = 300;

// Placeholder for the Pointer component
const Pointer = ({ style }) => (
    <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%) translateY(-100%)',
        fontSize: '40px',
        color: 'yellow',
        animation: 'bounce 1s infinite',
        textShadow: '0 0 5px black',
        ...style
    }}>
        👇
    </div>
);

// --- Tutorial Script Data ---
const TUTORIAL_STEPS = {
    1: {
        dialog: "Welcome to the **Summoning Altar**! This is where you spend **Gems** to acquire new items.",
        pointer: null,
        waitFor: 'CONTINUE',
        gems: TUTORIAL_START_GEMS
    },
    2: {
        dialog: "First, look at your current **Gem** balance (Top Right). You start with 300 Gems.",
        pointer: 'GEM_DISPLAY',
        waitFor: 'CONTINUE',
        gems: TUTORIAL_START_GEMS
    },
    3: {
        dialog: "A single summon costs 100 Gems. Click the **'Summon'** button to begin!",
        pointer: 'SUMMON_BUTTON',
        waitFor: 'SUMMON_MODAL_OPEN', // User clicked summon button, now modal is open
        gems: TUTORIAL_START_GEMS
    },
    4: {
        dialog: "This is the confirmation screen. Click **'Confirm'** to proceed with the Summon and start the animation.",
        pointer: 'CONFIRM_BUTTON',
        waitFor: 'SUMMON_CONFIRMED', // User clicked confirm button, animation starts
        gems: TUTORIAL_START_GEMS
    },
    5: {
        dialog: "Wow! You acquired a new item! Click **'Confirm'** to dismiss the result and finish the tutorial.",
        pointer: 'RESULT_CONFIRM_BUTTON',
        waitFor: 'RESULT_CONFIRMED', // User clicked the final confirm button
        gems: TUTORIAL_START_GEMS - SUMMON_COST // 300 - 100 = 200
    },
    6: {
        dialog: "Summon Complete! You now have 200 Gems remaining. You are ready to leave the Altar.",
        pointer: 'LEAVE_ALTAR',
        waitFor: null,
        gems: TUTORIAL_START_GEMS - SUMMON_COST // 200
    }
};

// --- Mock Context for Standalone Use ---
const MusicContext = React.createContext({
    setSrc: () => console.log('BGM Source set'),
    playConfirm: () => console.log('SFX: Confirm'),
    playCancel: () => console.log('SFX: Cancel'),
    playDenied: () => console.log('SFX: Denied'),
    playSummon: () => console.log('SFX: Summon'),
});

// --- Mock API Functions (Modified to force result for tutorial) ---
const MOCK_API = {
    post: async (url, data, tutorialStep) => {
        if (url.includes('gacha/pull')) {
            // For tutorial, force a specific common item
            const pulledItem = { name: "Basic Staff", rarity: "COMMON", image: "WeaponBasicStaff" };
            return { data: { cosmetic: pulledItem } };
        }
        return { data: {} };
    },
};

export default function TutorialSummon() {
    // Component State
    const navigate = useNavigate(); 
    const [visibilityGacha, setVisibilityGacha] = useState('hidden'); // Controls result screen visibility
    const [makeMessageAppear, setMakeMessageAppear] = useState(false); // Controls modal visibility
    const [pulledItem, setPulledItem] = useState({});
    const [showItem, setShowItem] = useState(false); // Controls showing the result item after animation
    const [animationKey, setAnimationKey] = useState(Date.now()); // Forces GIF restart

    // Tutorial state
    const [tutorialStep, setTutorialStep] = useState(1);
    const [dialogText, setDialogText] = useState("");

    // User currency state
    const [coins, setCoins] = useState(0); // Gold is not used but kept for consistency with the display
    const [gems, setGems] = useState(TUTORIAL_STEPS[1].gems);
    // ⚠️ Updated user state to correctly handle the API call
    const [userID, setUserID] = useState(null); 
    const [inventory, SetInventory] = useState([]); // Mock Inventory

    const currentStepData = TUTORIAL_STEPS[tutorialStep];

    const { setSrc, playConfirm, playCancel, playDenied, playSummon } = useContext(MusicContext);


    // --- NEW: User ID Fetching Logic (Required for Checkpoint Update) ---
    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('token');
        let decodedUser = null;

        if (token) {
            try {
                decodedUser = getUserFromToken(token);
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }

        if (decodedUser && decodedUser.userId) {
            if (isMounted) {
                setUserID(decodedUser.userId);
            }
        } else {
            // Fallback for tutorial testing without a valid token
            if (isMounted) {
                setUserID('mock-guest-id');
            }
        }

        return () => {
            isMounted = false;
        };
    }, []);
    // --- END NEW Fetching Logic ---
    
    // --- NEW: API Function to Update Checkpoint ---
    const updateSummonTutorialCheckpoint = useCallback(async (id) => {
        // Prevent API call if we don't have a valid ID (e.g., if using a mock guest ID)
        if (!id || id === 'mock-guest-id') {
            console.warn("User ID is missing or guest. Cannot update checkpoint in API.");
            return;
        }

        const payload = {
            summonTutorialCheckpoint: true, // Key based on user request (summon_tutorial_checkpoint)
            shopTutorialCheckpoint: true,
        };

        try {
            // Assuming the same API structure (PUT for updates)
            await API.put(`/users/${id}`, payload);
            console.log('Summon tutorial checkpoint updated successfully.');
        } catch (err) {
            playDenied();
            console.error('Failed to update summon tutorial checkpoint:', err);
        }
    }, [playDenied]);
    // --- END NEW API Function ---


    // --- Tutorial Progression Logic ---

    // Handler to proceed the tutorial on 'Continue' button click
    const handleContinue = useCallback(() => {
        if (currentStepData.waitFor === 'CONTINUE' || currentStepData.waitFor === 'GEM_DISPLAY') {
            setTutorialStep(prev => prev + 1);
        }
    }, [currentStepData]);

    // Handler to proceed the tutorial based on SummonUI actions (Modal Open, Animation Start, Result Confirm)
    const tutorialCallback = useCallback((action) => {
        switch (action) {
            case 'SUMMON_MODAL_OPEN':
                if (currentStepData.waitFor === 'SUMMON_MODAL_OPEN') setTutorialStep(4);
                break;
            case 'SUMMON_CONFIRMED':
                if (currentStepData.waitFor === 'SUMMON_CONFIRMED') {
                    // This pauses the tutorial while the animation plays
                }
                break;
            case 'RESULT_CONFIRMED':
                if (currentStepData.waitFor === 'RESULT_CONFIRMED') setTutorialStep(6);
                break;
            default:
                break;
        }
    }, [currentStepData]);

    // Effect to update dialog text and gems for the current step
    useEffect(() => {
        const stepData = TUTORIAL_STEPS[tutorialStep];
        if (stepData) {
            // Update dialog and gems for the current step
            setDialogText(stepData.dialog);
            setGems(stepData.gems);

            // Hide the modal/result screen when moving to a new introductory step
            if (tutorialStep < 4 || tutorialStep >= 6) {
                setMakeMessageAppear(false);
                setVisibilityGacha('hidden');
                setShowItem(false);
            }

            // Restore BGM if we've left the animation/result screen
            if (tutorialStep < 4 || tutorialStep >= 6) {
                setSrc(BGM_MainMenu);
            }
        }
    }, [tutorialStep, setSrc]);

    // Helper: Determine button pointers/disables based on current step
    const tutorialOverride = currentStepData
        ? {
            pointer: currentStepData.pointer,
            // Disable all buttons when waiting for Continue
            disableAll: currentStepData.waitFor === 'CONTINUE' || currentStepData.waitFor === 'GEM_DISPLAY',
        }
        : null;

    // Helper to determine if a specific button is disabled by the tutorial
    const isButtonDisabled = (key) => {
        if (!tutorialOverride?.disableAll) {
            // If not in a 'disable all' state, check if the key is the targeted pointer
            return tutorialOverride?.pointer !== key;
        }

        // If in a 'disable all' state, only enable the button if its key matches the pointer
        return tutorialOverride.pointer !== key;
    };


    // --- Core Summon Logic (Modified to include tutorial progression) ---

    // 1. Summon Button Click (Opens Modal)
    function handleMakeMessageAppear() {
        if (gems < SUMMON_COST) {
            playDenied();
            return;
        }

        if (isButtonDisabled('SUMMON_BUTTON')) {
            playDenied();
            return;
        }

        playCancel(); // SFX for clicking button to open modal
        setMakeMessageAppear(true);
        tutorialCallback('SUMMON_MODAL_OPEN'); // Advance tutorial to Step 4
    }

    // 2. Modal Confirmation Click (Starts Animation)
    async function handleSummonClick() {
        if (gems < SUMMON_COST) {
            playDenied();
            setMakeMessageAppear(false);
            return;
        }

        // This check is for the modal's confirm button
        if (tutorialStep === 4 && currentStepData.waitFor === 'SUMMON_CONFIRMED') {
            tutorialCallback('SUMMON_CONFIRMED'); // Advance tutorial (logic handles the pause during animation)
        }

        try {
            playSummon();
            setSrc(); // Stop/pause BGM
            setMakeMessageAppear(false);
            setVisibilityGacha('visible');
            setShowItem(false);
            setAnimationKey(Date.now()); // refresh animation

            // 1. Simulate API Gacha Pull (Uses tutorial-specific mock API)
            // Use mock userDetails for the POST data
            const response = await MOCK_API.post(`/gacha/pull`, { userId: userID || 'tutorialUser' }, tutorialStep);
            const pulledItemData = response.data.cosmetic;
            setPulledItem(pulledItemData);

            // 2. Deduct Gems (Only if successful in tutorial sequence)
            setGems(prevGems => prevGems - SUMMON_COST);

            // 3. Update Inventory (Simulated)
            SetInventory(prevInv => [...prevInv, pulledItemData.name]);
            console.log(`Inventory Updated. New item: ${pulledItemData.name}`);


            // Delay showing the item for 2.5 seconds (as per original logic)
            setTimeout(() => {
                setShowItem(true);
                // When the item is revealed, advance the tutorial to Step 5 (Result Confirm)
                setTutorialStep(5);
            }, 2500);

        } catch (err) {
            console.error('Error during mock gacha pull:', err);
            // Re-enable BGM and hide screen if error occurs
            setSrc(BGM_MainMenu);
            setVisibilityGacha('hidden');
        }
    }

    // 3. Result Screen Confirmation Click (Finishes Sequence)
    function handleConfirmClick() {
        if (tutorialStep === 5 && currentStepData.waitFor === 'RESULT_CONFIRMED') {
            playConfirm();
            setVisibilityGacha('hidden');
            setShowItem(false);
            setSrc(BGM_MainMenu); // Re-enable main menu BGM
            tutorialCallback('RESULT_CONFIRMED'); // Advance tutorial to Step 6
        } else {
            playDenied();
        }
    }

    // 4. Leave Altar Click (MODIFIED to include checkpoint update)
    const handleBackClick = () => {
        if (tutorialStep === 6) {
            playConfirm();
            // 🚨 Update the checkpoint when leaving the altar
            updateSummonTutorialCheckpoint(userID); 
            console.log("Navigating back from Summon Altar, tutorial complete.");
            navigate('/TutorialHomepage');
        } else {
            playDenied();
        }
    };


    // --- UI Constants ---
    const rarityBackgrounds = {
        COMMON: CommonItem,
        RARE: RareItem,
        MYTHIC: MythicalItem,
        LEGENDARY: LegendaryItem
    };
    const rarityText = {
        COMMON: "#5D4037",
        RARE: "#a1ccce",
        MYTHIC: "#cb7275",
        LEGENDARY: "#fbf236"
    };

    // Render function for the gems and coins tabs (Copied from TutorialShop.jsx)
    const renderGemAndCoinsTab = () => (
        <>
            {/* Gem Tab */}
            <Box
                sx={{ position: 'absolute', top: 16, right: 180, backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 2, paddingRight: 2, paddingTop: 1 }}
            >
                <Stack direction="column" sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <img src={Gems} alt="Gems" style={{ width: '17px', height: '42px' }} />
                    <Typography variant="h4" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                        {gems || 0}
                    </Typography>
                    {/* Pointer is only on the Gem tab when tutorial step 2 points to GEM_DISPLAY */}
                    {tutorialOverride?.pointer === 'GEM_DISPLAY' && <Pointer style={{ top: '-10px' }} />}
                </Stack>
            </Box>

            {/* Gold Tab */}
            <Box
                sx={{ position: 'absolute', top: 16, right: 16, backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 2, paddingRight: 2, paddingTop: 1 }}
            >
                <Stack direction="column" sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <img src={GoldCoins} alt="Gold Coins" style={{ width: '42px', height: '42px' }} />
                    <Typography variant="h4" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                        {coins || 0}
                    </Typography>
                    {/* The Shop tutorial would use this pointer, but it's kept here for component re-use */}
                    {tutorialOverride?.pointer === 'GOLD_DISPLAY' && <Pointer style={{ top: '-10px' }} />}
                </Stack>
            </Box>
        </>
    );

    // --- Render Logic ---
    return (
        <Grid 
            container 
            direction="column" 
            alignItems="center" 
            sx={{ 
                // Apply max-width/height ratio for aspect preservation (like TutorialShop)
                width: '100vw',
                height: '56.25vw',
                maxHeight: '100vh',
                maxWidth: '177.78vh',
                margin: 'auto',
                position: 'relative',
                overflow: 'auto',
                backgroundImage: `url(${SummonUIAnimated})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Result Screen (Covers everything during animation/result) */}
            <Box
                sx={{
                    visibility: visibilityGacha,
                    width: '100%',
                    height: '100%',
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundImage: `url(${SummonAnimationGIF}?t=${animationKey})`,
                    backgroundSize: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 100
                }}
            >
                {/* Summon Display - Only shows after animation delay (showItem is true) */}
                {showItem && (
                    <>
                        {/* Item Box */}
                        <Box
                            sx={{
                                height: 500,
                                width: 500,
                                backgroundImage: `url(${rarityBackgrounds[pulledItem.rarity] || CommonItem})`,
                                backgroundSize: 'cover',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box
                                sx={{
                                    height: 250,
                                    width: 250,
                                    // Use imported asset for the mock result
                                    backgroundImage: `url(${WeaponBasicStaff})`, 
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    mb: 2
                                }}
                            />
                        </Box>
                        {/* Item Name/Rarity */}
                        <Box sx={{ mb: 2, mt: 2 }}>
                            <Typography
                                sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 40, color: '#5D4037' }}
                            >
                                You got a new weapon!
                            </Typography>
                            <Typography
                                variant={'h5'} color={rarityText[pulledItem.rarity]} sx={{ WebkitTextStroke: '.4px #180f0c', textAlign: 'center', fontFamily: 'RetroGaming' }}
                            >
                                {pulledItem.name}
                            </Typography>
                        </Box>
                        {/* Confirm Button for Result Screen */}
                        <Button
                            sx={{
                                backgroundImage: `url(${GameShopBoxSmall})`,
                                backgroundSize: 'cover',
                                width: '210px',
                                height: '60px',
                                color: '#5D4037'
                            }}
                            onClick={handleConfirmClick}
                        >
                            <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
                                Confirm
                            </Typography>
                            {tutorialOverride?.pointer === 'RESULT_CONFIRM_BUTTON' && <Pointer style={{ top: '-10px' }} />}
                        </Button>
                    </>
                )}
            </Box>

            {/* Confirm Summon Modal (Z-index 1000 to appear over static BG) */}
            <Box
                sx={{
                    position: 'absolute',
                    backgroundImage: `url(${GameTextBoxMediumLong})`,
                    backgroundSize: 'cover',
                    width: '51%',
                    height: '36%',
                    top: '30%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    visibility: makeMessageAppear ? 'visible' : 'hidden',
                    zIndex: 1000
                }}
            >
                <Stack direction="column" sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Typography
                        sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 40, color: '#5D4037' }}
                    >
                        Confirm Summon
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                            sx={{
                                backgroundImage: `url(${GameShopBoxSmall})`,
                                backgroundSize: 'cover',
                                width: '210px',
                                height: '60px',
                                color: '#5D4037'
                            }}
                            onClick={handleSummonClick}
                            // Disabled if this step isn't the target
                            disabled={tutorialOverride?.pointer !== 'CONFIRM_BUTTON'}
                        >
                            <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
                                Confirm
                            </Typography>
                            {tutorialOverride?.pointer === 'CONFIRM_BUTTON' && <Pointer style={{ top: '-10px' }} />}
                        </Button>
                        <Button
                            sx={{
                                backgroundImage: `url(${GameShopBoxSmallRed})`,
                                backgroundSize: 'cover',
                                width: '210px',
                                height: '60px',
                                color: '#5D4037'
                            }}
                            onClick={() => {playCancel();setMakeMessageAppear(false)}}
                            // Always disabled in tutorial to force confirmation path
                            disabled={true} 
                        >
                            <Typography sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}>
                                Cancel
                            </Typography>
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Gems and Coins Tabs */}
            {renderGemAndCoinsTab()}

            {/* Leave Button */}
            <Button
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    height: 60,
                    width: 300,
                    backgroundImage: `url(${GameTextField})`,
                    backgroundSize: 'cover',
                    fontSize: 19,
                    pl: 3
                }}
                onClick={handleBackClick}
                disabled={tutorialOverride?.pointer !== 'LEAVE_ALTAR'}
            >
                Leave Altar ➣
                {tutorialOverride?.pointer === 'LEAVE_ALTAR' && <Pointer style={{ top: '-10px', left: '80%' }} />}
            </Button>

            {/* Summon Button */}
            <Button
                sx={{
                    mt: 2,
                    position: 'absolute',
                    top: '65%',
                    left: '39%',
                    backgroundImage: `url(${gems < SUMMON_COST ? GameTextBox : GameTextField})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: 400,
                    height: 80
                }}
                disabled={gems < SUMMON_COST || isButtonDisabled('SUMMON_BUTTON')}
                onClick={handleMakeMessageAppear}
                variant="contained"
            >
                {(gems < SUMMON_COST) && <Stack direction="column" alignItems="center">
                    <Typography
                        sx={{
                            fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037',
                        }}
                    >
                        Summon for {SUMMON_COST} Gems
                    </Typography>
                    <Typography
                        sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}
                    >
                        (You only have {gems} gems)
                    </Typography>
                </Stack>}
                {(gems >= SUMMON_COST) && <Stack direction="column" alignItems="center">
                    <Typography
                        sx={{
                            fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037',
                        }}
                    >
                        Summon for
                    </Typography>
                    <Typography
                        sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20, color: '#5D4037' }}
                    >
                        {SUMMON_COST} Gems
                    </Typography>
                    {tutorialOverride?.pointer === 'SUMMON_BUTTON' && <Pointer style={{ top: '10%' }} />}
                </Stack>}
            </Button>

            {/* Pixie Dialogue Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: tutorialStep === 5 ? '22%' : '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: 700,
                    minHeight: 120,
                    // Use imported asset for background
                    backgroundImage: `url(${GameTextField})`, 
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
                {(currentStepData?.waitFor === 'CONTINUE' || currentStepData?.waitFor === 'GEM_DISPLAY') && (
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
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width:300,
                        alignItems: 'center'
                    }}>
                    <Typography
                        variant="caption"
                        color="#5D4037"
                        sx={{
                            fontFamily: 'RetroGaming',
                            fontSize: 16,
                            fontWeight: 'bold',
                            pb:3
                        }}
                    >
                        Pixie: Step {tutorialStep} of {Object.keys(TUTORIAL_STEPS).length}
                    </Typography>
                    <img
                        src={PixieFly}
                        alt="Pixie"
                        style={{
                            width: '70px',
                            height: '70px',
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                        }}
                    />
                </Stack>

            </Box>
        </Grid>
    );
}