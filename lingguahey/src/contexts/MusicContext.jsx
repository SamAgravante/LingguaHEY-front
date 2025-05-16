import React, { createContext, useState, useRef, useEffect } from "react";
import defaultBgm from "../assets/music/LingguaHEY-Live.mp3";
import activityBgm from "../assets/music/LingguaHEY-Mini.mp3";
import introBgm from "../assets/music/LingguaHEY-Intro.mp3"; // <-- Add this

export const MusicContext = createContext({
  musicOn: false,
  toggleMusic: () => {},
  setActivityMode: () => {},
  setIntroMode: () => {}, // <-- Add this
});

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [src, setSrc] = useState(introBgm); // <-- Start with intro music

  // Add intro mode
  const setIntroMode = (isIntro) => {
    setSrc(isIntro ? introBgm : defaultBgm);
  };

  const setActivityMode = (isActivity) => {
    setSrc(isActivity ? activityBgm : defaultBgm);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = src;
    if (musicOn) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [src, musicOn]);

  const toggleMusic = () => setMusicOn((v) => !v);

  return (
    <MusicContext.Provider value={{ musicOn, toggleMusic, setActivityMode, setIntroMode }}>
      <audio ref={audioRef} loop preload="auto" style={{ display: "none" }} />
      {children}
    </MusicContext.Provider>
  );
}