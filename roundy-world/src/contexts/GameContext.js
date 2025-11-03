import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userService } from '../services/api/userService';

const GameContext = createContext();

// Cargar estado inicial desde localStorage
const loadInitialState = () => {
  const savedColor = localStorage.getItem('userColor');
  const savedMoney = localStorage.getItem('userMoney');
  const savedSandwichDone = localStorage.getItem('userSandwichDone');
  const savedEducationalPoints = localStorage.getItem('userEducationalPoints');
  const savedTrofeos = localStorage.getItem('userTrofeos');
  
  return {
    step: "login",
    username: localStorage.getItem('username') || "",
    password: "",
    isRegistering: false,
    color: savedColor ? parseInt(savedColor) : 0xff0000, // Rojo por defecto si no hay color guardado
    showSandwichMinigame: false,
    showPressAHint: false,
    showPressEHint: false,
    sandwich: [],
    sandwichDone: savedSandwichDone === 'true' || false,
    money: savedMoney ? parseInt(savedMoney) : 0,
    currentMap: "kitchen",
    educationalPoints: savedEducationalPoints ? parseInt(savedEducationalPoints) : 0,
    currentLesson: null,
    currentQuiz: null,
    showAchievements: false,
    showSandwichMessage: false,
    logros: [],
    misiones: [],
    trofeos: savedTrofeos ? JSON.parse(savedTrofeos) : { bronce: 0, plata: 0, oro: 0, total: 0 }
  };
};

const initialState = loadInitialState();

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_USERNAME':
      return { ...state, username: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_IS_REGISTERING':
      return { ...state, isRegistering: action.payload };
    case 'SET_COLOR':
      // Guardar en localStorage inmediatamente
      localStorage.setItem('userColor', action.payload.toString());
      return { ...state, color: action.payload };
    case 'SHOW_SANDWICH_MINIGAME':
      return { ...state, showSandwichMinigame: action.payload };
    case 'SHOW_PRESS_A_HINT':
      return { ...state, showPressAHint: action.payload };
    case 'SHOW_PRESS_E_HINT':
      return { ...state, showPressEHint: action.payload };
    case 'SET_SANDWICH':
      return { ...state, sandwich: action.payload };
    case 'SET_SANDWICH_DONE':
      localStorage.setItem('userSandwichDone', action.payload.toString());
      return { ...state, sandwichDone: action.payload };
    case 'SET_MONEY':
      localStorage.setItem('userMoney', action.payload.toString());
      return { ...state, money: action.payload };
    case 'SET_CURRENT_MAP':
      return { ...state, currentMap: action.payload };
    case 'SET_EDUCATIONAL_POINTS':
      localStorage.setItem('userEducationalPoints', action.payload.toString());
      return { ...state, educationalPoints: action.payload };
    case 'SET_CURRENT_LESSON':
      return { ...state, currentLesson: action.payload };
    case 'SET_CURRENT_QUIZ':
      return { ...state, currentQuiz: action.payload };
    case 'SHOW_ACHIEVEMENTS':
      return { ...state, showAchievements: action.payload };
    case 'SHOW_SANDWICH_MESSAGE':
      return { ...state, showSandwichMessage: action.payload };
    case 'SET_TROFEOS':
      localStorage.setItem('userTrofeos', JSON.stringify(action.payload));
      return { ...state, trofeos: action.payload };
    case 'SET_LOGROS':
      return { ...state, logros: action.payload };
    case 'SET_MISIONES':
      return { ...state, misiones: action.payload };
    case 'RESET_SANDWICH':
      return { ...state, sandwich: [] };
    case 'LOAD_USER_DATA':
      // Cargar todos los datos del usuario
      return { 
        ...state, 
        color: action.payload.color || state.color,
        money: action.payload.money || state.money,
        sandwichDone: action.payload.sandwichDone || state.sandwichDone,
        educationalPoints: action.payload.educationalPoints || state.educationalPoints,
        trofeos: action.payload.trofeos || state.trofeos
      };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      const userData = userService.loadUserDataFromStorage();
      dispatch({ type: 'LOAD_USER_DATA', payload: userData });
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};