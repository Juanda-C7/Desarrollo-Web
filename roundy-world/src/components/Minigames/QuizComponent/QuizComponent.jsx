import React, { useState, useEffect } from 'react';
import { useGame } from '../../../contexts/GameContext';
import { audioService } from '../../../services/audio/audioService';
import { achievementsService } from '../../../services/api/achievementsService';

const QuizComponent = () => {
  const { state, dispatch } = useGame();
  const { topic, username, logros } = state;
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questionDatabase = {
    programming: [
      {
        question: "¿Qué método de array crea un nuevo array transformando cada elemento?",
        options: ["map()", "filter()", "forEach()", "reduce()"],
        correct: 0,
        explanation: "map() crea un nuevo array aplicando una función a cada elemento del array original."
      },
      {
        question: "¿Qué significa HTML?",
        options: [
          "HyperText Markup Language",
          "HighTech Modern Language", 
          "HyperTransfer Markup Language",
          "Home Tool Markup Language"
        ],
        correct: 0,
        explanation: "HTML significa HyperText Markup Language, el lenguaje estándar para crear páginas web."
      }
    ]
  };

  useEffect(() => {
    loadQuestions();
  }, [topic]);

  const loadQuestions = () => {
    setLoading(true);
    
    setTimeout(() => {
      const selectedQuestions = questionDatabase[topic] || questionDatabase.programming;
      const shuffledQuestions = [...selectedQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      
      setQuestions(shuffledQuestions);
      setLoading(false);
    }, 1000);
  };

  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      await audioService.playQuizCorrect();
    } else {
      await audioService.playQuizWrong();
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
        audioService.playSuccessSound();
      }
    }, 2500);
  };

  const handleQuizComplete = (pointsEarned) => {
    dispatch({ type: 'SET_EDUCATIONAL_POINTS', payload: state.educationalPoints + pointsEarned });
    dispatch({ type: 'SET_CURRENT_QUIZ', payload: null });
    checkQuizAchievements();
  };

  const checkQuizAchievements = async () => {
    try {
      const resultadoMision = await achievementsService.updateMisionProgreso(username, 4, 1);
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      const logroQuiz = logros.find(l => l.nombre.includes("Campeón") || l.nombre.includes("Conocimiento"));
      if (logroQuiz && !logroQuiz.completado) {
        const logroCompletado = await achievementsService.completarLogro(username, logroQuiz.id);
        if (logroCompletado) {
          audioService.playSuccessSound();
        }
      }
    } catch (error) {
      console.error("Error actualizando logros de quiz:", error);
    }
  };

  const getScoreMessage = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "🎉 ¡Excelente! Eres un experto";
    if (percentage >= 60) return "👍 ¡Buen trabajo!";
    return "😊 Sigue practicando";
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        width: '500px',
        maxWidth: '90vw'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '20px' }}>
          📚 Cargando preguntas...
        </div>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3', 
          borderTop: '5px solid #3498db', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (quizCompleted) {
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const pointsEarned = Math.max(5, Math.floor(percentage / 20) * 5);

    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        width: '500px',
        maxWidth: '90vw',
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>🎯 Quiz Completado</h3>
        
        <div style={{
          fontSize: '48px',
          margin: '20px 0',
          color: percentage >= 60 ? '#27ae60' : '#e74c3c'
        }}>
          {score}/{totalQuestions}
        </div>
        
        <div style={{
          background: '#ecf0f1',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            {getScoreMessage(score, totalQuestions)}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Porcentaje: {percentage}%
          </div>
        </div>
        
        <div style={{
          background: '#d5edda',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #28a745'
        }}>
          <strong>🎁 Recompensa: {pointsEarned} puntos educativos</strong>
        </div>
        
        <button 
          onClick={() => handleQuizComplete(pointsEarned)}
          style={{
            padding: '12px 30px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          ✅ Aceptar Recompensa
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question?.correct;

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
      border: '3px solid #9b59b6'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', textAlign: 'center' }}>
        📝 Quiz de Programación
      </h3>
      
      <div style={{ 
        marginBottom: '20px',
        background: '#ecf0f1',
        borderRadius: '10px',
        padding: '10px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Pregunta {currentQuestion + 1} de {questions.length}
          </span>
          <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Puntuación: {score}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#bdc3c7',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div 
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              height: '100%',
              background: '#3498db',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '10px',
        border: '2px solid #e9ecef'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.4' }}>
          {question.question}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        {question.options.map((option, i) => (
          <button 
            key={i} 
            onClick={() => !showResult && handleAnswer(i)}
            disabled={showResult}
            style={{
              display: 'block',
              width: '100%',
              margin: '10px 0',
              padding: '15px',
              textAlign: 'left',
              backgroundColor: 
                showResult && i === question.correct ? '#d4edda' :
                showResult && i === selectedAnswer && !isCorrect ? '#f8d7da' :
                '#ffffff',
              color: 
                showResult && i === question.correct ? '#155724' :
                showResult && i === selectedAnswer && !isCorrect ? '#721c24' :
                '#000000',
              border: 
                showResult && i === question.correct ? '2px solid #28a745' :
                showResult && i === selectedAnswer && !isCorrect ? '2px solid #dc3545' :
                '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: showResult ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '15px'
            }}
            onMouseEnter={(e) => {
              if (!showResult) {
                e.target.style.backgroundColor = '#e3f2fd';
                e.target.style.borderColor = '#3498db';
              }
            }}
            onMouseLeave={(e) => {
              if (!showResult) {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#dee2e6';
              }
            }}
          >
            <span style={{ 
              display: 'inline-block', 
              width: '24px', 
              textAlign: 'center',
              marginRight: '10px',
              fontWeight: 'bold'
            }}>
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        ))}
      </div>
      
      {showResult && (
        <div style={{
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
          color: isCorrect ? '#155724' : '#721c24',
          border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}`,
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            {question.explanation}
          </div>
        </div>
      )}
      
      <button 
        onClick={() => dispatch({ type: 'SET_CURRENT_QUIZ', payload: null })}
        style={{
          padding: '10px 15px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%',
          fontSize: '14px'
        }}
      >
        🚪 Salir del Quiz
      </button>
    </div>
  );
};

export default QuizComponent;