import React from 'react';
import { GameProvider } from './contexts/GameContext';
import MainGame from './components/GameWorld/GameWorld';

export default function App() {
  return (
    <GameProvider>
      <MainGame />
    </GameProvider>
  );
}