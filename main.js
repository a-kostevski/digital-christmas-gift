class SoundFX {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.backgroundMusic = null;
    this.isPlaying = false;
  }

  createBackgroundMusic() {
    if (this.isPlaying) return;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Set very low volume for background music
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Create a simple repeating pattern
    const notes = [
      440, // A4
      493.88, // B4
      523.25, // C5
      587.33  // D5
    ];

    let noteIndex = 0;
    const intervalTime = 0.2; // Time between notes

    // Schedule the notes
    const scheduleNotes = () => {
      const currentTime = this.audioContext.currentTime;
      oscillator1.frequency.setValueAtTime(notes[noteIndex], currentTime);
      oscillator2.frequency.setValueAtTime(notes[(noteIndex + 2) % notes.length], currentTime);
      noteIndex = (noteIndex + 1) % notes.length;
    };

    oscillator1.type = 'sine';
    oscillator2.type = 'triangle';
    
    oscillator1.start();
    oscillator2.start();

    // Create repeating pattern
    this.backgroundMusic = setInterval(scheduleNotes, intervalTime * 1000);
    this.isPlaying = true;

    // Store references for stopping
    this.oscillators = [oscillator1, oscillator2];
    this.gainNode = gainNode;
  }

  stopBackgroundMusic() {
    if (!this.isPlaying) return;

    clearInterval(this.backgroundMusic);
    this.oscillators.forEach(osc => osc.stop());
    this.isPlaying = false;
  }

  createSelectSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1109, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  createChooseSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(587.33, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1174.66, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}
 document.addEventListener('DOMContentLoaded', () => {
      const fighters = document.querySelectorAll('.fighter-container');
  const soundFX = new SoundFX();

      let currentSelection = null;

  // Add sound toggle functionality
  const toggleButton = document.getElementById('toggleSound');
  let isMuted = true;

  toggleButton.addEventListener('click', () => {
    if (isMuted) {
      soundFX.createBackgroundMusic();
      toggleButton.textContent = '🔊 Mute Music';
      toggleButton.classList.remove('muted');
    } else {
      soundFX.stopBackgroundMusic();
      toggleButton.textContent = '🔈 Play Music';
      toggleButton.classList.add('muted');
    }
    isMuted = !isMuted;
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          navigateFighters(e.key === 'ArrowRight');
        }
        if (e.key === 'Enter' && currentSelection) {
          selectFighter(currentSelection.dataset.fighter);
        }
      });

      fighters.forEach(fighter => {
        fighter.addEventListener('mouseenter', () => {
          if (currentSelection !== fighter) {
            selectSound.currentTime = 0;
            selectSound.play().catch(() => {});
          }
          fighter.classList.add('active');
          currentSelection = fighter;
        });
        
        fighter.addEventListener('mouseleave', () => {
          fighter.classList.remove('active');
        });
      });

      function navigateFighters(next) {
        const fightersArray = Array.from(fighters);
        const currentIndex = currentSelection ? fightersArray.indexOf(currentSelection) : -1;
        let newIndex = next ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= fightersArray.length) newIndex = 0;
        if (newIndex < 0) newIndex = fightersArray.length - 1;

        currentSelection?.classList.remove('active');
        currentSelection = fightersArray[newIndex];
        currentSelection.classList.add('active');
    soundFX.createSelectSound();

      }
    });

    function selectFighter(fighterName) {
  const soundFX = new SoundFX();
  soundFX.createChooseSound();
      
      document.querySelector(`[data-fighter="${fighterName}"]`)
        .classList.add('selected');
        
      setTimeout(() => {
        alert(`You have chosen ${fighterName}! Get ready for the Muddy Paws Obstacle Course!`);
      }, 500);
    }

