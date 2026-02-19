//  Keys for local storage identifiers
export const STORAGE_KEY_SFX = 'tetris_sfx_enabled';
export const STORAGE_KEY_MUSIC = 'tetris_music_enabled';

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

// Audio settings state
let sfxEnabled = true;
let musicEnabled = true;

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
  if (!sfxEnabled) {
    return;
  }

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
  if (!musicEnabled) {
    return;
  }

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

// --------------------------------------------------
// Local Storage - Audio Settings
// --------------------------------------------------

export function saveSfxEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_SFX, JSON.stringify(enabled));
  } catch (e) {
    console.warn('Failed to save SFX setting to localStorage:', e);
  }
}

export function loadSfxEnabled() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SFX);
    return saved !== null ? JSON.parse(saved) : true; // default to true
  } catch (e) {
    console.warn('Failed to load SFX setting from localStorage:', e);
    return true;
  }
}

export function saveMusicEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_MUSIC, JSON.stringify(enabled));
  } catch (e) {
    console.warn('Failed to save music setting to localStorage:', e);
  }
}

export function loadMusicEnabled() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MUSIC);
    return saved !== null ? JSON.parse(saved) : true; // default to true
  } catch (e) {
    console.warn('Failed to load music setting from localStorage:', e);
    return true;
  }
}

export function setSfxEnabled(enabled) {
  sfxEnabled = enabled;
}

export function setMusicEnabled(enabled) {
  musicEnabled = enabled;

  // If music is disabled while playing, stop it
  if (!enabled) {
    Object.keys(sndNameToAudioObject).forEach((key) => {
      if (key.startsWith('mus')) {
        stopMusic(key);
      }
    });
  }
}

export function isSfxEnabled() {
  return sfxEnabled;
}

export function isMusicEnabled() {
  return musicEnabled;
}
