import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Grid, Stack, Box, Typography, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// --- API & Auth Imports ---
// ⚠️ ASSUMPTION: These utility functions/modules exist in your project structure.
// Replace with your actual imports (e.g., from AuthContext, API client).
import API from '../../api'; // Used in TutorialHomepage.jsx
import { getUserFromToken } from '../../utils/auth'; // Used in TutorialHomepage.jsx
// --- End API & Auth Imports ---

// --- Assets ---
import GameTextField from '../../assets/images/backgrounds/GameTextField.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png';
import GameShopField from '../../assets/images/backgrounds/GameShopField.png';
import GameShopBoxSmall from '../../assets/images/backgrounds/GameShopBoxSmall.png';
import GameShopBoxSmallRed from '../../assets/images/backgrounds/GameShopBoxSmallRed.png';
import ItemBox from '../../assets/images/backgrounds/Itembox.png';
import GameTextBox from '../../assets/images/backgrounds/GameTextBox.png';
import ShopUI_BG from '../../assets/images/backgrounds/ShopUIAnimated.gif';
import NameTab from "../../assets/images/backgrounds/NameTab.png"
import HealthPotion from '../../assets/images/objects/HealthPotion.png';
import ShieldPotion from '../../assets/images/objects/ShieldPotion.png';
import SkipPotion from '../../assets/images/objects/SkipPotion.png';
import GoldCoins from '../../assets/images/objects/GoldCoins.png';
import Gems from "../../assets/images/objects/Gems.png";
import PixieFly from '../../assets/images/characters/PixieFly.png';
// Add MCHeadshot (or similar) placeholder from TutorialHomepage for the name tab
import MCHeadshot from '../../assets/images/objects/MCHeadshot.png';

// --- Mock Context for Standalone Use ---
const MusicContext = React.createContext({
    playConfirm: () => console.log('SFX: Confirm'),
    playCancel: () => console.log('SFX: Cancel'),
    playBuySuccess: () => console.log('SFX: Buy Success'),
    playDenied: () => console.log('SFX: Denied'),
});

// --- Shop Item Costs ---
const HEALTH_POTION_COST = 100;
const SHIELD_POTION_COST = 200;
const SKIP_POTION_COST = 300;


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
        dialog: "Welcome to the Shop! This is where you buy useful Potions to help you in the Dungeon.",
        pointer: null,
        waitFor: 'CONTINUE',
        coins: 500
    },
    2: {
        dialog: "First, check your current **Gold** balance (Top Right). You start with 500 Gold.",
        pointer: 'GOLD_DISPLAY',
        waitFor: 'CONTINUE',
        coins: 500
    },
    3: {
        dialog: "Let's buy a **Health Potion** (100 Gold). Click the **'+'** button to add it to your cart.",
        pointer: 'HEALTH_ADD',
        waitFor: 'ADD_HEALTH',
        coins: 500
    },
    4: {
        dialog: "Success! The total is now 100 Gold. Click continue to add the next item.",
        pointer: null,
        waitFor: 'CONTINUE',
        coins: 500
    },
    5: {
        dialog: "Now, add one **Shield Potion** (200 Gold). Click the **'+'** button.",
        pointer: 'SHIELD_ADD',
        waitFor: 'ADD_SHIELD',
        coins: 500
    },
    6: {
        dialog: "Next, try adding the expensive **Skip Potion** (300 Gold). You should notice something...",
        pointer: 'SKIP_ADD',
        waitFor: 'ADD_SKIP_DENIED',
        coins: 500
    },
    7: {
        dialog: "DENIED! The total is 600 Gold, but you only have 500 Gold. We need to remove an item. Click continue.",
        pointer: null,
        waitFor: 'CONTINUE',
        coins: 500
    },
    8: {
        dialog: "Click the **'-'** button next to the **Shield Potion** to remove it.",
        pointer: 'SHIELD_SUB',
        waitFor: 'SUBTRACT_SHIELD',
        coins: 500
    },
    9: {
        dialog: "Great! The total is 400 Gold (Health Potion is 100). Let's add the **Skip Potion** now.",
        pointer: 'SKIP_ADD',
        waitFor: 'ADD_SKIP',
        coins: 500
    },
    10: {
        dialog: "The total is 400 Gold (Health + Skip). We have enough! Click **Buy** to confirm the purchase.",
        pointer: 'BUY_CLICK',
        waitFor: 'BUY_CLICK_ACTION',
        coins: 500
    },
    11: {
        dialog: "Purchase confirmed! You spent 400 Gold. The Shop Tutorial is complete!",
        pointer: null,
        waitFor: 'CONTINUE',
        coins: 100 // Final coin state after successful purchase
    },
    12: {
        dialog: "You are now ready to enter the Dungeon! Press 'Leave Shop' to continue the game.",
        pointer: 'LEAVE_SHOP',
        waitFor: null,
        coins: 100
    }
};

