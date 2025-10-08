import React from 'react';
import { audioService } from '../services/audioService';

const SoundButton = ({ 
  children, 
  soundType = 'success', 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const handleClick = async (e) => {
    if (disabled) return;
    
    // Reproducir sonido según el tipo
    switch(soundType) {
      case 'coin':
        await audioService.playCoinSound();
        break;
      case 'success':
        await audioService.playSuccessSound();
        break;
      case 'error':
        await audioService.playErrorSound();
        break;
      case 'quiz-correct':
        await audioService.playQuizCorrect();
        break;
      case 'quiz-wrong':
        await audioService.playQuizWrong();
        break;
      case 'level-up':
        await audioService.playLevelUp();
        break;
      case 'door':
        await audioService.playDoorOpen();
        break;
      default:
        await audioService.playSuccessSound();
    }
    
    // Ejecutar el onClick original si existe
    if (onClick) onClick(e);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={disabled}
      className={`sound-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SoundButton;