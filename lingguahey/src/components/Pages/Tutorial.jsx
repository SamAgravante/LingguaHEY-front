import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { motion } from "framer-motion";
import {
    Box,
    Typography,
    Button,
    Grid,
    Stack
} from '@mui/material';
import { MusicContext } from '../../contexts/MusicContext';
import { useLocation, useNavigate } from 'react-router-dom';

// --- ASSETS ---
import DungeonRoom from '../../assets/images/backgrounds/DungeonRoom.png';
import DungeonRoomAnimation from '../../assets/images/backgrounds/DungeonRoomAnimation.gif';
import DungeonBar from '../../assets/images/backgrounds/DungeonBar.png';
import DungeonHint from '../../assets/images/backgrounds/DungeonHint.png';
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'
import DungeonBarv2 from '../../assets/images/backgrounds/DungeonBarv2.png';
import NameTabvar2 from "../../assets/images/backgrounds/NameTabvar2.png";

import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import GameShopBoxSmallRed from "../../assets/images/backgrounds/GameShopBoxSmallRed.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/Itembox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import HeartFilled from "../../assets/images/objects/HeartFilled.png";
import HeartNotFilled from "../../assets/images/objects/HeartNotFilled.png";
import HeartShield from "../../assets/images/objects/HeartShield.png";
import CastButton from '../../assets/images/ui-assets/CastButton.png';
import LeftClick from '../../assets/images/ui-assets/mouseLeft.png';
import MCNoWeaponArm from '../../assets/images/characters/MCNoWeaponArm.png';
import MCNoWeaponAnimated from '../../assets/images/characters/MCNoWeaponAnimated.png';
import Laser from '../../assets/images/effects/Laser.png';
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Gems from "../../assets/images/objects/Gems.png";
import PixieFly from '../../assets/images/characters/PixieFly.png';
import BGM_DungeonBattle from "../../assets/music/BGM_DungeonBattle.wav";
import TutorialHowToSelect from '../../assets/images/ui-assets/TutorialHowToSelect.gif';
import API from '../../api';
import { getUserFromToken } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import BossAura from "../../assets/images/effects/BossAura.gif";
import LaserFail from "../../assets/images/effects/LaserFail.gif";
import LaserSuccess from "../../assets/images/effects/LaserSuccess.gif";
import Shield from "../../assets/images/effects/Shield.png";
import ShieldEnemy from "../../assets/images/effects/ShieldEnemy.png";
import MCNoWeaponHit from '../../assets/images/characters/MCNoWeaponHit.png';

// Placeholder for Monster Images to keep code clean
const PLACEHOLDER_IMG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// ---------------------------------------------------------------------
// 1. POINTER COMPONENT
// ---------------------------------------------------------------------
const Pointer = ({ style }) => (
    <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
            position: 'absolute',
            top: 0,
            left: '50%', // REVERTED: Changed back to '50%' for true centering by default
            transform: 'translateX(-50%) translateY(-100%)',
            fontSize: '40px',
            color: 'yellow',
            textShadow: '0 0 5px black',
            zIndex: 9999,
            pointerEvents: 'none', // Pass clicks through
            ...style
        }}
    >
        👇
    </motion.div>
);

// ---------------------------------------------------------------------
// 2. TUTORIAL POINTERS MAP
// ---------------------------------------------------------------------
const TUTORIAL_POINTERS = {
    0: 'CONTINUE_BUTTON',
    1: 'CONTINUE_BUTTON',
    2: 'CONTINUE_BUTTON',
    3: null, // Logic for step 3 is handled in getTutorialOverride/isButtonDisabled/Tile rendering
    4: 'CAST_BUTTON',
    5: 'USE_HEALTH_POTION',
    6: 'CAST_BUTTON',
    7: 'CONTINUE_BUTTON',
    8: 'CONTINUE_BUTTON',
    9: 'TILE_RUNE_0', // Point to last letter of 'Ahas' (S) - Note: this is actually index 0 based on AHAS_INDICES
    10: 'CAST_BUTTON',
    11: 'CONTINUE_BUTTON',
    12: 'USE_SHIELD_POTION',
    13: 'CAST_BUTTON', // Cast random
    14: 'CONTINUE_BUTTON',
    15: 'USE_SKIP_POTION',
    16: 'CONTINUE_BUTTON',
    17: null,
};

// Indices required for step 9 (A-H-A-S) based on the jumbled array provided
const AHAS_INDICES = [2, 1, 12, 0]; 

