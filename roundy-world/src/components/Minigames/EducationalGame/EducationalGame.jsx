import React, { useState, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { audioService } from '../../../services/audio/audioService';
import { achievementsService } from '../../../services/api/achievementsService';

const EducationalGame = () => {
  const { state, dispatch } = useGame();
  const { username, logros } = state;
  
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const programmingChallenges = [
    {
      id: 'suma',
      title: "Función Suma",
      description: "Escribe una función que reciba dos números y retorne su suma",
      example: "function sumar(a, b) {\n  return a + b;\n}",
      functionName: "sumar",
      tests: [
        { input: [2, 3], expected: 5 },
        { input: [0, 0], expected: 0 },
        { input: [-1, 1], expected: 0 },
        { input: [10, -5], expected: 5 }
      ],
      hints: [
        "Usa la palabra clave 'function'",
        "Define dos parámetros (a y b)",
        "Retorna la suma usando el operador +"
      ]
    },
    {
      id: 'factorial',
      title: "Función Factorial",
      description: "Escribe una función que calcule el factorial de un número",
      example: "function factorial(n) {\n  if (n === 0 || n === 1) return 1;\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}",
      functionName: "factorial",
      tests: [
        { input: [0], expected: 1 },
        { input: [1], expected: 1 },
        { input: [5], expected: 120 },
        { input: [3], expected: 6 }
      ],
      hints: [
        "El factorial de 0 y 1 es 1",
        "Usa un bucle for para multiplicar los números",
        "Puedes usar recursión o iteración"
      ]
    }
  ];

  const evaluateCode = async () => {
    if (!code.trim()) {
      setFeedback("❌ Por favor escribe algún código antes de evaluar");
      return;
    }

    setLoading(true);
    setFeedback('');
    setTestResults([]);

    try {
      const challenge = programmingChallenges[currentChallenge];
      let testResults = [];
      let passedTests = 0;

      try {
        const userFunction = new Function(
          'return ' + code.replace(/^function\s+\w+/, 'function')
        )();

        challenge.tests.forEach((test, index) => {
          try {
            const result = userFunction(...test.input);
            const isPassed = JSON.stringify(result) === JSON.stringify(test.expected);
            
            testResults.push({
              test: index + 1,
              input: test.input,
              expected: test.expected,
              result: result,
              passed: isPassed
            });

            if (isPassed) passedTests++;
          } catch (error) {
            testResults.push({
              test: index + 1,
              input: test.input,
              expected: test.expected,
              result: `Error: ${error.message}`,
              passed: false
            });
          }
        });

        setTestResults(testResults);

        const score = Math.round((passedTests / challenge.tests.length) * 100);
        const allPassed = passedTests === challenge.tests.length;

        if (allPassed) {
          setFeedback(`🎉 ¡Excelente! Pasaste todos los tests (${score}%)\n\n✅ Tu código funciona correctamente para todos los casos.`);
          await audioService.playSuccessSound();
          
          const points = challenge.id === 'factorial' ? 15 : 10;
          handleLessonComplete(points);
          await checkEducationAchievements();
        } else {
          setFeedback(`⚠️ Pasaste ${passedTests} de ${challenge.tests.length} tests (${score}%)\n\nRevisa los casos que fallaron e intenta nuevamente.`);
          await audioService.playErrorSound();
        }

      } catch (error) {
        setFeedback(`❌ Error en tu código:\n${error.message}\n\nRevisa la sintaxis y asegúrate de que la función se llame "${challenge.functionName}".`);
        await audioService.playErrorSound();
      }

    } catch (error) {
      console.error('Error evaluating code:', error);
      setFeedback('❌ Error al evaluar el código. Verifica la sintaxis.');
      await audioService.playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = (points) => {
    setTimeout(() => {
      dispatch({ type: 'SET_EDUCATIONAL_POINTS', payload: state.educationalPoints + points });
      dispatch({ type: 'SET_CURRENT_LESSON', payload: null });
    }, 1500);
  };

  const checkEducationAchievements = async () => {
    try {
      const resultadoMision = await achievementsService.updateMisionProgreso(username, 2, 1);
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      const logroEducacion = logros.find(l => l.nombre.includes("Estudiante"));
      if (logroEducacion && !logroEducacion.completado) {
        const logroCompletado = await achievementsService.completarLogro(username, logroEducacion.id);
        if (logroCompletado) {
          audioService.playSuccessSound();
        }
      }
    } catch (error) {
      console.error("Error actualizando logros educativos:", error);
    }
  };

  const nextChallenge = () => {
    setCurrentChallenge((prev) => (prev + 1) % programmingChallenges.length);
    setCode('');
    setFeedback('');
    setTestResults([]);
    setShowHints(false);
  };

  const resetChallenge = () => {
    setCode(programmingChallenges[currentChallenge].example);
  };

  return (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '3px solid #3498db'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', textAlign: 'center' }}>
        🧠 Desafío de Programación - Costo: 5 monedas
      </h3>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        padding: '10px',
        background: '#ecf0f1',
        borderRadius: '8px'
      }}>
        <div>
          <strong>Desafío {currentChallenge + 1} de {programmingChallenges.length}</strong>
        </div>
        <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
          Dificultad: {currentChallenge === 0 ? '⭐' : '⭐⭐'}
        </div>
      </div>
      
      <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
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
              padding: '8px 15px',
              backgroundColor: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            {showHints ? '🙈 Ocultar Pistas' : '💡 Mostrar Pistas'}
          </button>
          
          <button 
            onClick={resetChallenge}
            style={{
              padding: '8px 15px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Cargar Ejemplo
          </button>
        </div>
        
        {showHints && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#fff9e6', borderRadius: '5px' }}>
            <strong>💡 Pistas:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {programmingChallenges[currentChallenge].hints.map((hint, index) => (
                <li key={index} style={{ fontSize: '14px', marginBottom: '5px' }}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Tu código JavaScript:
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`Escribe tu función ${programmingChallenges[currentChallenge].functionName} aquí...`}
          style={{ 
            width: '100%', 
            height: '150px', 
            margin: '10px 0', 
            padding: '12px',
            borderRadius: '5px',
            border: '2px solid #bdc3c7',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical',
            lineHeight: '1.4'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
        <button 
          onClick={evaluateCode} 
          disabled={loading || !code.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#95a5a6' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            minWidth: '160px',
            fontSize: '16px'
          }}
        >
          {loading ? '🔍 Ejecutando Tests...' : '🚀 Ejecutar Tests'}
        </button>
        
        <button 
          onClick={nextChallenge}
          style={{
            padding: '12px 20px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Siguiente Desafío
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ margin: '0 0 10px 0' }}>📊 Resultados de Tests:</h5>
          {testResults.map((test, index) => (
            <div 
              key={index}
              style={{
                padding: '8px 12px',
                margin: '5px 0',
                background: test.passed ? '#d5edda' : '#f8d7da',
                border: `2px solid ${test.passed ? '#28a745' : '#dc3545'}`,
                borderRadius: '5px',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>Test {test.test}:</strong> {test.passed ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                  Input: {JSON.stringify(test.input)}
                </span>
              </div>
              {!test.passed && (
                <div style={{ marginTop: '5px', fontSize: '12px' }}>
                  <div>Esperado: {JSON.stringify(test.expected)}</div>
                  <div>Obtenido: {JSON.stringify(test.result)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {feedback && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          background: feedback.includes('🎉') ? '#d5edda' : '#fff3cd',
          borderRadius: '8px',
          border: `2px solid ${feedback.includes('🎉') ? '#28a745' : '#ffc107'}`,
          whiteSpace: 'pre-line'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {feedback.includes('🎉') ? '✅ ¡Éxito!' : '📝 Feedback:'}
          </div>
          {feedback}
        </div>
      )}
      
      <button 
        onClick={() => dispatch({ type: 'SET_CURRENT_LESSON', payload: null })}
        style={{
          marginTop: '15px',
          padding: '10px 15px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%',
          fontSize: '16px'
        }}
      >
        🚪 Salir del Minijuego
      </button>
    </div>
  );
};

export default EducationalGame;