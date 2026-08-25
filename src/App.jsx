import React, { useEffect, useState } from 'react'
import Display from './Display'
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {
  initAlertSound,
  isAlertSoundUnlocked,
  unlockAlertSound,
} from './lib/alertSound';

function App() {
  const [, setSoundReady] = useState(isAlertSoundUnlocked());

  useEffect(() => {
    initAlertSound();

    const unlock = () => {
      unlockAlertSound().finally(() => {
        setSoundReady(isAlertSoundUnlocked());
      });
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <>
     <Display />
    </>
  )
}

export default App
