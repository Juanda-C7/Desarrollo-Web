import React, { useState, useEffect } from 'react';
import { openTDBService } from '../services/opentdbService';
import { audioService } from '../services/audioService';

const QuizComponent = ({ topic, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [topic]);

  const loadQuestions = async () => {
    setLoading(true);
    const result = await openTDBService.getQuestions(18, 'easy', 5);
    setQuestions(result.questions);
    setLoading(false);
  };

  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === questions[currentQuestion]?.correct_answer;
    
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
        onComplete(score * 5);
      }
    }, 2000);
  };

  if (loading || !questions.length) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        width: '400px'
      }}>
        <div>📚 Cargando preguntas...</div>
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #3498db', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answers = openTDBService.shuffleAnswers(question);
  const isCorrect = selectedAnswer === question.correct_answer;

  return (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '3px solid #9b59b6'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', textAlign: 'center' }}>
        📝 Quiz de Ciencias de la Computación
      </h3>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        border: '2px solid #e9ecef'
      }}>
        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
          Pregunta {currentQuestion + 1} de {questions.length}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }} 
             dangerouslySetInnerHTML={{ __html: question.question }} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        {answers.map((answer, i) => (
          <button 
            key={i} 
            onClick={() => !showResult && handleAnswer(answer)}
            disabled={showResult}
            style={{
              display: 'block',
              width: '100%',
              margin: '8px 0',
              padding: '12px',
              textAlign: 'left',
              backgroundColor: 
                showResult && answer === question.correct_answer ? '#d4edda' :
                showResult && answer === selectedAnswer && !isCorrect ? '#f8d7da' :
                '#ffffff',
              color: 
                showResult && answer === question.correct_answer ? '#155724' :
                showResult && answer === selectedAnswer && !isCorrect ? '#721c24' :
                '#000000',
              border: 
                showResult && answer === question.correct_answer ? '2px solid #28a745' :
                showResult && answer === selectedAnswer && !isCorrect ? '2px solid #dc3545' :
                '2px solid #dee2e6',
              borderRadius: '8px',
              cursor: showResult ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: answer }} />
          </button>
        ))}
      </div>
      
      {showResult && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
          color: isCorrect ? '#155724' : '#721c24',
          border: `2px solid ${isCorrect ? '#28a745' : '#dc3545'}`,
          borderRadius: '8px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
        padding: '10px',
        background: '#e9ecef',
        borderRadius: '8px'
      }}>
        <div><strong>Puntuación:</strong> {score}/{questions.length}</div>
        <div><strong>Progreso:</strong> {Math.round(((currentQuestion + 1) / questions.length) * 100)}%</div>
      </div>
    </div>
  );
};

export default QuizComponent;