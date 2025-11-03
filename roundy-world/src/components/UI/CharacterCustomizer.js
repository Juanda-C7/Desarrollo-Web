import React from 'react';
import { useGame } from '../../contexts/GameContext';
import PlayerAvatar from '../Common/PlayerAvatar';

export default function CharacterCustomizer() {
  const { state, dispatch } = useGame();
  const { color } = state;

  const colors = {
    amarillo: 0xffff00,
    rosa: 0xff69b4,
    rojo: 0xff0000,
    naranja: 0xffa500,
    celeste: 0x00ffff,
    verde: 0x00ff00,
  };

  const numToCssHex = (num) => "#" + num.toString(16).padStart(6, "0");

  return (
    <div
      style={{
        textAlign: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #f8b500, #fceabb)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Personaliza tu Roundy</h1>
      
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          marginBottom: 20,
        }}
      >
        <PlayerAvatar color={color} size={120} />
      </div>
      
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Object.entries(colors).map(([name, hex]) => (
          <div
            key={name}
            onClick={() => dispatch({ type: 'SET_COLOR', payload: hex })}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: numToCssHex(hex),
              border: color === hex ? "3px solid #000" : "2px solid #555",
              cursor: "pointer",
            }}
            title={name}
          />
        ))}
      </div>
      
      <button
        onClick={() => dispatch({ type: 'SET_STEP', payload: "world" })}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 8,
          backgroundColor: "#333",
          color: "#fff",
        }}
      >
        Continuar al Roundy World
      </button>
    </div>
  );
}