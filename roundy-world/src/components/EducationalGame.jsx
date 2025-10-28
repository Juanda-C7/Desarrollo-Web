//En esta carpeta se hicieron los cambios del entregable_9

import React, { useState } from 'react';
import { huggingService } from '../services/huggingService';
import { audioService } from '../services/audioService';

const EducationalGame = ({ onComplete, cost = 5 }) => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const programmingChallenges = [
    {
      id: 'suma',
      title: "Función Suma",
      description: "Escribe una función que sume dos números",
      example: "function sumar(a, b) {\n  return a + b;\n}",
      hints: [
        "Usa la palabra clave 'function'",
        "Define dos parámetros (a y b)",
        "Retorna la suma usando el operador +"
      ]
    },
    {
      id: 'bucle',
      title: "Bucle For",
      description: "Crea un bucle que imprima números del 1 al 5",
      example: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
      hints: [
        "Usa 'for' con let i = 1",
        "La condición debe ser i <= 5",
        "Incrementa i con i++",
        "Usa console.log(i) dentro del bucle"
      ]
    },
    {
      id: 'condicional',
      title: "Condicional If",
      description: "Escribe una función que verifique si un número es par",
      example: "function esPar(num) {\n  if (num % 2 === 0) {\n    return true;\n  } else {\n    return false;\n  }\n}",
      hints: [
        "Usa el operador módulo %",
        "Comprueba si num % 2 === 0",
        "Retorna true si es par, false si no"
      ]
    }
  ];

  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setFeedback('');
    setAnalysisResult(null);

    try {
      const challenge = programmingChallenges[currentChallenge];
      
      // Usar el servicio de Hugging Face
      const result = await huggingService.analyzeCode(
        code, 
        challenge.description,
        challenge.example
      );

      setFeedback(result.feedback);
      
      // Evaluar si el código es correcto
      const isCorrect = huggingService.evaluateCodeCorrectness(code, challenge.id);
      setAnalysisResult(isCorrect ? 'correct' : 'needs_improvement');
      
      // Reproducir sonido según el resultado
      if (isCorrect) {
        await audioService.playSuccessSound();
        setTimeout(() => onComplete(10), 2000);
      } else {
        await audioService.playErrorSound();
      }
      
    } catch (error) {
      console.error('Error in analyzeCode:', error);
      setFeedback('Error de conexión. Intenta nuevamente.');
      await audioService.playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const nextChallenge = () => {
    setCurrentChallenge((prev) => (prev + 1) % programmingChallenges.length);
    setCode('');
    setFeedback('');
    setAnalysisResult(null);
    setShowHints(false);
  };

  return (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      width: '550px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '3px solid #3498db'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', textAlign: 'center' }}>
        🧠 Minijuego Educativo - Costo: {cost} monedas
      </h3>
      
      <div style={{ marginBottom: '15px', padding: '15px', background: '#ecf0f1', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          {programmingChallenges[currentChallenge].title}
        </h4>
        <p style={{ margin: '0 0 10px 0', lineHeight: '1.4' }}>
          {programmingChallenges[currentChallenge].description}
        </p>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => setShowHints(!showHints)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showHints ? 'Ocultar' : 'Mostrar'} Pistas
          </button>
          
          {showHints && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#fff9e6', borderRadius: '5px' }}>
              <strong>💡 Pistas:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {programmingChallenges[currentChallenge].hints.map((hint, index) => (
                  <li key={index} style={{ fontSize: '12px', marginBottom: '3px' }}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <details style={{ fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', color: '#3498db' }}>
            Ver ejemplo de solución
          </summary>
          <pre style={{ 
            background: '#34495e', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px', 
            fontSize: '11px',
            marginTop: '8px',
            overflowX: 'auto'
          }}>
            {programmingChallenges[currentChallenge].example}
          </pre>
        </details>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Escribe tu código aquí..."
        style={{ 
          width: '100%', 
          height: '120px', 
          margin: '10px 0', 
          padding: '10px',
          borderRadius: '5px',
          border: '2px solid #bdc3c7',
          fontFamily: 'monospace',
          fontSize: '14px',
          resize: 'vertical'
        }}
      />
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={analyzeCode} 
          disabled={loading || !code.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#95a5a6' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            minWidth: '140px'
          }}
        >
          {loading ? '🔄 Analizando...' : '📤 Enviar a IA'}
        </button>
        
        <button 
          onClick={nextChallenge}
          style={{
            padding: '10px 15px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Nuevo Reto
        </button>
      </div>
      
      {feedback && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          background: analysisResult === 'correct' ? '#d5edda' : '#fff3cd',
          borderRadius: '8px',
          border: `2px solid ${analysisResult === 'correct' ? '#28a745' : '#ffc107'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <strong>🤖 Feedback IA:</strong>
            {analysisResult === 'correct' && (
              <span style={{ 
                marginLeft: '10px', 
                padding: '2px 8px', 
                background: '#28a745', 
                color: 'white', 
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                ✅ Correcto
              </span>
            )}
          </div>
          <div style={{ lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
            {feedback}
          </div>
          {analysisResult === 'correct' && (
            <div style={{ 
              marginTop: '10px', 
              padding: '8px', 
              background: '#28a745', 
              color: 'white',
              borderRadius: '5px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              🎉 ¡Ganaste 10 puntos educativos!
            </div>
          )}
        </div>
      )}
      
      <button 
        onClick={() => onComplete(0)}
        style={{
          marginTop: '15px',
          padding: '8px 15px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Salir del Minijuego
      </button>
    </div>
  );
};

export default EducationalGame;