export default function TutorialShop() {
    // --- State for Shop and Tutorial ---
    const navigate = useNavigate();
    const [shopHealthPotion, setShopHealthPotion] = useState(0);
    const [shopShieldPotion, setShopShieldPotion] = useState(0);
    const [shopSkipPotion, setShopSkipPotion] = useState(0);
    const [shopTotal, setShopTotal] = useState(0);
    const [makeMessageAppear, setMakeMessageAppear] = useState(false);

    // Tutorial state
    const [tutorialStep, setTutorialStep] = useState(1);
    const [dialogText, setDialogText] = useState("");
    const totalSteps = Object.keys(TUTORIAL_STEPS).length;

    // User currency state (SCRIPTED for tutorial)
    const [coins, setCoins] = useState(TUTORIAL_STEPS[1].coins);
    const gems = 0; // Fixed for tutorial scope

    // --- NEW State for User Details ---
    const [userID, setUserID] = useState(null);
    const [firstName, setFirstName] = useState('Adventurer'); // Default fallback name
    // --- End NEW State ---


    const currentStepData = TUTORIAL_STEPS[tutorialStep];

    // Music Context
    const { playConfirm, playCancel, playBuySuccess, playDenied } = useContext(MusicContext);

    // --- NEW: User Data Fetching Logic (Mirrors TutorialHomepage.jsx) ---
    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem('token');
        let decodedUser = null;

        // 1. Get User ID from Token
        if (token) {
            // ⚠️ Assuming getUserFromToken utility is globally accessible or imported
            try {
                decodedUser = getUserFromToken(token);
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }

        if (decodedUser && decodedUser.userId) {
            setUserID(decodedUser.userId);
        } else {
            // Fallback for tutorial testing without a valid token
            setUserID('mock-guest-id');
            setFirstName('Tutorial Guest');
            return;
        }

        // 2. Fetch User Details (Name)
        const fetchUserDetails = async (id) => {
            try {
                // ⚠️ Assuming API.get utility is available and imports correctly
                const userResp = await API.get(`/users/${id}`);

                if (isMounted) {
                    // *** ONLY UPDATE FIRST NAME - KEEP COINS/GEMS SCRIPTED ***
                    setFirstName(userResp.data.firstName || 'Adventurer');
                    console.log('User name retrieved successfully:', userResp.data.firstName);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error retrieving user name:', err);
                }
            }
        };

        if (decodedUser?.userId) {
            fetchUserDetails(decodedUser.userId);
        }

        return () => {
            isMounted = false;
        };
    }, []);
    // --- END NEW Fetching Logic ---

    // --- NEW: API Function to Update Checkpoint ---
    const updateShopTutorialCheckpoint = useCallback(async (id) => {
        // Prevent API call if we don't have a valid ID (e.g., if using a mock guest ID)
        if (!id || id === 'mock-guest-id') {
            console.warn("User ID is missing or guest. Cannot update checkpoint in API.");
            return;
        }

        const payload = {
            shopTutorialCheckpoint: true, // Key from your API schema
        };

        try {
            // Using PUT as shown in your API image, but PATCH is generally better for partial updates.
            // If your API requires the full object for PUT, you must fetch the full profile first.
            await API.put(`/users/${id}`, payload);
            console.log('Shop tutorial checkpoint updated successfully.');

        } catch (err) {
            playDenied();
            console.error('Failed to update shop tutorial checkpoint:', err);
        }
    }, [playDenied]);
    // --- END NEW API Function ---


    // --- Tutorial Progression Logic ---

    // Handler to proceed the tutorial on 'Continue' button click
    const handleContinue = useCallback(() => {
        const nextStep = tutorialStep + 1;

        if (nextStep > totalSteps) {
            // Already at the end, just ensuring we exit or re-trigger checkpoint (optional)
            updateShopTutorialCheckpoint(userID);
            console.log("Tutorial finished.");
            // We wait for the 'Leave Shop' button at step 12
        } else {
            if (currentStepData.waitFor === 'CONTINUE' || currentStepData.waitFor === 'GOLD') {
                setTutorialStep(nextStep);
                // If it's the last step transition (11 to 12), call the API
                if (nextStep === totalSteps) {
                     updateShopTutorialCheckpoint(userID);
                }
            }
        }
    }, [currentStepData, tutorialStep, totalSteps, updateShopTutorialCheckpoint, userID]);


    // Handler to proceed the tutorial based on ShopUI actions (Add/Subtract/Denied)
    const tutorialCallback = useCallback((action, itemType) => {
        switch (action) {
            case 'ADD':
                if (itemType === 'HEALTH' && currentStepData.waitFor === 'ADD_HEALTH') setTutorialStep(4);
                if (itemType === 'SHIELD' && currentStepData.waitFor === 'ADD_SHIELD') setTutorialStep(6);
                if (itemType === 'SKIP' && currentStepData.waitFor === 'ADD_SKIP') setTutorialStep(10);
                break;
            case 'SUBTRACT':
                if (itemType === 'SHIELD' && currentStepData.waitFor === 'SUBTRACT_SHIELD' && shopShieldPotion === 1) setTutorialStep(9);
                break;
            case 'DENIED':
                if (itemType === 'SKIP' && currentStepData.waitFor === 'ADD_SKIP_DENIED') {
                    setTutorialStep(7);
                }
                break;
            case 'BUY_CLICK':
                // Pauses the tutorial for the modal
                break;
            case 'PURCHASE_CONFIRM': // Called after successful purchase is confirmed in the modal
                if (tutorialStep === 10) {
                    setTutorialStep(11);
                }
                break;
            default:
                break;
        }
    }, [tutorialStep, currentStepData, shopShieldPotion]);

    // Effect to update dialog text and coins for the current step
    useEffect(() => {
        const stepData = TUTORIAL_STEPS[tutorialStep];
        if (stepData) {
            setDialogText(stepData.dialog);
            // ⚠️ Keep coins updated from the script for each step ⚠️
            // This line ensures the coin value is always scripted for the current step
            setCoins(stepData.coins);

            // Auto-hide the confirmation message if we move past the purchase step
            if (tutorialStep !== 10) {
                setMakeMessageAppear(false);
            }
        }
    }, [tutorialStep]);

    // Helper: Determine button pointers/disables based on current step
    const tutorialOverride = currentStepData
        ? {
            pointer: currentStepData.pointer,
            disableAll: currentStepData.waitFor === 'CONTINUE' || currentStepData.waitFor === 'GOLD',
        }
        : null;

    // Helper to determine if a specific button is disabled by the tutorial
    const isButtonDisabled = (action, item) => {
        if (!tutorialOverride?.disableAll) {
            return false;
        }

        let key;
        if (action === 'LEAVE_SHOP') {
            key = 'LEAVE_SHOP';
        } else if (action === 'BUY') {
            key = 'BUY_CLICK';
        } else {
            key = `${item}_${action}`;
        }

        return tutorialOverride.pointer !== key;
    };


    // --- Core Shop Logic (Modified to include tutorial progression) ---

    // Handlers for adding/subtracting items (Logic remains the same)
    const handleAddPotion = useCallback((setPot, potCount, cost, itemType) => {
        if (isButtonDisabled('ADD', itemType) || (shopTotal + cost > coins && tutorialStep !== 6)) {
            playDenied();
            return;
        }
        if (shopTotal + cost > coins) {
            playDenied();
            if (tutorialStep === 6 && currentStepData.waitFor === 'ADD_SKIP_DENIED') {
                tutorialCallback('DENIED', itemType);
            }
            return;
        }

        const isTutorialTarget = tutorialOverride?.pointer === `${itemType}_ADD`;

        playCancel();
        setPot(potCount + 1);
        setShopTotal(prevTotal => prevTotal + cost);

        if (isTutorialTarget) tutorialCallback('ADD', itemType);

    }, [coins, shopTotal, playCancel, playDenied, tutorialOverride, tutorialCallback, tutorialStep, currentStepData, isButtonDisabled]);

    const handleSubtractPotion = useCallback((setPot, potCount, cost, itemType) => {
        if (potCount > 0) {
            if (isButtonDisabled('SUB', itemType)) {
                playDenied();
                return;
            }

            const isTutorialTarget = tutorialOverride?.pointer === `${itemType}_SUB`;

            playCancel();
            setPot(potCount - 1);
            setShopTotal(prevTotal => prevTotal - cost);

            if (isTutorialTarget) tutorialCallback('SUBTRACT', itemType);
        }
    }, [playCancel, tutorialOverride, tutorialCallback, isButtonDisabled]);

    // --- MODIFIED: buyPotion to force final coin count ---
    const buyPotion = () => {
        console.log(`Purchased: H:${shopHealthPotion} S:${shopShieldPotion} K:${shopSkipPotion} for ${shopTotal} gold.`);

        // ⚠️ Use scripted coin value for step 11
        if (tutorialStep === 10) {
            setCoins(TUTORIAL_STEPS[11].coins); // Sets coins to 100
        } else {
            // Fallback for non-tutorial use (or unexpected step)
            setCoins(prevCoins => prevCoins - shopTotal);
        }

        // This resets the cart state for the next step/end of the tutorial
        setShopTotal(0);
        setShopHealthPotion(0);
        setShopShieldPotion(0);
        setShopSkipPotion(0);
        setMakeMessageAppear(false);

        // Trigger tutorial progression after successful purchase
        tutorialCallback('PURCHASE_CONFIRM');
    };
    // --- END MODIFIED: buyPotion ---


    // --- MODIFIED: handleBackClick to call checkpoint ---
    const handleBackClick = () => {
        if (tutorialStep === 12) {
            updateShopTutorialCheckpoint(userID); // Ensure checkpoint is called on exit
            console.log("Navigating back from shop, tutorial complete.");
            navigate('/TutorialHomepage');
        } else {
            playDenied();
        }
    };
    // --- END MODIFIED: handleBackClick ---

    // Render function for the gems and coins tabs (Original)
    const renderGemAndCoinsTab = () => (
        <>
            {/* Gem Tab */}
            <Box
                sx={{ position: 'absolute', top: 16, right: 180, backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 2, paddingRight: 2, paddingTop: 1 }}
            >
                <Stack direction="column" sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <img src={Gems} alt="Gems" style={{ width: '17px', height: '42px' }} />
                    <Typography variant="h4" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>{gems || 0}</Typography>
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
                    {tutorialOverride?.pointer === 'GOLD_DISPLAY' && <Pointer style={{ top: '-10px' }} />}
                </Stack>
            </Box>
        </>
    );



    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            sx={{ position: 'relative', width: '100%', height: '100%' }}
        >
            <Box sx={{
                backgroundImage: `url(${ShopUI_BG})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100vw',
                height: '56.25vw',
                maxHeight: '100vh',
                maxWidth: '177.78vh',
                margin: 'auto',
                position: 'relative',
                overflow: 'auto'
            }}>


                {/* Leave Shop Button */}
                <Button
                    sx={{ position: 'absolute', bottom: 20, left: 20, height: 60, width: 300, backgroundImage: `url(${GameTextField})`, backgroundSize: 'cover', fontSize: 19, pr: 3 }}
                    onClick={() => {
                        // Use the modified handleBackClick
                        if (tutorialStep === 12) {
                            playConfirm();
                            handleBackClick();
                        } else {
                            playDenied();
                        }
                    }}
                    // Ensure the button is disabled unless it's the target in step 12
                    disabled={tutorialStep !== 12 && isButtonDisabled('LEAVE_SHOP')}
                >
                    ⮘ Leave Shop
                    {tutorialOverride?.pointer === 'LEAVE_SHOP' && <Pointer style={{ top: '-10px', left: '20%' }} />}
                </Button>

                {/* Confirm Purchase Modal (Original) */}
                <Box sx={{ position: 'absolute', backgroundImage: `url(${GameTextBoxMediumLong})`, backgroundSize: 'cover', width: '51%', height: '36%', top: '30%', left: '25%', display: 'flex', alignItems: 'center', justifyContent: 'center', visibility: makeMessageAppear ? 'visible' : 'hidden', zIndex: 1000 }}>
                    <Stack direction='column' sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 40 }}>
                            Confirm Purchase
                        </Typography>
                        <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20 }}>Health Potion {shopHealthPotion}x</Typography>
                        <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20 }}>Shield Potion {shopShieldPotion}x</Typography>
                        <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 20 }}>Skip Potion {shopSkipPotion}x</Typography>
                        <Stack direction='row' spacing={5}>
                            <Button
                                sx={{ position: 'relative', backgroundImage: `url(${GameShopBoxSmall})`, backgroundSize: 'cover', width: '210px', height: '60px', top: 20, color: '#5D4037' }}
                                onClick={() => {
                                    playBuySuccess();
                                    buyPotion(); // Calls the modified function
                                }}>
                                Confirm
                                {tutorialOverride?.pointer === 'BUY_CLICK' && <Pointer style={{ top: '-50px' }} />}
                            </Button>
                            <Button
                                sx={{ backgroundImage: `url(${GameShopBoxSmallRed})`, backgroundSize: 'cover', width: '210px', height: '60px', top: 20, color: '#5D4037' }}
                                onClick={() => {
                                    playCancel();
                                    setMakeMessageAppear(false);
                                }}>Cancel</Button>
                        </Stack>
                    </Stack>
                </Box>

                {/* Coins Tab (Original) */}
                {renderGemAndCoinsTab()}

                {/* Main Shop Panel (Original) */}
                <Box sx={{ position: 'absolute', top: 150, right: 150, backgroundImage: `url(${GameShopField})`, backgroundSize: 'cover', width: 538, height: 750, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stack direction={'column'} sx={{ alignItems: 'center', textAlign: 'center' }}>
                        <Typography color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', fontSize: 60 }}>
                            Potions For Sale
                        </Typography>
                        <Divider sx={{ borderBottomWidth: 5, borderColor: '#5D4037', my: 1, width: 400 }} />

                        {/* --- Potion Sections (Original) --- */}
                        {[
                            { name: 'HEALTH', cost: HEALTH_POTION_COST, img: HealthPotion, count: shopHealthPotion, setCount: setShopHealthPotion },
                            { name: 'SHIELD', cost: SHIELD_POTION_COST, img: ShieldPotion, count: shopShieldPotion, setCount: setShopShieldPotion },
                            { name: 'SKIP', cost: SKIP_POTION_COST, img: SkipPotion, count: shopSkipPotion, setCount: setShopSkipPotion },
                        ].map(({ name, cost, img, count, setCount }) => (
                            <Stack key={name} direction="row" spacing={.5} sx={{ alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                                {/* Item Info Box */}
                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundImage: `url(${GameShopBoxSmall})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', width: 290, height: 80, justifyContent: 'center' }}>
                                    <img src={img} alt={`${name} Potion`} style={{ width: '40px', height: '50px' }} />
                                    <Stack direction="column" spacing={0} sx={{ alignItems: 'center', justifyContent: 'center', marginLeft: 1 }}>
                                        <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>{name} Potion</Typography>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>{cost} Gold</Typography>
                                            <img src={GoldCoins} alt="Gold Coins" style={{ width: '20px', height: '20px', marginTop: 2 }} />
                                        </Stack>
                                    </Stack>
                                </Box>

                                {/* Subtract Button */}
                                <Button
                                    variant="contained"
                                    sx={{ backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 10, height: 60, color: '#5D4037' }}
                                    disabled={count <= 0 || isButtonDisabled('SUB', name)}
                                    onClick={() => { handleSubtractPotion(setCount, count, cost, name); }}>
                                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                        -
                                        {tutorialOverride?.pointer === `${name}_SUB` && <Pointer style={{ top: '-10px' }} />}
                                    </Typography>
                                </Button>

                                {/* Count Display */}
                                <Box variant="contained" sx={{ backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 60, height: 60, color: '#5D4037' }}>
                                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>{count}</Typography>
                                </Box>

                                {/* Add Button */}
                                <Button
                                    variant="contained"
                                    sx={{ backgroundImage: `url(${ItemBox})`, backgroundSize: 'cover', width: 10, height: 60, color: '#5D4037' }}
                                    disabled={isButtonDisabled('ADD', name)}
                                    onClick={() => { handleAddPotion(setCount, count, cost, name); }}>
                                    <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                        +
                                        {tutorialOverride?.pointer === `${name}_ADD` && <Pointer style={{ top: '-10px' }} />}
                                    </Typography>
                                </Button>
                            </Stack>
                        ))}

                        {/* Total & Buy Button */}
                        <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', marginTop: 2 }}>
                            Total: {shopTotal} Gold
                        </Typography>
                        <Box width={400} height={10}>
                            {(shopTotal > coins) && <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                You don't have enough coins</Typography>}
                        </Box>

                        <Button
                            sx={{ width: 400, height: 80, marginTop: 3, backgroundImage: `url(${shopTotal === 0 || shopTotal > coins ? GameTextBox : GameTextField})`, backgroundSize: 'cover' }}
                            disabled={shopTotal === 0 || shopTotal > coins || isButtonDisabled('BUY')}
                            onClick={() => {
                                if (!isButtonDisabled('BUY') && shopTotal !== 0 && shopTotal <= coins) {
                                    playConfirm();
                                    setMakeMessageAppear(true);
                                    tutorialCallback('BUY_CLICK');
                                } else {
                                    playDenied();
                                }
                            }}
                        >
                            <Typography variant="h1" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                Buy
                                {tutorialOverride?.pointer === 'BUY_CLICK' && <Pointer style={{ top: '10%' }} />}
                            </Typography>
                        </Button>
                    </Stack>
                </Box>

                {/* Pixie Dialogue Overlay (Original) */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '35%',
                        transform: 'translateX(-50%)',
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
                    {(currentStepData?.waitFor === 'CONTINUE' || currentStepData?.waitFor === 'GOLD') && (
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
            </Box>
        </Grid>
    );
}