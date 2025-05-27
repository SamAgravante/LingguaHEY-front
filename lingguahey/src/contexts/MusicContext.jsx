import React, { createContext, useState, useRef, useEffect } from "react";
import defaultBgm from "../assets/music/LingguaHEY-Live.mp3";
import activityBgm from "../assets/music/LingguaHEY-Mini.mp3";
import introBgm from "../assets/music/LingguaHEY-Intro.mp3";
import lvlClearBgm from "../assets/music/LingguaHEY-LevelClear.mp3";

export const MusicContext = createContext({
  musicOn: false,
  toggleMusic: () => {},
  setActivityMode: () => {},
  setIntroMode: () => {},
  setLevelClearMode: () => {},
});

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [src, setSrc] = useState(introBgm);

  const setIntroMode = (isIntro) => {
    setSrc(isIntro ? introBgm : defaultBgm);
  };

  const setActivityMode = (isActivity) => {
    setSrc(isActivity ? activityBgm : defaultBgm);
  };

  const setLevelClearMode = (isLevelClear) => {
    setSrc(isLevelClear ? lvlClearBgm : defaultBgm);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = src;
    audioRef.current.volume = 0.3; // Set volume to 30% (you can adjust this value between 0 and 1)
    if (musicOn) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [src, musicOn]);

  const toggleMusic = () => setMusicOn((v) => !v);

  return (
    <MusicContext.Provider 
      value={{ 
        musicOn, 
        toggleMusic, 
        setActivityMode, 
        setIntroMode, 
        setLevelClearMode 
      }}
    >
      <audio ref={audioRef} loop preload="auto" style={{ display: "none" }} />
      {children}
    </MusicContext.Provider>
  );
}