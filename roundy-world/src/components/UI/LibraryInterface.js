import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { audioService } from '../../services/audio/audioService';

export default function LibraryInterface() {
  const { state, dispatch } = useGame();
  const { money, educationalPoints } = state;

  const handleProgrammingLesson = () => {
    if (money >= 5) {
      dispatch({ type: 'SET_MONEY', payload: money - 5 });
      dispatch({ type: 'SET_CURRENT_LESSON', payload: 'programming' });
      audioService.playCoinSound();
    }
  };

  const handleQuiz = () => {
    if (educationalPoints >= 10) {
      dispatch({ type: 'SET_CURRENT_QUIZ', payload: 'computer_science' });
    }
  };

  const exitLibrary = () => {
    dispatch({ type: 'SET_CURRENT_MAP', payload: 'kitchen' });
    audioService.playSuccessSound();
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(255,255,255,0.95)',
      padding: '25px',
      borderRadius: '15px',
      zIndex: 100,
      width: '450px',
      textAlign: 'center',
      border: '3px solid #2c3e50',
      boxShadow: '0 15px 35px rgba(0,0,0,0.4)'
    }}>
      <h2 style={{ marginTop: 0, color: '#2c3e50', marginBottom: '10px' }}>
        📚 Biblioteca Educativa
      </h2>
      <p style={{ color: '#7f8c8d', marginBottom: '25px', fontSize: '14px' }}>
        Bienvenido a la biblioteca. Mejora tus conocimientos con estos minijuegos.
      </p>
      
      <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', marginBottom: '25px' }}>
        <button 
          onClick={handleProgrammingLesson}
          disabled={money < 5}
          style={{
            padding: '15px',
            borderRadius: '10px',
            backgroundColor: money >= 5 ? '#3498db' : '#95a5a6',
            color: 'white',
            border: 'none',
            cursor: money >= 5 ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (money >= 5) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(52, 152, 219, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (money >= 5) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          🧠 Minijuego de Programación
          <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '5px' }}>
            Costo: 5 monedas
          </div>
        </button>
        
        <button 
          onClick={handleQuiz}
          disabled={educationalPoints < 10}
          style={{
            padding: '15px',
            borderRadius: '10px',
            backgroundColor: educationalPoints >= 10 ? '#9b59b6' : '#95a5a6',
            color: 'white',
            border: 'none',
            cursor: educationalPoints >= 10 ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (educationalPoints >= 10) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(155, 89, 182, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (educationalPoints >= 10) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          📝 Quiz de Ciencias de la Computación
          <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '5px' }}>
            Requiere: 10 puntos educativos
          </div>
        </button>
        
        <button onClick={exitLibrary} style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginTop: '10px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}>
          🚪 Volver a la Cocina
        </button>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#ecf0f1', 
        borderRadius: '10px',
        border: '2px solid #bdc3c7'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
          <span><strong>💰 Monedas:</strong> {money}</span>
          <span><strong>🧠 Puntos:</strong> {educationalPoints}</span>
        </div>
        <div style={{ fontSize: '14px', color: '#7f8c8d', fontStyle: 'italic' }}>
          {educationalPoints < 10 && `Necesitas ${10 - educationalPoints} puntos más para el quiz`}
          {educationalPoints >= 10 && '¡Puedes tomar el quiz!'}
        </div>
      </div>
    </div>
  );
}