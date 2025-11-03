import React from 'react';
import { useGame } from '../../contexts/GameContext';
import LoginForm from '../UI/LoginForm';
import CharacterCustomizer from '../UI/CharacterCustomizer';
import GameHUD from '../UI/GameHUD';
import PhaserGame from './PhaserGame';
import P5Background from './P5Background';
import SandwichMinigame from '../UI/SandwichMinigame';
import AchievementsModal from '../UI/AchievementsModal';
import EducationalGame from '../Minigames/EducationalGame/EducationalGame';
import QuizComponent from '../Minigames/QuizComponent/QuizComponent';
import LibraryInterface from '../UI/LibraryInterface';
import PlayerAvatar from '../Common/PlayerAvatar';

export default function GameWorld() {
  const { state } = useGame();
  const { step, currentLesson, currentQuiz, currentMap, color } = state;

  if (step === "login") {
    return <LoginForm />;
  }

  if (step === "customize") {
    return <CharacterCustomizer />;
  }

  // Determinar posición inicial del jugador según el mapa
  const getPlayerPosition = () => {
    if (currentMap === "kitchen") {
      return { left: 50, top: 300 };
    } else {
      return { left: 700, top: 300 }; // Biblioteca
    }
  };

  const playerPos = getPlayerPosition();

  return (
    <div style={{
      height: "100vh",
      background: currentMap === "kitchen" 
        ? "linear-gradient(to top, #87ceeb, #ffffff)" 
        : "#2c3e50", // Fondo oscuro para biblioteca
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 12,
    }}>
      <GameHUD />
      
      {/* ESCENARIO PRINCIPAL - SE CAMBIA COMPLETAMENTE SEGÚN EL MAPA */}
      <div id="phaser-wrapper" style={{
        position: "relative",
        margin: "12px auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        borderRadius: 12,
        overflow: "hidden",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div id="game-stage" style={{
          width: 800,
          height: 600,
          position: "relative",
        }}>
          {/* P5Background dibuja el escenario visual según currentMap */}
          <P5Background />
          
          {/* PhaserGame maneja las colisiones según currentMap */}
          <PhaserGame />
          
          {/* Jugador SVG - visible en ambos mapas */}
          {currentMap === "kitchen" && (
            <div
              id="svg-player"
              style={{
                position: "absolute",
                left: playerPos.left,
                top: playerPos.top,
                width: 64,
                height: 64,
                transform: "translate(-50%,-50%)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <PlayerAvatar color={color} size={64} />
            </div>
          )}
          
          {currentMap === "library" && (
            <>
              {/* Jugador en biblioteca */}
              <div
                id="svg-player"
                style={{
                  position: "absolute",
                  left: playerPos.left,
                  top: playerPos.top,
                  width: 64,
                  height: 64,
                  transform: "translate(-50%,-50%)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                <PlayerAvatar color={color} size={64} />
              </div>
              
              {/* Interfaz de biblioteca - SOLO en el mapa de biblioteca */}
              <LibraryInterface />
            </>
          )}
        </div>
      </div>

      {/* ELEMENTOS QUE SE MUESTRAN EN AMBOS MAPAS */}
      <SandwichMinigame />
      <AchievementsModal />
      
      {currentLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <EducationalGame />
        </div>
      )}
      
      {currentQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <QuizComponent />
        </div>
      )}
    </div>
  );
}