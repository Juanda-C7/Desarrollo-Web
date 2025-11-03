import React from 'react';
import { useGame } from '../../contexts/GameContext';

export default function AchievementsModal() {
  const { state, dispatch } = useGame();
  const { showAchievements, logros, misiones, trofeos } = state;

  if (!showAchievements) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(255,255,255,0.95)',
      padding: '20px',
      borderRadius: '10px',
      zIndex: 1000,
      width: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <h2>🏆 Logros y Misiones</h2>
      
      <div style={{
        background: '#e3f2fd',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <strong>Colección de Trofeos: </strong>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '5px' }}>
          <span>🥉 {trofeos.bronce}</span>
          <span>🥈 {trofeos.plata}</span>
          <span>🥇 {trofeos.oro}</span>
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>Total: {trofeos.total} trofeos</strong>
        </div>
      </div>
      
      <h3>📋 Misiones Activas</h3>
      {misiones.length > 0 ? (
        misiones.map(mision => (
          <div key={mision.id} style={{
            background: '#f8f9fa',
            padding: '10px',
            margin: '5px 0',
            borderRadius: '5px',
            border: '1px solid #dee2e6'
          }}>
            <strong>{mision.nombre}</strong>
            <p style={{margin: '5px 0', color: '#666'}}>{mision.descripcion}</p>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
              <span>Recompensa: {mision.recompensa}</span>
            </div>
          </div>
        ))
      ) : (
        <p style={{textAlign: 'center', color: '#666', fontStyle: 'italic'}}>¡Todas las misiones completadas! 🎉</p>
      )}
      
      <h3>🎖️ Tus Logros</h3>
      {logros.length > 0 ? (
        logros.map(logro => (
          <div key={logro.id} style={{
            background: logro.completado ? '#d4edda' : '#f8f9fa',
            padding: '10px',
            margin: '5px 0',
            borderRadius: '5px',
            border: `2px solid ${logro.completado ? '#28a745' : '#dee2e6'}`,
            opacity: logro.completado ? 1 : 0.7
          }}>
            <strong>{logro.icono} {logro.nombre}</strong>
            <p style={{margin: '5px 0', color: '#666'}}>{logro.descripcion}</p>
            {logro.completado ? (
              <span style={{color: 'green', fontWeight: 'bold'}}>
                ✅ Completado {logro.recompensa}
              </span>
            ) : (
              <span style={{color: 'gray'}}>🔒 Por completar</span>
            )}
          </div>
        ))
      ) : (
        <p style={{textAlign: 'center', color: '#666', fontStyle: 'italic'}}>No hay logros disponibles</p>
      )}
      
      <button 
        onClick={() => dispatch({ type: 'SHOW_ACHIEVEMENTS', payload: false })}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Cerrar
      </button>
    </div>
  );
}