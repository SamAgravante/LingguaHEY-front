import React, { useState, useEffect, useContext, useMemo } from 'react';
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

// --- ASSETS (Keep all existing imports) ---
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


import BossAura from "../../assets/images/effects/BossAura.gif";
import LaserFail from "../../assets/images/effects/LaserFail.gif";
import LaserSuccess from "../../assets/images/effects/LaserSuccess.gif";
import Shield from "../../assets/images/effects/Shield.png";
import ShieldEnemy from "../../assets/images/effects/ShieldEnemy.png";
import MCNoWeaponHit from '../../assets/images/characters/MCNoWeaponHit.png';

export default function TutorialDungeonGame() {
    const location = useLocation();
    const navigate = useNavigate();

    // HArdcoded monster for tutorial
    const [tutorialMonsters] = useState([
        {
            description: "a creature that slides and crawls",
            englishName: "Snake",
            imageData: "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",
            jumbledLetters: ['S', 'H', 'A', 'K', 'L', 'B', 'R', 'H', 'Z', 'S', 'M', 'N', 'A', 'E'],
            monsterId: 1,
            tagalogName: "Ahas"
        },
        {
            description: "a creature that oinks",
            englishName: "Pig",
            imageData: "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",
            jumbledLetters: ['O', 'Y', 'Z', 'B', 'P', 'B', 'G', 'J', 'A', 'H', 'X', 'A', 'L', 'W'],
            monsterId: 2,
            tagalogName: "Baboy"
        },
        {
            description: "a furry animal that meows",
            englishName: "Cat",
            imageData: "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",
            jumbledLetters: ['P', 'X', 'S', 'A', 'Z', 'R', 'L', 'I', 'U', 'Q', 'Y', 'T', 'P', 'C'],
            monsterId: 3,
            tagalogName: "Pusa"
        }
    ]);

    const [levelData, setLevelData] = useState({});
    const [selectedTiles, setSelectedTiles] = useState([]);

    // Track which monster index we are currently on
    const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
    const [currentMonster, setCurrentMonster] = useState({});

    const [hp, setHp] = useState(3);
    const [userDetails, setUserDetails] = useState({});
    const [roundCounter, setRoundCounter] = useState(1);
    const [makeMessageAppear, setMakeMessageAppear] = useState(false);
    const [messageDetails, setMessageDetails] = useState({});
    const [itemEquipped, setItemEquipped] = useState({});
    const [enemyAttacking, setEnemyAttacking] = useState(false);
    const [impactVisible, setImpactVisible] = useState(false);
    const [potions, setPotions] = useState({});
    const [mistakeCounter, setMistakeCounter] = useState(0);
    const [displayedMistakeCounter, setDisplayedMistakeCounter] = useState(0);

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
    

    // SFX Hooks
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

    // --- 1. INITIALIZE TUTORIAL DATA (Replaces fetchGameInfo) ---
    useEffect(() => {
        // Set up Tutorial State locally without API
        const initGame = () => {
            // Set fixed tutorial rewards
            setLevelData({
                coinsReward: 100,
                gemsReward: 50,
                monsterData: tutorialMonsters
            });

            // Mock User Details
            setUserDetails({
                userId: "tutorial_user",
                firstName: "Learner",
                potions: { HEALTH: 5, SHIELD: 5, SKIP: 5 } // Give enough potions for tutorial
            });
            setPotions({ HEALTH: 5, SHIELD: 5, SKIP: 5 });

            // Set Initial Game Stats
            setHp(4);
            setRoundCounter(1);
            setCurrentMonsterIndex(0);
            setCurrentMonster(tutorialMonsters[0]);

            // No item equipped in tutorial or default
            setItemEquipped({});

            setSrc(BGM_DungeonBattle);
        };

        initGame();
    }, [tutorialMonsters]);

    // Load next monster helper
    const loadNextMonster = (nextIndex) => {
        if (nextIndex < tutorialMonsters.length) {
            setCurrentMonsterIndex(nextIndex);
            setCurrentMonster(tutorialMonsters[nextIndex]);
            setRoundCounter(prev => prev + 1);
            // Reset Round State
            setPotionUsedThisRound(false);
            setSkipPotionUsed(false);
            setDisplayedMistakeCounter(0);
            setCanCastAgain(true);
        } else {
            // Tutorial Complete
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

    // Helper for hints
    function getPartialTagalogName() {
        const name = currentMonster?.tagalogName || '';
        if (!name || displayedMistakeCounter <= 0) return { revealed: null, fully: false };
        const parts = 3;
        const progress = Math.min(displayedMistakeCounter, 4);
        const revealSegments = Math.min(progress, parts);
        const revealLen = Math.ceil((name.length / parts) * revealSegments);
        const revealed = name.slice(0, revealLen);
        const fully = revealLen >= name.length;
        return { revealed, fully, fullName: name };
    }

    const hints = [
        'Read the Codex to learn about the monsters',
        'Use your potions wisely',
        'You buy potions in the shop'
    ];

    // computeDialogText returns a plain string based on current state
    function computeDialogText() {
        if (!currentMonster) return '';
        if (displayedMistakeCounter === 0) {
            return `I think that's ${currentMonster.description} ...`;
        }
        const { revealed, fully, fullName } = getPartialTagalogName();
        if (fully) {
            return `Oh I remember now! that's ${fullName}.`;
        }
        return `I think that monster's name is ${revealed || '???'}...`;
    }

    // keep dialogText in sync with monster/mistake state
    useEffect(() => {
        // if an override is active, don't overwrite the custom dialog text
        if (dialogTextOverride) return;
        setDialogText(computeDialogText());
    }, [currentMonster, displayedMistakeCounter, dialogTextOverride]);

    // Provide the letter array used by the tiles (fixes `uppercaseLetters is not defined`)
    const uppercaseLetters = useMemo(() => {
        const letters = currentMonster?.jumbledLetters ?? tutorialMonsters?.[0]?.jumbledLetters ?? [];
        return letters.map((l) => String(l).toUpperCase());
    }, [currentMonster, tutorialMonsters]);

    // --- GAMEPLAY ACTIONS ---

    const handleTileClick = (letter, index) => {
        playDungeonClick();
        if (!selectedTiles.find((t) => t.index === index)) {
            setSelectedTiles((prev) => [...prev, { label: letter, index }]);
        }
    };

    const handleSelectedTileClick = (tileToRemove) => {
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
        }
        else if (tutorialProgressCounter === 3) {
            setUpperRowVisible(true);
            setMakeTutorialBoxAppear(true);
            //setTutorialProgressCounter((prev) => prev + 1);
            //setDialogText("Click CAST when you are ready to attack!");
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
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 6) {
            setDialogText("Now it's time to attack again!");
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 7) {
            setDialogText("Let me unlock your full power to cast all runes");
            setLowerRowVisible(true);
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
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 10) {
            setDialogText("Click CAST to defeat the monster!");
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 11) {
            setDialogText("Easy! Now we need to defeat this next monster");
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 11) {
            setDialogText("I have trouble remembering its name.");
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(true);
        }
        else if (tutorialProgressCounter === 12) {
            setDialogText("Drink this shield potion, it will protect you from the monsters attack");
            setShieldPotionVisible(true);
            setLowerRowVisible(true);
            setDialogTextOverride(true);
            isContinueVisible(true);
        }

        console.log("Tutorial Progress:", tutorialProgressCounter);
    }, [tutorialProgressCounter]);

    // --- LOCAL SUBMIT LOGIC (Replaces API.post /game/guess) ---
    const handleSubmitAnswer = async () => {
        const guessedName = selectedTiles.map(tile => tile.label).join('');
        const targetName = currentMonster.tagalogName.toUpperCase();

        // Determine correctness locally
        const isCorrect = guessedName === targetName;

        setSelectedTiles([]);

        if (skipPotionUsed) {
            setSkipPotionUsed(false);
            setPotionUsedThisRound(true);
            setMistakeCounter(0);
        }
        setCanCastAgain(false);

        if (!isCorrect) {
            // --- WRONG ANSWER LOGIC ---
            setLaserEffect("fail");
            playLaserFail();
            setMistakeCounter((prev) => prev + 1);
            setPotionUsedThisRound(false);

            // Enemy counterattack sequence
            setTimeout(() => {
                setLaserEffect(null);
                setEnemyAttacking(true);
                playEnemyAttack();

                setTimeout(() => {
                    // Check Shield
                    if (shieldActive) {
                        setShieldActive(false);
                        playShield();
                    } else {
                        // Damage Logic
                        setImpactVisible(true);
                        playHit();
                        const newHp = hp - 1;
                        setHp(newHp);
                        const newDamageCount = damageCounter + 1; 
                        setDamageCounter(newDamageCount);
                        console.log("Damage Counter:", newDamageCount);
                        if (newDamageCount === 2){
                            setTutorialProgressCounter((prev) => prev + 1);
                        }
                        console.log(damageCounter);
                        setTimeout(() => setImpactVisible(false), 500);

                        if (newHp <= 0) {
                            finishLevel(false);
                            return; // Stop execution
                        }
                    }
                }, 800);

                // Return enemy back
                setTimeout(() => {
                    setEnemyAttacking(false);
                }, 2000);

                setTimeout(() => {
                    setCanCastAgain(true);
                    setDisplayedMistakeCounter(prev => prev + 1);
                }, 3000);
            }, 2500);

        } else {
            // --- CORRECT ANSWER LOGIC ---
            setLaserEffect("success");
            playLaserSuccess();
            setMistakeCounter(0);

            setTimeout(() => {
                setEnemyDefeated(true);
                playEnemyDead();

                setTimeout(() => {
                    setEnemyDefeated(false);
                    setLaserEffect(null);
                    // Load Next
                    loadNextMonster(currentMonsterIndex + 1);
                }, 1200);

            }, 1200);
        }
    };


    // --- LOCAL POTION LOGIC (Replaces API.post /game/use-potion) ---
    const healthPotions = potions.HEALTH ?? 0;
    const shieldPotions = potions.SHIELD ?? 0;
    const skipPotions = potions.SKIP ?? 0;

    function confirmPotion(potionType) {
        let message = {};
        let isAvailable = true;
        let potionCount = 0;

        if (potionType === 'HEALTH') potionCount = healthPotions;
        else if (potionType === 'SHIELD') potionCount = shieldPotions;
        else if (potionType === 'SKIP') potionCount = skipPotions;

        // Checks
        if (potionCount <= 0) {
            playDenied();
            message = { mainMessage: 'Out of Potions!', subMessage: `You do not have any ${potionType} Potions.` };
            isAvailable = false;
        }
        if (isAvailable && potionUsedThisRound) {
            playDenied();
            message = { mainMessage: 'Limit Reached!', subMessage: 'You can only use one potion per round.' };
            isAvailable = false;
        }
        if (isAvailable && skipPotionUsed && potionType !== 'SKIP') {
            playDenied();
            message = { mainMessage: 'Action Required!', subMessage: 'You must attack before you can drink a potion again.' };
            isAvailable = false;
        }

        setMakeMessageAppear(true);

        if (!isAvailable) {
            setMessageDetails({ ...message, showCloseButton: true });
            setCurrentPotion(null);
            return;
        }

        playPotionClick();
        if (potionType === 'HEALTH') message = { mainMessage: 'Drink Health Potion?', subMessage: 'This will increase your lifepoints by 1' };
        else if (potionType === 'SHIELD') message = { mainMessage: 'Use Shield Potion?', subMessage: 'This will protect you from the next attack' };
        else if (potionType === 'SKIP') message = { mainMessage: 'Use Skip Potion?', subMessage: 'This will skip the current monster.\nCan only be used once' };

        setMessageDetails(message);
        setCurrentPotion(potionType);
    }

    const usePotion = async (potionType) => {
        // Decrease count locally
        setPotions(prev => ({
            ...prev,
            [potionType]: prev[potionType] - 1
        }));

        setMakeMessageAppear(false);
        setPotionUsedThisRound(true);

        if (potionType === 'HEALTH') {
            playHeal();
            setHp(prev => Math.min(prev + 1, 4)); // Max 3 HP
            setTutorialProgressCounter((prev) => prev + 1);
        }
        if (potionType === 'SHIELD') {
            playShield();
            setShieldActive(true);
        }
        if (potionType === 'SKIP') {
            playSkip();
            setSkipPotionUsed(true);
            setPotionUsedThisRound(false); // Special rule for skip

            // Move to next monster immediately
            // (Visual delay for effect)
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
                        {userDetails.firstName || 'Learner'}
                    </Typography>
                    <Typography variant="body1" color="#5D4037" sx={{ fontFamily: 'RetroGaming', paddingLeft: 5 }}>
                        (Tutorial Mode)
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
            <Button
                sx={{
                    backgroundImage: `url(${CastButton})`,
                    backgroundSize: 'cover',
                    width: '220px',
                    height: '80px',
                    position: 'absolute',
                    top: '20%',
                    color: '#5D4037',
                    visibility: selectedTiles.length > 0 ? 'visible' : 'hidden',
                    opacity: canCastAgain ? 1 : 0.5,
                }}
                onClick={handleSubmitAnswer}
                disabled={!canCastAgain}
            />

            {/* Selected Tiles */}
            <Box sx={{
                width: 600, height: 100,
                top: '30%', position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 1000
            }}>
                {selectedTiles.map((tile) => (
                    <Button
                        key={tile.index}
                        onClick={() => handleSelectedTileClick(tile)}
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
                            '&:hover': { opacity: 0.8, cursor: 'pointer' }
                        }}
                    >
                        {tile.label}
                    </Button>
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
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Black with 70% opacity
                        zIndex: 1000, // High z-index to sit on top of everything
                        display: 'flex',
                        justifyContent: 'center', // Horizontally center the child
                        // We don't use 'alignItems: center' here because you have a specific 'top' set on the child
                    }}
                    onClick={() => {
                    setMakeTutorialBoxAppear(false);
                    setTutorialProgressCounter((prev) => prev + 1);
                    
                  }}
                >

                    {/* 2. Your Original Box (The Modal Content) */}
                    <Box sx={{
                        position: 'absolute', // Keep absolute to use 'top' effectively
                        top: '20%', // Your specific vertical positioning
                        backgroundImage: `url(${TutorialHowToSelect})`,
                        backgroundSize: 'cover',
                        width: '51%',
                        height: '56%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // No z-index needed here, it inherits the stacking context of the parent
                    }}
                    >
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


                            <Typography

                                sx={{
                                    width: '260px',
                                    height: '20px',
                                    fontSize: '13px',
                                }}
                            >
                                Click to anywhere to continue...
                            </Typography>
                            <img
                                src={LeftClick}
                                alt="Left Click"
                                style={{
                                    width: '30px',
                                    height: '30px',

                                }}
                            />
                        </Stack>
                    </Box>

                </Box>)}

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

                            {/* If failed, show hint */}
                            {isGameOver && messageDetails.mainMessage === 'Level Failed' && (
                                <Typography variant="h6" color="#5D4037" sx={{ fontWeight: 'bold', fontFamily: 'RetroGaming', mt: 2 }}>
                                    {hints[Math.floor(Math.random() * hints.length)]}
                                </Typography>
                            )}
                        </Stack>


                        {/* Show potion confirm/cancel OR Close button for error */}
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
                            messageDetails.showCloseButton && (
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
                                    navigate('/homepage');
                                }}
                            >
                                <Typography sx={{ fontFamily: 'RetroGaming' }}>Return to Town</Typography>
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
                    {(
                      // Build config per potion so each has its own visibility flag
                      [
                        { key: 'HEALTH', visible: healthPotionVisible, img: HealthPotion, label: "Health Potion", potionType: "HEALTH", count: healthPotions },
                        { key: 'SHIELD', visible: shieldPotionVisible, img: ShieldPotion, label: "Shield Potion", potionType: "SHIELD", count: shieldPotions },
                        { key: 'SKIP', visible: skipPotionVisible, img: SkipPotion, label: "Skip Potion", potionType: "SKIP", count: skipPotions }
                      ].filter(p => p.visible).length > 0
                    ) && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        {[
                          { key: 'HEALTH', visible: healthPotionVisible, img: HealthPotion, label: "Health Potion", potionType: "HEALTH", count: healthPotions },
                          { key: 'SHIELD', visible: shieldPotionVisible, img: ShieldPotion, label: "Shield Potion", potionType: "SHIELD", count: shieldPotions },
                          { key: 'SKIP', visible: skipPotionVisible, img: SkipPotion, label: "Skip Potion", potionType: "SKIP", count: skipPotions }
                        ].filter(p => p.visible).map((potion) => (
                          <Stack key={potion.key} direction="column" spacing={1} alignItems="center">
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
                                opacity: potion.count > 0 ? 1 : 0.5,
                                pointerEvents: isGameOver ? 'none' : 'auto',
                                '&:hover': { opacity: 0.8, cursor: 'pointer' }
                              }}
                              onClick={() => confirmPotion(potion.potionType)}
                            >
                              <img src={potion.img} alt={potion.label} style={{ width: '40px', height: '50px' }} />
                            </Button>
                            <Typography
                              variant="caption"
                              align="center"
                              sx={{ color: '#5D4037', fontWeight: 'bold', fontFamily: 'RetroGaming' }}
                            >
                              {potion.label} ({potion.count})
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
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
                                            return (
                                                <Button
                                                    key={globalIndex}
                                                    onClick={() => handleTileClick(letter, globalIndex)}
                                                    disabled={isSelected}
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
                                                        opacity: 1, '&:hover': { opacity: 0.8, cursor: 'pointer' }
                                                    }}
                                                >
                                                    {letter}
                                                </Button>
                                            );
                                        })}
                                </Stack>
                            );
                        })}
                    </Stack>

                    {/* Hint Box */}
                    <Box
                        sx={{
                            backgroundImage: `url(${DungeonHint})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            width: 350,
                            height: 150,
                            position: 'relative',

                        }}
                        onClick={() => setTutorialProgressCounter(tutorialProgressCounter + 1)
                        }
                    >
                        {displayedMistakeCounter === 0 ? <Typography sx={{ padding: 2, textAlign: 'center', mt: 1 }}>
                            {dialogText}
                        </Typography> : <Typography sx={{ padding: 2, textAlign: 'center', mt: 1 }}>
                            {dialogText}
                        </Typography>}
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

                        {continueVisible ? <Stack
                            direction={'row'}
                            sx={{
                                bottom: 14,
                                left: 20,
                                pl: 3,
                                pt: 2,
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
                        </Stack> : <Typography />}
                    </Box>

                </Stack>
            </Box>
        </Grid>
    );
}