import React, { createContext, useState, useRef, useEffect, useCallback } from "react";
import defaultBgm from "../assets/music/LingguaHEY-Live.mp3";
import activityBgm from "../assets/music/LingguaHEY-Mini.mp3";
import introBgm from "../assets/music/LingguaHEY-Intro.mp3";

// MOVED TO SFX IMPORT: lvlClearBgm
import SFX_LevelClear from "../assets/music/LingguaHEY-LevelClear.mp3"; // Renamed and moved to SFX

// New BGM
import BGM_DungeonBattle from "../assets/music/BGM_DungeonBattle.wav";
import BGM_DungeonLevelSelect from "../assets/music/BGM_DungeonLevelSelect.wav";
import BGM_MainMenu from "../assets/music/BGM_MainMenu.mp3";

// --- SFX Imports ---
import SFX_LaserSuccess from "../assets/music/SFX_LaserSuccess.mp3";
import SFX_LaserFail from "../assets/music/SFX_LaserFail.mp3";
import SFX_BuySuccess from "../assets/music/SFX_BuySuccess.wav";
import SFX_Cancel from "../assets/music/SFX_Cancel.wav";
import SFX_Confirm from "../assets/music/SFX_Confirm.wav";
import SFX_Denied from "../assets/music/SFX_Denied.wav";
import SFX_Equip from "../assets/music/SFX_Equip.wav";
import SFX_Heal from "../assets/music/SFX_Heal.wav";
import SFX_Shield from "../assets/music/SFX_Shield.wav";
import SFX_Skip from "../assets/music/SFX_Skip.wav";
import SFX_Hit from "../assets/music/SFX_Hit.wav";
import SFX_EnemyAttack from "../assets/music/SFX_EnemyAttack.wav";
import SFX_EnemyDead from "../assets/music/SFX_EnemyDead.wav";
import SFX_Flip from "../assets/music/SFX_Flip.mp3";
import SFX_PotionClick from "../assets/music/SFX_PotionClick.wav";
import SFX_Summon from "../assets/music/SFX_Summon.mp3";
import SFX_DoorOpen from "../assets/music/SFX_DoorOpen.mp3";
import SFX_DungeonClick from "../assets/music/SFX_DungeonClick.mp3";
import SFX_DungeonFailed from "../assets/music/SFX_DungeonFailed.mp3";


export const MusicContext = createContext({
  musicOn: false,
  toggleMusic: () => { },
  setActivityMode: () => { },
  setIntroMode: () => { },
  setSrc: () => { },

  // SFX Functions
  playLaserSuccess: () => { },
  playLaserFail: () => { },
  playBuySuccess: () => { },
  playCancel: () => { },
  playConfirm: () => { },
  playDenied: () => { },
  playEquip: () => { },
  playHeal: () => { },
  playShield: () => { },
  playSkip: () => { },
  playHit: () => { },
  playEnemyAttack: () => { },
  playEnemyDead: () => { },
  playFlip: () => { },
  playPotionClick: () => { },
  playSummon: () => { },
  playDoorOpen: () => { },
  playDungeonClick: () => { },
  playLevelClear: () => { },
  playDungeonFailed: () => {},
});

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [src, setSrc] = useState(introBgm);


  const setIntroMode = useCallback((isIntro) => {
    setSrc(isIntro ? introBgm : BGM_MainMenu);
  }, []);

  const setActivityMode = useCallback((isActivity) => {
    setSrc(isActivity ? activityBgm : BGM_MainMenu);
  }, []);

  const setMusicSource = useCallback((newSrc) => {
    setSrc(newSrc);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = src;
    audioRef.current.volume = 0.3; // Set volume for BGM
    if (musicOn) audioRef.current.play().catch(() => { });
    else audioRef.current.pause();
  }, [src, musicOn]);

  const toggleMusic = useCallback(() => setMusicOn((v) => !v), []);

  // --- SFX Core Logic ---
  const playSfx = useCallback((sfxSrc, volume = 1.0) => {
    if (!musicOn) return;

    const audio = new Audio(sfxSrc);
    audio.volume = volume;

    setTimeout(() => {
      audio.play().catch(e => console.warn("SFX Play failed (often due to user interaction required):", e));
    }, 1);

  }, [musicOn]);

  // -Two variables needed in playSFX 1. Source then 2. Volume 0-1 --
  const playLaserSuccess = useCallback(() => playSfx(SFX_LaserSuccess, 0.3), [playSfx]);
  const playLaserFail = useCallback(() => playSfx(SFX_LaserFail, 0.3), [playSfx]);
  const playBuySuccess = useCallback(() => playSfx(SFX_BuySuccess, 0.8), [playSfx]);
  const playCancel = useCallback(() => playSfx(SFX_Cancel, 0.8), [playSfx]);
  const playConfirm = useCallback(() => playSfx(SFX_Confirm, 0.8), [playSfx]);
  const playDenied = useCallback(() => playSfx(SFX_Denied, 0.8), [playSfx]);
  const playEquip = useCallback(() => playSfx(SFX_Equip, 0.8), [playSfx]);
  const playHeal = useCallback(() => playSfx(SFX_Heal, 0.7), [playSfx]);
  const playShield = useCallback(() => playSfx(SFX_Shield, 0.7), [playSfx]);
  const playSkip = useCallback(() => playSfx(SFX_Skip, 0.7), [playSfx]);
  const playHit = useCallback(() => playSfx(SFX_Hit, 0.8), [playSfx]);
  const playEnemyAttack = useCallback(() => playSfx(SFX_EnemyAttack, 0.8), [playSfx]);
  const playEnemyDead = useCallback(() => playSfx(SFX_EnemyDead, 0.8), [playSfx]);
  const playFlip = useCallback(() => playSfx(SFX_Flip, 0.3), [playSfx]);
  const playPotionClick = useCallback(() => playSfx(SFX_PotionClick, 0.3), [playSfx]);
  const playSummon = useCallback(() => playSfx(SFX_Summon, 0.5), [playSfx]);
  const playDoorOpen = useCallback(() => playSfx(SFX_DoorOpen, 0.3), [playSfx]);
  const playDungeonClick = useCallback(() => playSfx(SFX_DungeonClick, 0.3), [playSfx]);
  const playLevelClear = useCallback(() => playSfx(SFX_LevelClear, 0.5), [playSfx]);
  const playDungeonFailed = useCallback(() => playSfx(SFX_DungeonFailed, 0.5), [playSfx]);


  return (
    <MusicContext.Provider
      value={{
        musicOn,
        toggleMusic,
        setActivityMode,
        setIntroMode,
        setSrc: setMusicSource,

        // SFX functions
        playLaserSuccess,
        playLaserFail,
        playBuySuccess,
        playCancel,
        playConfirm,
        playDenied,
        playEquip,
        playHeal,
        playShield,
        playSkip,
        playHit,
        playEnemyAttack,
        playEnemyDead,
        playFlip,
        playPotionClick,
        playSummon,
        playDoorOpen,
        playDungeonClick,
        playLevelClear,
        playDungeonFailed,
      }}
    >
      {/* Dedicated BGM Audio Element */}
      <audio ref={audioRef} loop preload="auto" style={{ display: "none" }} />
      {children}
    </MusicContext.Provider>
  );
}