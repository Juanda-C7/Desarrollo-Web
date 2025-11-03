import React from 'react';
import { useGame } from '../../contexts/GameContext';

export default function GameHUD() {
  const { state, dispatch } = useGame();
  const { username, currentMap, money, educationalPoints, showPressAHint, showPressEHint, sandwichDone, showSandwichMessage, trofeos } = state;

  return (
    <>
      <h2 style={{ textAlign: "center" }}>
        Hola {username}! {currentMap === "kitchen" ? "Cocina" : "Biblioteca"} - Muévete con las flechas.
      </h2>

      {/* Panel de información */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#333",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        💰 {money}
      </div>

      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "#2c3e50",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        🧠 {educationalPoints}
      </div>

      {/* Botón de Logros */}
      <button 
        onClick={() => dispatch({ type: 'SHOW_ACHIEVEMENTS', payload: true })}
        style={{
          position: 'absolute',
          top: 70,
          right: 20,
          background: '#ff6b35',
          color: '#fff',
          padding: '10px 15px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: 16,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        🏆 Trofeos ({trofeos.total})
      </button>

      {/* Hints */}
      {showPressAHint && !state.showSandwichMinigame && !sandwichDone && currentMap === "kitchen" && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          Presiona <b>A</b> para hacer sandwich
        </div>
      )}

      {showPressEHint && currentMap === "kitchen" && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16a085",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          Presiona <b>E</b> para entrar a la biblioteca
        </div>
      )}

      {/* Mensaje de sandwich completado */}
      {showSandwichMessage && currentMap === "kitchen" && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "green",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 100
          }}
        >
          <span>✅ ¡Sandwich completado! +5 monedas</span>
          <button 
            onClick={() => dispatch({ type: 'SHOW_SANDWICH_MESSAGE', payload: false })}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}