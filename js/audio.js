const sndNameToAudioObject = {
  // Sound effects
  sndMove: new Audio('audio/move.mp3'),
  sndRotate: new Audio('audio/rotate.mp3'),
  sndLockPiece: new Audio('audio/lockpiece.mp3'),
  sndLineClear: new Audio('audio/lineclear.mp3'),
  sndLineClear4: new Audio('audio/lineclear4.mp3'),
  sndLevelUp: new Audio('audio/levelup.mp3'),
  sndGameOver: new Audio('audio/gameover.mp3'),

  // Background music
  musGameplay: new Audio('audio/gameplay.mp3'),
};

// Volume presets for different sound types
const volumeLevels = {
  sndMove: 0.1,
  sndRotate: 0.3,
  sndLockPiece: 0.5,
  sndLineClear: 0.6,
  sndLineClear4: 0.8,
  sndLevelUp: 0.7,
  sndGameOver: 0.8,
  musGameplay: 0.3,
};

export function initAudio() {
  Object.entries(sndNameToAudioObject).forEach(([name, audioObj]) => {
    audioObj.preload = 'auto';
    audioObj.volume = volumeLevels[name] || 0.5;

    // Loop background music
    if (name.startsWith('mus')) {
      audioObj.loop = true;
    }
  });
}

export function playAudio(sndName) {
  if (sndNameToAudioObject[sndName]) {
    const sndInstance = sndNameToAudioObject[sndName].cloneNode();
    sndInstance.volume = volumeLevels[sndName] || 0.5;
    sndInstance.play().catch((err) => {
      // Handle autoplay restrictions
      console.warn('Audio play failed:', err);
    });
  }
}

export function playMusic(musName) {
  if (sndNameToAudioObject[musName]) {
    const music = sndNameToAudioObject[musName];
    music.currentTime = 0; // Restart from beginning
    music.play().catch((err) => {
      console.warn('Music play failed:', err);
    });
  }
}

export function stopMusic(musName) {
  if (sndNameToAudioObject[musName]) {
    const music = sndNameToAudioObject[musName];
    music.pause();
    music.currentTime = 0;
  }
}

export function setMasterVolume(volume) {
  Object.keys(sndNameToAudioObject).forEach((name) => {
    sndNameToAudioObject[name].volume = volumeLevels[name] * volume;
  });
}
