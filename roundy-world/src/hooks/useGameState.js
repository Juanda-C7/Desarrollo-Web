import { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { userService } from '../services/api/userService';
import { achievementsService } from '../services/api/achievementsService';

export const useGameState = () => {
  const { state, dispatch } = useGame();
  const { username, color, money, sandwichDone, educationalPoints, trofeos, step } = state;

  // Auto-save cuando cambian los datos del usuario
  useEffect(() => {
    const saveUserData = async () => {
      if (username && step === "world") {
        await userService.saveUserData({
          color, 
          money, 
          sandwichDone, 
          educationalPoints,
          trofeos 
        });
      }
    };

    saveUserData();
  }, [username, color, money, sandwichDone, educationalPoints, trofeos, step]);

  // Cargar logros al entrar al mundo
  useEffect(() => {
    const loadAchievements = async () => {
      if (username && step === "world") {
        const estado = await achievementsService.loadAchievementsData(username);
        if (estado) {
          dispatch({ type: 'SET_LOGROS', payload: estado.logros });
          dispatch({ type: 'SET_MISIONES', payload: estado.misiones });
          dispatch({ type: 'SET_TROFEOS', payload: estado.trofeos || { bronce: 0, plata: 0, oro: 0, total: 0 } });
        }
      }
    };

    loadAchievements();
  }, [username, step, dispatch]);

  return { state, dispatch };
};