// src/hooks/useBackgroundMusic.jsx
import { useEffect } from 'react';
import { Howl } from 'howler';
import bgMusicMp3 from '../assets/background.mp3';

export default function useBackgroundMusic(enabled = true) {
  useEffect(() => {
    const sound = new Howl({
      src: [bgMusicMp3],
      loop: true,
      volume: 0.5,    // initial volume (0.0 to 1.0)
      html5: true,    // ensure use of HTML5 Audio for large files
    });

    if (enabled) sound.play();

    return () => {
      sound.stop();
      sound.unload();
    };
  }, [enabled]);
}
