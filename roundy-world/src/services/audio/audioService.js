// Servicio para AudioStack API con fallback a Web Audio API
const BASE_URL = "https://api.audiostack.ai/v1/play/soundfx";
const AUDIOSTACK_API_KEY = "api_key_de_audiostack";

class AudioService {
  constructor() {
    this.useFallback = false;
    this.audioContext = null;
    this.init();
  }

  async init() {
    try {
      const testResponse = await fetch(BASE_URL, {
        method: 'OPTIONS'
      });
      if (!testResponse.ok) {
        this.useFallback = true;
        console.log('🎵 Usando Web Audio API como fallback');
      }
    } catch (error) {
      this.useFallback = true;
      console.log('🎵 Usando Web Audio API como fallback');
    }
  }

  async playSoundEffect(effectPrompt) {
    if (this.useFallback) {
      return this.playFallbackSound(effectPrompt);
    }

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": AUDIOSTACK_API_KEY,
        },
        body: JSON.stringify({
          prompt: effectPrompt,
          duration: 2,
          format: "mp3",
        }),
      });

      if (!response.ok) {
        throw new Error(`AudioStack API error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();

      return { success: true };
    } catch (err) {
      console.error("❌ Error con AudioStack, usando fallback:", err);
      this.useFallback = true;
      return this.playFallbackSound(effectPrompt);
    }
  }

  // Sistema de fallback con Web Audio API
  playFallbackSound(effectPrompt) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Diferentes sonidos según el tipo de efecto
      if (effectPrompt.includes('coin')) {
        oscillator.frequency.value = 800;
        oscillator.type = 'triangle';
      } else if (effectPrompt.includes('success') || effectPrompt.includes('correct')) {
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
      } else if (effectPrompt.includes('error') || effectPrompt.includes('wrong')) {
        oscillator.frequency.value = 220; // A3
        oscillator.type = 'square';
      } else if (effectPrompt.includes('door')) {
        oscillator.frequency.value = 400;
        oscillator.type = 'sawtooth';
      } else {
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
      }

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

      return { success: true };
    } catch (error) {
      console.error('Error con fallback de audio:', error);
      return { success: false, error: error.message };
    }
  }

  // Efectos específicos del juego
  async playCoinSound() {
    return this.playSoundEffect("coin sound");
  }

  async playSuccessSound() {
    return this.playSoundEffect("success sound");
  }

  async playErrorSound() {
    return this.playSoundEffect("error sound");
  }

  async playQuizCorrect() {
    return this.playSoundEffect("correct answer sound");
  }

  async playQuizWrong() {
    return this.playSoundEffect("wrong answer sound");
  }

  async playLevelUp() {
    return this.playSoundEffect("level up sound");
  }

  async playDoorOpen() {
    return this.playSoundEffect("door open sound");
  }
}

// Exportar instancia única
export const audioService = new AudioService();