export default function TutorialDungeonGame() {
    const location = useLocation();
    const navigate = useNavigate();

    // Monsters Data
    const [tutorialMonsters] = useState([
        {
            description: "a creature that slides and crawls",
            englishName: "Snake",
            imageData: "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", // Use actual base64 here in prod
            jumbledLetters: ['S', 'H', 'A', 'K', 'L', 'B', 'R', 'H', 'Z', 'S', 'M', 'N', 'A', 'E'],
            monsterId: 1,
            tagalogName: "Ahas"
        },
        {
            description: "a creature that oinks",
            englishName: "Pig",
            imageData: "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", // Use actual base64 here in prod
            jumbledLetters: ['O', 'Y', 'Z', 'B', 'P', 'B', 'G', 'J', 'A', 'H', 'X', 'A', 'L', 'W'],
            monsterId: 2,
            tagalogName: "Baboy"
        },
        {
            description: "a furry animal that meows",
            englishName: "Cat",
            imageData: "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", // Use actual base64 here in prod
            jumbledLetters: ['P', 'X', 'S', 'A', 'Z', 'R', 'L', 'I', 'U', 'Q', 'Y', 'T', 'P', 'C'],
            monsterId: 3,
            tagalogName: "Pusa"
        }
    ]);

    const [levelData, setLevelData] = useState({});
    const [selectedTiles, setSelectedTiles] = useState([]);

    // Track which monster index we are currently on
    const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
    
    // Derived current monster
    const currentMonster = tutorialMonsters[currentMonsterIndex] || tutorialMonsters[0];
    const uppercaseLetters = useMemo(() => {
        const letters = currentMonster?.jumbledLetters ?? [];
        return letters.map((l) => String(l).toUpperCase());
    }, [currentMonster]);

    const [hp, setHp] = useState(3);
    const [userDetails, setUserDetails] = useState({});
    const [roundCounter, setRoundCounter] = useState(1);
    const [makeMessageAppear, setMakeMessageAppear] = useState(false);
    const [messageDetails, setMessageDetails] = useState({});
    const [itemEquipped, setItemEquipped] = useState({});
    const [enemyAttacking, setEnemyAttacking] = useState(false);
    const [impactVisible, setImpactVisible] = useState(false);
    const [potions, setPotions] = useState({ HEALTH: 1, SHIELD: 1, SKIP: 1 });
    const [mistakeCounter, setMistakeCounter] = useState(0);
    const [displayedMistakeCounter, setDisplayedMistakeCounter] = useState(0);

    // helper: reveal tagalog name progressively based on mistakes
    function getPartialTagalogName() {
        const name = currentMonster?.tagalogName || '';
        if (!name || displayedMistakeCounter <= 0) return { revealed: null, fully: false };

        const parts = 3; // divide the string into 3 reveal segments
        const progress = Math.min(displayedMistakeCounter, 4); // cap at 4 mistakes
        const revealSegments = Math.min(progress, parts);
        const revealLen = Math.ceil((name.length / parts) * revealSegments);

        const revealed = name.slice(0, revealLen);
        const fully = revealLen >= name.length;
        return { revealed, fully, fullName: name };
    }

    // When the displayed mistake counter changes, reveal hint letters by preselecting matching tiles
    useEffect(() => {
        const { revealed } = getPartialTagalogName();
        if (!revealed || !currentMonster.jumbledLetters) return;

        const availableLetters = currentMonster.jumbledLetters.map(l => String(l).toUpperCase());
        const newSelectedTiles = []; // Correctly initialized here
        const usedIndices = new Set();

        for (const rawChar of revealed) {
            const char = String(rawChar).toUpperCase();
            if (!char || char.trim() === '') continue;

            const foundIndex = availableLetters.findIndex((l, idx) => l === char && !usedIndices.has(idx));
            if (foundIndex !== -1) {
                usedIndices.add(foundIndex);
                newSelectedTiles.push({ label: char, index: foundIndex, preselected: true });
            }
        }

        // FIX: Replaced 'newTiles' with the correctly initialized 'newSelectedTiles'
        setSelectedTiles(newSelectedTiles); 
    }, [displayedMistakeCounter, currentMonster]);

    // --- Potion State ---
    const [potionUsedThisRound, setPotionUsedThisRound] = useState(false);
    const [skipPotionUsed, setSkipPotionUsed] = useState(false);

    // --- Animation State ---
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentPotion, setCurrentPotion] = useState();
    const [shieldActive, setShieldActive] = useState(false);
    const [laserEffect, setLaserEffect] = useState(null);
    const [enemyDefeated, setEnemyDefeated] = useState(false);
    const [isBoss, setIsBoss] = useState(false);
    const [bossCounter, setBossCounter] = useState(0);
    const { token } = useAuth();

    //COUNTER FOR RESETTING LASER
    const [laserKey, setLaserKey] = useState(0);
    const [canCastAgain, setCanCastAgain] = useState(true);

    //Tutorial Related States
    const [tutorialProgressCounter, setTutorialProgressCounter] = useState(0);
    const [continueVisible, isContinueVisible] = useState(false);
    const [dialogText, setDialogText] = useState("");
    const [dialogTextOverride, setDialogTextOverride] = useState(false);
    const [upperRowVisible, setUpperRowVisible] = useState(false);
    const [lowerRowVisible, setLowerRowVisible] = useState(false);
    const [makeTutorialBoxAppear, setMakeTutorialBoxAppear] = useState(false);
    const [damageCounter, setDamageCounter] = useState(1);

    const [healthPotionVisible, setHealthPotionVisible] = useState(false);
    const [shieldPotionVisible, setShieldPotionVisible] = useState(false);
    const [skipPotionVisible, setSkipPotionVisible] = useState(false);
    const [user, setUser] = useState(null); // State for the decoded user object

    // State for pointer cycling removed as requested.
    useEffect(() => {
        if (!token) return;
        const decoded = getUserFromToken(token);
        // Only set user if decoding was successful and a userId exists
        if (decoded?.userId) setUser(decoded);
      }, [token]);

    const {
        setSrc,
        playLaserSuccess,
        playLaserFail,
        playHeal,
        playShield,
        playSkip,
        playHit,
        playEnemyAttack,
        playEnemyDead,
        playConfirm,
        playDenied,
        playCancel,
        playPotionClick,
        playDungeonClick,
        playLevelClear,
        playDungeonFailed,
    } = useContext(MusicContext);

    useEffect(() => {
        if (laserEffect) setLaserKey(prev => prev + 1);
    }, [laserEffect]);
    
    // Logic for pointer animation in step 2 removed as requested.


    // --- Tutorial Override Logic ---
    const getTutorialOverride = useMemo(() => {
        let pointerKey = TUTORIAL_POINTERS[tutorialProgressCounter] || null;
        
        // At step 3, dynamically point to letter tiles until 3 are selected, then Cast button
        if (tutorialProgressCounter === 3) {
            if (selectedTiles.length < 3) {
                // Set to null. Pointers are now managed directly in the tile render loop 
                // using the tutorialProgressCounter value itself.
                pointerKey = null; 
            } else {
                // All 3 tiles selected, point to Cast button
                pointerKey = 'CAST_BUTTON';
            }
        }
        
        return {
            pointer: pointerKey,
            // Keep disableAllExceptTarget true for most steps, but we'll override for step 3 in isButtonDisabled
            disableAllExceptTarget: !!pointerKey && tutorialProgressCounter < 17,
        };
    }, [tutorialProgressCounter, selectedTiles]);

    const { pointer: targetKey, disableAllExceptTarget } = getTutorialOverride;

    const isButtonDisabled = useCallback((actionKey) => {
        if (tutorialProgressCounter >= 17) return false;
        
        // Continue Button Special Handling
        if (targetKey === 'CONTINUE_BUTTON') {
            return actionKey !== 'CONTINUE_BUTTON';
        }

        // *** START: CUSTOM LOGIC FOR FREE SELECTION IN STEP 3 ***
        // During step 3, we show a pointer for guidance, but allow all rune tiles to be clicked.
        if (tutorialProgressCounter === 3 && actionKey.startsWith('TILE_RUNE_')) {
            return false;
        }
        // *** END: CUSTOM LOGIC FOR FREE SELECTION IN STEP 3 ***

        if (disableAllExceptTarget) {
            if (actionKey === targetKey) return false;

            // Enable tiles based on step
            if (actionKey.startsWith('TILE_RUNE_')) {
                if (tutorialProgressCounter === 6) return false; // Enable tiles for Attack Again (Step 6)
                
                if (tutorialProgressCounter === 9) {
                    // Only enable AHAS tiles
                    const requiredKeys = AHAS_INDICES.map(idx => `TILE_RUNE_${idx}`);
                    return !requiredKeys.includes(actionKey);
                }
            }
            return true; // Disable everything else
        }
        return false;
    }, [tutorialProgressCounter, targetKey, disableAllExceptTarget]);


    // --- Init (Initial Game Setup) ---
    // 🚩 FIX 1: Added 'user' to the dependency array and checked if 'user' is loaded
    useEffect(() => {
        // Ensure user is loaded before making API calls
        if (!user) return;

        const initGame = async () => {
            try {
                // NOTE: 'userResp' should be declared with 'const' or 'let' if not global
                const userResp = await API.get(`/users/${user.userId}`);
                //console.log(userResp.data);
                
                setUserDetails(userResp.data);
                setLevelData({
                    coinsReward: 500,
                    gemsReward: 300,
                    monsterData: tutorialMonsters
                });
                // Potions are hardcoded here for the tutorial setup
                setUserDetails({
                    userId: userResp.data.userId,
                    firstName: userResp.data.firstName,
                    potions: { HEALTH: 2, SHIELD: 2, SKIP: 2 }
                });
                setPotions({ HEALTH: 2, SHIELD: 2, SKIP: 2 });
                setHp(4);
                setRoundCounter(1);
                setCurrentMonsterIndex(0);
                setItemEquipped({});
                setSrc(BGM_DungeonBattle);
            } catch (error) {
                console.error('Error in initGame (initial setup):', error);
                // Handle token/user load failure gracefully if needed
            }
        };
        initGame();
    // Added 'user' and 'setSrc' to dependency array
    }, [tutorialMonsters, user, setSrc]); 

    // --- Fetch Game Info (Round/Location Change Setup) ---
    // 🚩 FIX 2: Added 'user' to the dependency array and checked if 'user' is loaded
    useEffect(() => {
        // Ensure user is loaded before making API calls
        if (!user) return;

        const fetchGameInfo = async () => {
          try {
            // NOTE: 'userResp' should be declared with 'const' or 'let' if not global
            const userResp = await API.get(`/users/${user.userId}`);
            
            setUserDetails(userResp.data);
            //console.log(userResp.data);
            // --- INITIAL Potion State Reset ---
            setPotionUsedThisRound(false);
            setSkipPotionUsed(false);

          } catch (error) {
            console.error('Error starting game (fetchGameInfo):', error);
          }
        };
        fetchGameInfo();
    // Added 'user' to dependency array
    }, [location.state, navigate, user]);

    const loadNextMonster = (nextIndex) => {
        if (nextIndex < tutorialMonsters.length) {
            setCurrentMonsterIndex(nextIndex);
            setRoundCounter(prev => prev + 1);
            setPotionUsedThisRound(false);
            setSkipPotionUsed(false);
            setDisplayedMistakeCounter(0);
            setCanCastAgain(true);
        } else {
            finishLevel(true);
        }
    };

    const finishLevel = (isSuccess) => {
        setIsGameOver(true);
        if (isSuccess) {
            playLevelClear();
            setSrc();
            setMakeMessageAppear(true);
            setMessageDetails({
                mainMessage: 'Level Cleared',
                subMessage: `Tutorial Complete! Rewards: `
            });
        } else {
            playDungeonFailed();
            setSrc();
            setMakeMessageAppear(true);
            setMessageDetails({
                mainMessage: 'Level Failed',
                subMessage: 'Try again!'
            });
        }
    }

    // --- GAMEPLAY ACTIONS ---

    const handleTileClick = (letter, index) => {
        const actionKey = `TILE_RUNE_${index}`;
        if (!isButtonDisabled(actionKey)) {
            playDungeonClick();
            if (!selectedTiles.find((t) => t.index === index)) {
                const newTiles = [...selectedTiles, { label: letter, index, preselected: false }]; // Correctly defined as newTiles here
                setSelectedTiles(newTiles);

                // Auto progress tutorial steps based on selection count
                // This ensures exactly 3 tiles are selected before moving to the CAST step (Step 4)
                if (tutorialProgressCounter === 3 && newTiles.length === 3) {
                    setTutorialProgressCounter(4);
                }
                if (tutorialProgressCounter === 9 && newTiles.length === 4) {
                    setTutorialProgressCounter(10);
                }
            }
        } else {
            playDenied();
        }
    };

    // Overlay click handler: intercept clicks when tutorial restricts interaction
    const handleOverlayClick = (e) => {
        e.preventDefault();
        // Allow tutorial modal interactions to bypass overlay
        if (makeTutorialBoxAppear) return;

        const { clientX, clientY } = e;
        const el = document.elementFromPoint(clientX, clientY);
        if (!el) {
            playDenied?.();
            return;
        }

        const actionable = el.closest('[data-action]');
        if (!actionable) {
            playDenied?.();
            return;
        }

        // Prevent clicking disabled elements
        if (actionable.disabled) {
            playDenied?.();
            return;
        }

        const action = actionable.dataset.action;

        // Allow action if it matches the tutorial's target or is an enabled tile/potion
        if (action === targetKey) {
            actionable.click();
            return;
        }

        if (action && action.startsWith('TILE_RUNE_')) {
            if (!isButtonDisabled(action)) {
                actionable.click();
                return;
            }
        }

        if (action && action.startsWith('USE_')) {
            if (!isButtonDisabled(action)) {
                actionable.click();
                return;
            }
        }

        if (action === 'CAST_BUTTON') {
            if (!isButtonDisabled('CAST_BUTTON')) {
                actionable.click();
                return;
            }
        }

        if (action === 'CONTINUE_BUTTON') {
            if (!isButtonDisabled('CONTINUE_BUTTON')) {
                actionable.click();
                return;
            }
        }

        playDenied?.();
    };

    const handleSelectedTileClick = (tileToRemove) => {
        // Prevent removing preselected (hint) tiles
        if (tileToRemove.preselected) {
            playDenied?.();
            return;
        }
        playDungeonClick();
        setSelectedTiles((prev) => prev.filter((tile) => tile.index !== tileToRemove.index));
    };

    // Tutorial sequence
    useEffect(() => {
        if (tutorialProgressCounter === 0) {
            setDialogText("Be careful! Thats a dangerous monster!");
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 1) {
            setDialogText("We need to cast it's name in Tagalog to defeat it");
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 2) {
            setDialogText("Let me unlock your ability to cast runes");
            setDialogTextOverride(true);
            isContinueVisible(true);
            setUpperRowVisible(true); // MODIFIED: Make tiles visible here
        }
        else if (tutorialProgressCounter === 3) {
            // setUpperRowVisible(true); // Already done in step 2
            setMakeTutorialBoxAppear(true);
            setDialogTextOverride(true);
            isContinueVisible(false);
        }
        else if (tutorialProgressCounter === 4) {
            setDialogText("After selecting your letters. Click Cast to attack!");
            setDialogTextOverride(true);
            isContinueVisible(false);
        }
        else if (tutorialProgressCounter === 5) {
            setDialogText("You are hurt drink this Health Potion");
            setHealthPotionVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(false); // Guided interaction
        }
        else if (tutorialProgressCounter === 6) {
            setDialogText("Now it's time to attack again!");
            setDialogTextOverride(true);
            isContinueVisible(false);
        }
        else if (tutorialProgressCounter === 7) {
            setDialogText("Let me unlock your full power to cast all runes");

            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 8) {
            setDialogText("I remember now! Snake means Ahas!");
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 9) {
            setDialogText("Select the letters A-H-A-S to ready your spell");
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(false);
        }
        else if (tutorialProgressCounter === 10) {
            setDialogText("Click CAST to defeat the monster!");
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(false);
        }
        else if (tutorialProgressCounter === 11) {
            setDialogText("Easy! Now we need to defeat this next monster. But I have trouble remembering its name.");
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 12) {
            setDialogText("Drink this shield potion, it will protect you from the next attack!");
            setShieldPotionVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(false); // Guided interaction
        }
        else if (tutorialProgressCounter === 13) {
            setDialogText("Now, try casting a random spell. Don't worry, the Shield Potion will protect you!");
            setDialogTextOverride(true);
            isContinueVisible(false);
        }
        else if (tutorialProgressCounter === 14) {
            setDialogText("See, the shield protected you! I still can't remember its name, and time is running out.");
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 15) {
            setDialogText("Take this Skip Potion! Use it to instantly defeat the monster.");
            setSkipPotionVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(false); // Guided interaction
            setSkipPotionUsed(true);
        }
        else if (tutorialProgressCounter === 16) {
            setDialogText("That's it! This is the final enemy—a BOSS! Good luck, you'll take it from here!");
            setDialogTextOverride(true);
            isContinueVisible(true);
            setIsBoss(true);
        }
        else if (tutorialProgressCounter === 17) {
            setDialogTextOverride(false); 
            isContinueVisible(false);
            setShieldPotionVisible(false);
            setSkipPotionVisible(false);
            setHealthPotionVisible(false);
        }
    }, [tutorialProgressCounter, currentMonsterIndex]);

    const handleSubmitAnswer = async () => {
        if (isButtonDisabled('CAST_BUTTON')) {
            playDenied();
            return;
        }

        const guessedName = selectedTiles.map(tile => tile.label).join('');
        const targetName = currentMonster.tagalogName.toUpperCase();
        const isCorrect = guessedName === targetName;

        setSelectedTiles([]);

        if (skipPotionUsed) {
            setSkipPotionUsed(true);
            setPotionUsedThisRound(true);
            setMistakeCounter(0);
        }
        setCanCastAgain(false);

        // --- Tutorial Logic Hooks ---
        if (tutorialProgressCounter === 4) {
            // Mocking correct behavior for step 4, but enemy counterattacks
            setLaserEffect("success");
            playLaserSuccess();
            setMistakeCounter(0);
            setTimeout(() => {
                setLaserEffect(null);
                setEnemyAttacking(true);
                playEnemyAttack();

                setTimeout(() => {
                    if (shieldActive) {
                        setShieldActive(false);
                        playShield();
                    } else {
                        setImpactVisible(true);
                        playHit();
                        setHp(prev => prev - 1);
                        setTimeout(() => setImpactVisible(false), 500);
                    }
                }, 800);

                setTimeout(() => {
                    setEnemyAttacking(false);
                }, 2000);

                setTimeout(() => {
                    setCanCastAgain(true);
                    setDisplayedMistakeCounter(prev => prev + 1);
                    setPotionUsedThisRound(false); // Reset potion usage after each turn
                    setTutorialProgressCounter(5);
                }, 3000);
            }, 1200);
            return;
        }

        if (tutorialProgressCounter === 6) {
             // Mocking correct behavior for step 6, but enemy counterattacks
             setLaserEffect("success");
             playLaserSuccess();
             setTimeout(() => {
                 setLaserEffect(null);
                 setEnemyAttacking(true);
                 playEnemyAttack();

                 setTimeout(() => {
                     if (shieldActive) {
                         setShieldActive(false);
                         playShield();
                     } else {
                         setImpactVisible(true);
                         playHit();
                         setHp(prev => prev - 1);
                         setTimeout(() => setImpactVisible(false), 500);
                     }
                 }, 800);

                 setTimeout(() => {
                     setEnemyAttacking(false);
                 }, 2000);

                 setTimeout(() => {
                     setCanCastAgain(true);
                     setDisplayedMistakeCounter(prev => prev + 1);
                     setPotionUsedThisRound(false); // Reset potion usage after each turn
                     setTutorialProgressCounter(7);
                 }, 3000);
             }, 1200);
             return;
        }

        if (tutorialProgressCounter === 10) {
            // Ahas defeat
            setLaserEffect("success");
            playLaserSuccess();
            setTimeout(() => {
                setEnemyDefeated(true);
                playEnemyDead();
                setTutorialProgressCounter(11);
                setTimeout(() => {
                    setEnemyDefeated(false);
                    setLaserEffect(null);
                    loadNextMonster(currentMonsterIndex + 1);
                }, 1200);
            }, 1200);
            return;
        }

        if (tutorialProgressCounter === 13) {
            // Force fail for shield tutorial
            setLaserEffect("fail");
            playLaserFail();
            setTimeout(() => {
                setLaserEffect(null);
                setEnemyAttacking(true);
                playEnemyAttack();
                setTimeout(() => {
                    setShieldActive(false);
                    playShield();
                    setTutorialProgressCounter(14);
                    setEnemyAttacking(false);
                    setCanCastAgain(true);
                    setPotionUsedThisRound(false); // Reset potion usage after each turn
                }, 800);
            }, 2500);
            return;
        }

        // --- Standard Logic ---
        if (!isCorrect) {
            setLaserEffect("fail");
            playLaserFail();
            setMistakeCounter((prev) => prev + 1);
            setPotionUsedThisRound(false);

            setTimeout(() => {
                setLaserEffect(null);
                setEnemyAttacking(true);
                playEnemyAttack();

                setTimeout(() => {
                    if (shieldActive) {
                        setShieldActive(false);
                        playShield();
                    } else {
                        setImpactVisible(true);
                        playHit();
                        setHp(prev => prev - 1);
                        setTimeout(() => setImpactVisible(false), 500);
                        if (hp - 1 <= 0) {
                            finishLevel(false);
                            return;
                        }
                    }
                }, 800);

                setTimeout(() => {
                    setEnemyAttacking(false);
                }, 2000);

                setTimeout(() => {
                    setCanCastAgain(true);
                    setDisplayedMistakeCounter(prev => prev + 1);
                    setPotionUsedThisRound(false); // Reset potion usage after each turn
                }, 3000);
            }, 2500);

        } else {
            setLaserEffect("success");
            playLaserSuccess();
            setMistakeCounter(0);
            setPotionUsedThisRound(false);

            setTimeout(() => {
                setEnemyDefeated(true);
                playEnemyDead();
                setTimeout(() => {
                    setEnemyDefeated(false);
                    setLaserEffect(null);
                    loadNextMonster(currentMonsterIndex + 1);
                }, 1200);
            }, 1200);
        }
    };

    const healthPotions = potions.HEALTH ?? 0;
    const shieldPotions = potions.SHIELD ?? 0;
    const skipPotions = potions.SKIP ?? 0;

    function confirmPotion(potionType) {
        // Block disabled buttons
        if(isButtonDisabled(`USE_${potionType}_POTION`)) {
            playDenied();
            return;
        }

        let message = {};
        let isAvailable = true;
        let potionCount = 0;

        if (potionType === 'HEALTH') potionCount = healthPotions;
        else if (potionType === 'SHIELD') potionCount = shieldPotions;
        else if (potionType === 'SKIP') potionCount = skipPotions;

        // 1. Check potion stock
        if (potionCount <= 0) {
            playDenied();
            message = {
                mainMessage: 'Out of Potions!',
                subMessage: `You do not have any ${potionType} Potions.`
            };
            isAvailable = false;
        }

        // 2. Check one-per-turn limit
        if (isAvailable && potionUsedThisRound) {
            playDenied();
            message = {
                mainMessage: 'Limit Reached!',
                subMessage: 'You can only use one potion per turn.'
            };
            isAvailable = false;
        }

        // 3. Check Skip Potion rule (must attack after skipping)
        if (isAvailable && skipPotionUsed && potionType !== 'SKIP') {
            playDenied();
            message = {
                mainMessage: 'Action Required!',
                subMessage: 'You must attack before you can drink a potion again.'
            };
            isAvailable = false;
        }

        setMakeMessageAppear(true);

        if (!isAvailable) {
            setMessageDetails({ ...message, showCloseButton: true });
            setCurrentPotion(null);
            return;
        }

        // If all checks pass, set up the confirmation message
        playPotionClick();

        if (potionType === 'HEALTH') {
            message = {
                mainMessage: 'Drink Health Potion?',
                subMessage: 'This will increase your lifepoints by 1'
            };
        } else if (potionType === 'SHIELD') {
            message = {
                mainMessage: 'Use Shield Potion?',
                subMessage: 'This will protect you from the next attack'
            };
        } else if (potionType === 'SKIP') {
            message = {
                mainMessage: 'Use Skip Potion?',
                subMessage: 'This will skip the current monster.\nCan only be used once'
            };
        }

        setMessageDetails(message);
        setCurrentPotion(potionType);
    }

    const usePotion = async (potionType) => {
        // Consume potion counts
        setPotions(prev => ({
            ...prev,
            [potionType]: Math.max((prev[potionType] || 0) - 1, 0)
        }));

        setMakeMessageAppear(false);
        setPotionUsedThisRound(true);

        if (potionType === 'HEALTH') {
            playHeal();
            setHp(prev => Math.min(prev + 1, 4));
            if (tutorialProgressCounter === 5) setTutorialProgressCounter(6);
        }
        if (potionType === 'SHIELD') {
            playShield();
            setShieldActive(true);
            if (tutorialProgressCounter === 12) setTutorialProgressCounter(13);
        }
        if (potionType === 'SKIP') {
            playSkip();
            setSkipPotionUsed(true);
            setPotionUsedThisRound(false);
            if (tutorialProgressCounter === 15) {
                setTutorialProgressCounter(16);
            }
            setTimeout(() => {
                loadNextMonster(currentMonsterIndex + 1);
            }, 500);
        }
        setTimeout(() => {
            setCurrentPotion(null);
        }, 500);
    };

    return (
        <Grid
            container
            direction="row"
            alignItems="center"
            sx={{
                backgroundImage: isBoss ? `linear-gradient(to left, rgba(255, 0, 0, 0.10), rgba(255, 0, 0, 0)),url(${DungeonRoomAnimation})`
                    : `url(${DungeonRoomAnimation})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100vw',
                height: '56.25vw',
                maxHeight: '100vh',
                maxWidth: '177.78vh',
                margin: 'auto',
                position: 'relative',
                overflow: 'auto',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Player Tab */}
            <Box sx={{
                position: 'absolute', top: 16, left: 16,
                backgroundImage: `url(${NameTabvar2})`,
                backgroundSize: 'cover',
                width: 700,
                height: 150,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 2
            }}>
                <img src={MCHeadshot} alt="Player" style={{ width: 100, height: 100, marginLeft: 10 }} />
                <Stack direction={'column'} sx={{ width: 250 }}>
                    <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', paddingLeft: 5 }}>
                        {userDetails.firstName}
                    </Typography>

                </Stack>
                {[0, 1, 2, 3].map(i => (
                    <Box
                        key={i}
                        sx={{
                            width: 48, height: 43,
                            backgroundImage: `url(${shieldActive
                                ? (hp > i ? HeartShield : HeartNotFilled)
                                : (hp > i ? HeartFilled : HeartNotFilled)
                                })`,
                            backgroundSize: 'cover',
                            marginLeft: i === 0 ? 7 : 2
                        }}
                    />
                ))}
            </Box>

            {/* Round Counter */}
            <Stack
                direction="column"
                spacing={1}
                sx={{
                    position: 'absolute',
                    top: 16,
                    alignItems: 'center'
                }}
            >
                <Typography variant="h2"
                    color={isBoss ? "#d07070" : "#5D4037"}
                    sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', WebkitTextStroke: '2px #180f0c', }}>
                    Round
                </Typography>
                <Typography variant="h2"
                    color={isBoss ? "#d07070" : "#5D4037"}
                    sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', WebkitTextStroke: '2px #180f0c' }}>
                    {roundCounter}
                </Typography>
            </Stack>

            {/* Enemy Tab */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundImage: `url(${NameTabvar2})`,
                    backgroundSize: 'cover',
                    width: 700,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 2,
                }}
            >
                <Box sx={{
                    width: 320,
                    height: 70,
                    justifyItems: 'center',
                    alignContent: 'center'
                }}>
                    <Typography
                        variant="h2"
                        color="#5D4037"
                        sx={{
                            fontWeight: 'bold',
                            fontFamily: 'RetroGaming',
                        }}
                    >
                        {currentMonster.englishName}
                    </Typography>
                </Box>

                <Box
                    component="img"
                    src={`data:image/png;base64,${currentMonster.imageData}`}
                    alt="Enemy"
                    sx={{ width: 120, height: 110, marginRight: 2 }}
                />
            </Box>

            {/* Cast Button */}
            <Box sx={{  width: '220px', height: '80px', position: 'absolute', top: '20%' }}>
                <Button
                    sx={{
                        backgroundImage: `url(${CastButton})`,
                        backgroundSize: 'cover',
                        width: '100%',
                        height: '100%',
                        color: '#5D4037',
                        // Force visibility for steps where pointing to CAST, otherwise default behavior
                        visibility: (selectedTiles.length > 0 || [4, 6, 10, 13].includes(tutorialProgressCounter)) ? 'visible' : 'hidden',
                        opacity: canCastAgain && !isButtonDisabled('CAST_BUTTON') ? 1 : 0.5,
                    }}
                    onClick={handleSubmitAnswer}
                    disabled={!canCastAgain || isButtonDisabled('CAST_BUTTON')}
                    data-action="CAST_BUTTON"
                >
                    {/* UPDATED Pointer Style: Removed left/transform override, using new 50% default centering */}
                    {targetKey === 'CAST_BUTTON' && <Pointer style={{ top: '-30px' }} />}
                </Button>
            </Box>

            {/* Selected Tiles */}
            <Box sx={{
                width: 600, height: 100,
                top: '30%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 1000
            }}>
                {selectedTiles.map((tile) => (
                    <Box key={tile.index} sx={{ position: 'relative' }}>
                        <Button
                            onClick={() => handleSelectedTileClick(tile)}
                            disabled={tile.preselected}
                            data-action={`SELECTED_TILE_${tile.index}`}
                            sx={{
                                backgroundImage: `url(${ItemBox})`,
                                backgroundSize: 'cover',
                                width: 60,
                                height: 60,
                                textTransform: 'none',
                                color: '#5D4037',
                                fontWeight: 'bold',
                                fontFamily: 'RetroGaming',
                                fontSize: 24,
                                '&:hover': { opacity: 0.8, cursor: tile.preselected ? 'default' : 'pointer' },
                                boxShadow: tile.preselected ? '0 0 16px 6px rgba(255,235,59,0.85)' : undefined,
                                border: tile.preselected ? '1px solid rgba(255,215,64,0.6)' : undefined,
                            }}
                        >
                            {tile.label}
                            {/* UPDATED Pointer Style: Using new 50% default centering */}
                            {targetKey === `SELECTED_TILE_${tile.index}` && <Pointer style={{ top: '-30px' }} />}
                        </Button>
                    </Box>
                ))}
            </Box>

            {/* Characters */}
            <Box
                sx={{
                    width: 1000,
                    height: 400,
                    top: "3%",
                    position: "relative",
                    display: "flex",
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <Stack direction="row" sx={{ width: "100%" }}>
                    {/* Main Character */}
                    <motion.div
                        key={`mc-${roundCounter}`}
                        initial={{ x: "-200%" }}
                        animate={
                            isGameOver
                                ? { x: -1500, opacity: 0, }
                                : impactVisible
                                    ? { x: [0, -15, 15, -10, 10, -5, 5, 0], }
                                    : { x: 0, opacity: 1, }
                        }
                        transition={{
                            duration: isGameOver ? 1.5 : impactVisible ? 0.6 : 0.8,
                            ease: isGameOver ? "easeIn" : "easeInOut",
                        }}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "220px",
                            height: "215px",
                        }}
                    >
                        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                            <img
                                src={MCNoWeaponArm}
                                alt="Player"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '220px',
                                    height: '215px',
                                    zIndex: 3
                                }}
                            />
                            <img
                                src={MCNoWeaponAnimated}
                                alt="Player"
                                style={{
                                    position: "absolute", top: 0, left: 0, width: "220px", height: "215px",
                                    zIndex: 1
                                }}
                            />
                            {itemEquipped?.cosmeticImage ? (
                                <img
                                    src={`data:image/png;base64,${itemEquipped.cosmeticImage}`}
                                    alt="Weapon"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '220px',
                                        height: '215px',
                                        zIndex: 2
                                    }}
                                />
                            ) : null}
                            {shieldActive && (
                                <img
                                    src={Shield}
                                    alt="Shield"
                                    style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "215px", zIndex: 4 }}
                                />
                            )}

                        </Box>
                        {impactVisible && (
                            <img
                                src={MCNoWeaponHit}
                                alt="Player"
                                style={{ position: "absolute", top: 0, left: 0, width: "220px", height: "215px" }}
                            />
                        )}
                    </motion.div>

                    {/* Enemy Character */}
                    <motion.div
                        key={`enemy-${roundCounter}`}
                        initial={{ x: "100%", opacity: 0 }}
                        animate={
                            enemyDefeated
                                ? { x: [0, -15, 15, -10, 10, -5, 5, 0], opacity: 0 }
                                : { x: enemyAttacking ? "-600px" : 0, opacity: 1 }
                        }
                        transition={{ duration: enemyDefeated ? 1.2 : 0.8, ease: "easeInOut" }}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: "220px",
                            height: "215px",
                        }}
                    >
                        {isBoss && (
                            <img
                                src={BossAura}
                                alt="Aura Enemy"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "220px",
                                    height: "215px",
                                    zIndex: 0,
                                }}
                            />
                        )}

                        <img
                            src={`data:image/png;base64,${currentMonster.imageData}`}
                            alt="Enemy"
                            style={{ width: "220px", height: "215px", position: "relative", zIndex: 1 }}
                        />

                        {/* Shield overlay */}
                        {laserEffect === "fail" && (
                            <img
                                src={ShieldEnemy}
                                alt="Shield Enemy"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "220px",
                                    height: "215px",
                                    zIndex: 2,
                                }}
                            />
                        )}
                    </motion.div>

                    {/* Laser Effect */}
                    <Box
                        sx={{
                            width: 700,
                            height: 100,
                            position: "relative",
                            display: laserEffect ? "flex" : "none",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                            mt: 10,
                            ml: 25,
                        }}
                    >
                        {laserEffect === "success" && (
                            <img
                                key={laserKey}
                                src={LaserSuccess}
                                alt="Laser Success"
                                style={{ width: "100%", height: "100%" }}
                            />
                        )}
                        {laserEffect === "fail" && (
                            <img
                                key={laserKey}
                                src={LaserFail}
                                alt="Laser Fail"
                                style={{ width: "100%", height: "100%" }}
                            />
                        )}
                    </Box>

                </Stack>
            </Box>

            {/* Tutorial Box */}
            {makeTutorialBoxAppear && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                    onClick={() => {
                        setMakeTutorialBoxAppear(false);
                        // setTutorialProgressCounter((prev) => prev + 1); // Not needed, let Effect handle it
                    }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '20%',
                        backgroundImage: `url(${TutorialHowToSelect})`,
                        backgroundSize: 'cover',
                        width: '51%',
                        height: '56%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Stack
                            direction={'row'}
                            sx={{
                                top: 10,
                                right: 20,
                                pr: 1,
                                pt: 2,
                                position: 'absolute',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            spacing={.1}
                        >
                            <Typography sx={{ width: '260px', height: '20px', fontSize: '13px', }}>
                                Click to anywhere to continue...
                            </Typography>
                            <img src={LeftClick} alt="Left Click" style={{ width: '30px', height: '30px', }} />
                        </Stack>
                    </Box>
                </Box>
            )}

            {/* Message Box */}
            {makeMessageAppear && (
                <Box sx={{
                    position: 'absolute',
                    backgroundImage: `url(${GameTextBoxMediumLong})`,
                    backgroundSize: 'cover',
                    width: '51%',
                    height: '36%',
                    top: '30%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <Grid container direction="column" alignItems="center" sx={{ p: 4 }}>
                        <Stack direction="column" alignItems="center">
                            <Typography variant="h2" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                {messageDetails.mainMessage}
                            </Typography>

                            <Typography variant="h5" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', mt: 2, textAlign: 'center', whiteSpace: 'pre-line', }}>
                                {messageDetails.subMessage}
                            </Typography>

                            {/* If game cleared, show rewards */}
                            {messageDetails.mainMessage === 'Level Cleared' && (
                                <Stack direction="row" spacing={4} mt={2}>
                                    <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                        <img src={GoldCoins} alt="Coin" style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} />
                                        {(levelData.coinsReward ?? 0)} Coins
                                    </Typography>
                                    <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming' }}>
                                        <img src={Gems} alt="Gems" style={{ width: '20px', height: '30px', marginRight: '8px', verticalAlign: 'middle' }} />
                                        {(levelData.gemsReward ?? 0)} Gems
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>

                        {/* Show return to town if game over */}
                        {(isGameOver) && (
                            <Button
                                sx={{
                                    backgroundImage: `url(${GameShopBoxSmall})`,
                                    backgroundSize: 'cover',
                                    width: '210px',
                                    height: '60px',
                                    top: 20,
                                    color: '#5D4037',
                                    mt: 2
                                }}
                                onClick={() => {
                                    playConfirm();
                                    navigate('/TutorialHomepage');
                                }}
                            >
                                <Typography sx={{ fontFamily: 'RetroGaming' }}>Return to Town</Typography>
                            </Button>
                        )}

                        {/* Show potion confirm/cancel buttons */}
                        {currentPotion ? (
                            <Stack direction='row' spacing={2}>
                                <Button
                                    sx={{
                                        backgroundImage: `url(${GameShopBoxSmall})`,
                                        backgroundSize: 'cover',
                                        width: '210px',
                                        height: '60px',
                                        top: 20,
                                        color: '#5D4037'
                                    }}
                                    onClick={() => usePotion(currentPotion)}
                                >
                                    <Typography sx={{ fontFamily: 'RetroGaming' }}>Confirm</Typography>
                                </Button>
                                <Button
                                    sx={{
                                        backgroundImage: `url(${GameShopBoxSmallRed})`,
                                        backgroundSize: 'cover',
                                        width: '210px',
                                        height: '60px',
                                        top: 20,
                                        color: '#5D4037'
                                    }}
                                    onClick={() => {
                                        playCancel();
                                        setCurrentPotion(null);
                                        setMakeMessageAppear(false);
                                    }}
                                >
                                    <Typography >Cancel</Typography>
                                </Button>
                            </Stack>
                        ) : (
                            // Only show Close button for error/limit messages 
                            !isGameOver && messageDetails.showCloseButton && (
                                 <Button
                                    sx={{
                                        backgroundImage: `url(${GameShopBoxSmall})`,
                                        backgroundSize: 'cover',
                                        width: '210px',
                                        height: '60px',
                                        top: 20,
                                        color: '#5D4037',
                                        mt: 2
                                    }}
                                    onClick={() => {
                                        playCancel();
                                        setMakeMessageAppear(false);
                                        setMessageDetails({});
                                    }}
                                >
                                    <Typography sx={{ fontFamily: 'RetroGaming' }}>Close</Typography>
                                </Button>
                            )
                        )}
                        
                        {/* Close button for normal messages */}
                        {(!isGameOver && messageDetails.showCloseButton) && (
                             <Button
                                sx={{
                                    backgroundImage: `url(${GameShopBoxSmall})`,
                                    backgroundSize: 'cover',
                                    width: '210px',
                                    height: '60px',
                                    top: 20,
                                    color: '#5D4037',
                                    mt: 2
                                }}
                                onClick={() => {
                                    playCancel();
                                    setMakeMessageAppear(false);
                                    setMessageDetails({});
                                }}
                            >
                                <Typography sx={{ fontFamily: 'RetroGaming' }}>Close</Typography>
                                
                            </Button>
                        )}
                    </Grid>
                </Box>
            )}


            <Box
                sx={{
                    position: 'absolute',
                    backgroundImage: `url(${DungeonBarv2})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    height: '220px',
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mr: 1.5 }}
                >
                    <Box sx={{ width:350 }}>
                    {/* Potions */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        {[
                          { key: 'HEALTH', visible: healthPotionVisible, img: HealthPotion, label: "Health Potion", potionType: "HEALTH", count: healthPotions },
                          { key: 'SHIELD', visible: shieldPotionVisible, img: ShieldPotion, label: "Shield Potion", potionType: "SHIELD", count: shieldPotions },
                          { key: 'SKIP', visible: skipPotionVisible, img: SkipPotion, label: "Skip Potion", potionType: "SKIP", count: skipPotions }
                        ].map((potion) => {
                            // Only render if visible flag is true OR tutorial is over
                            const isVisible = potion.visible || tutorialProgressCounter > 16;
                            const actionKey = `USE_${potion.potionType}_POTION`;
                            const disabled = isButtonDisabled(actionKey);
                            
                            return (
                                <Box key={potion.key} sx={{ display: isVisible ? 'block' : 'none', position: 'relative' }}>
                                    <Stack direction="column" spacing={1} alignItems="center">
                                        <Box sx={{ position: 'relative' }}>
                                            <Button
                                                sx={{
                                                    backgroundImage: `url(${ItemBox})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    width: 100,
                                                    height: 100,
                                                    textTransform: 'none',
                                                    color: '#5D4037',
                                                    fontWeight: 'bold',
                                                    fontFamily: 'RetroGaming',
                                                    opacity: potion.count > 0 && !disabled ? 1 : 0.5,
                                                    pointerEvents: isGameOver ? 'none' : 'auto',
                                                    '&:hover': { opacity: 0.8, cursor: 'pointer' }
                                                }}
                                                disabled={disabled}
                                                onClick={() => confirmPotion(potion.potionType)}
                                                data-action={actionKey}
                                            >
                                                <img src={potion.img} alt={potion.label} style={{ width: '40px', height: '50px' }} />
                                                {/* UPDATED Pointer Style: Using new 50% default centering */}
                                                {targetKey === actionKey && <Pointer style={{ top: '-30px' }} />}
                                            </Button>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            align="center"
                                            sx={{ color: '#5D4037', fontWeight: 'bold', fontFamily: 'RetroGaming' }}
                                        >
                                            {potion.label} ({potion.count})
                                        </Typography>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                    </Box>
                    {/* Letter Tiles */}
                    <Stack direction="column" spacing={1} alignItems="center" sx={{ width: 900, height: 140 }}>
                        {[0, 1].map((row) => {
                            const rowVisible = row === 0 ? upperRowVisible : lowerRowVisible;
                            return (
                                <Stack
                                    key={row}
                                    direction="row"
                                    spacing={1}
                                    sx={{ display: rowVisible ? 'flex' : 'none' }} // hide/show whole row
                                >
                                    {rowVisible &&
                                        uppercaseLetters &&
                                        uppercaseLetters.slice(row * 7, (row + 1) * 7).map((letter, idx) => {
                                            const globalIndex = row * 7 + idx;
                                            const isSelected = selectedTiles.some((t) => t.index === globalIndex);
                                            const actionKey = `TILE_RUNE_${globalIndex}`;
                                            const disabled = isButtonDisabled(actionKey);

                                            // Pointer logic to show on multiple tiles based on tutorial step
                                            const showPointerOnTile = (
                                                // Target key matches (e.g., specific tile in step 9)
                                                targetKey === actionKey || 
                                                // Step 2: Show on all upper-row letters (indices 0-6)
                                                (tutorialProgressCounter === 2 && globalIndex >= 0 && globalIndex <= 6) ||
                                                // Step 3: Show on all letters (indices 0-13) until 3 are selected
                                                (tutorialProgressCounter === 3 && selectedTiles.length < 3)
                                            );
                                            
                                            return (
                                                <Box key={globalIndex} sx={{ position: 'relative' }}>
                                                    <Button
                                                        onClick={() => handleTileClick(letter, globalIndex)}
                                                        disabled={isSelected || disabled}
                                                        data-action={actionKey}
                                                        sx={{
                                                            visibility: isSelected ? 'hidden' : 'visible',
                                                            backgroundImage: `url(${ItemBox})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            width: 60,
                                                            height: 60,
                                                            textTransform: 'none',
                                                            color: '#5D4037',
                                                            fontWeight: 'bold',
                                                            fontFamily: 'RetroGaming',
                                                            fontSize: 24,
                                                            opacity: disabled ? 0.5 : 1, 
                                                            '&:hover': { opacity: 0.8, cursor: 'pointer' }
                                                        }}
                                                    >
                                                        {letter}
                                                        {/* Render pointer based on the combined logic, using new 50% default centering */}
                                                        {showPointerOnTile && <Pointer style={{ top: '-30px' }} />}
                                                    </Button>
                                                </Box>
                                            );
                                        })}
                                </Stack>
                            );
                        })}
                    </Stack>

                    {/* Hint Box (Pixie Dialogue) */}
                    <Box
                        sx={{
                            backgroundImage: `url(${DungeonHint})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            width: 350,
                            height: 150,
                            position: 'relative',
                            cursor: dialogTextOverride && continueVisible && !isButtonDisabled('CONTINUE_BUTTON') ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                            // Only advance tutorial when override is active (scripted dialog)
                            if (!dialogTextOverride) return;
                            const disabled = isButtonDisabled('CONTINUE_BUTTON');
                            if (continueVisible && !makeTutorialBoxAppear && !disabled) {
                                playConfirm();
                                setTutorialProgressCounter(prev => prev + 1);
                            } else if (disabled && continueVisible) {
                                playDenied();
                            }
                        }}
                        data-action="CONTINUE_BUTTON"
                    >
                            {/* NEW Pointer location: Centered above the whole box */}
                            {targetKey === 'CONTINUE_BUTTON' && <Pointer style={{ top: '-10px' }} />}

                            {/* If dialog override is active (scripted dialog), show it; otherwise show normal hint UI */}
                            {dialogTextOverride ? (
                                <>
                                    <Typography sx={{ padding: 2, textAlign: 'center', mt: 1 }}>
                                        {dialogText}
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

                                    {continueVisible && (
                                        <Stack
                                            direction={'row'}
                                            sx={{
                                                bottom: 14,
                                                left: 20,
                                                pl: 3,
                                                pt: 2,
                                                position: 'absolute'
                                            }}
                                            spacing={.1}
                                        >
                                            <Typography
                                                sx={{
                                                    width: '160px',
                                                    height: '20px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Click to continue...
                                            </Typography>
                                            <img
                                                src={LeftClick}
                                                alt="Left Click"
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                }}
                                            />
                                            {/* OLD Pointer location REMOVED */}
                                        </Stack>
                                    )}
                                </>
                            ) : (
                                // Normal hint dialog (post-tutorial): mirror DungeonGame behavior
                                <>
                                    {displayedMistakeCounter === 0 ? (
                                        <Typography sx={{ padding: 2, textAlign: 'center', mt: 1 }}>
                                            I think that's {currentMonster.description} ...
                                        </Typography>
                                    ) : (() => {
                                        const { revealed, fully, fullName } = getPartialTagalogName();
                                        if (fully) {
                                            return (
                                                <Typography sx={{ padding: 2, textAlign: 'center', mt: 1 }}>
                                                    Oh I remember now! that's {fullName}.
                                                </Typography>
                                            );
                                        }
                                        return (
                                            <Typography sx={{ padding: 2, textAlign: 'center', mt: 1 }}>
                                                I think that monster's name is {revealed || '???'}...
                                            </Typography>
                                        );
                                    })()}

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
                                </>
                            )}
                    </Box>

                </Stack>
            </Box>
        </Grid>
    );
}