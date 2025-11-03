import React, { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { userService } from '../../services/api/userService';
import { achievementsService } from '../../services/api/achievementsService';

export default function LoginForm() {
  const { state, dispatch } = useGame();
  const { username, password, isRegistering } = state;

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      dispatch({ type: 'SET_USERNAME', payload: savedUsername });
      
      // Intentar cargar datos desde localStorage
      const userData = userService.loadUserDataFromStorage();
      if (userData.color) {
        dispatch({ type: 'SET_COLOR', payload: userData.color });
      }
    }
  }, [dispatch]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Por favor ingresa usuario y contraseña");
      return;
    }
    
    const result = await userService.login(username, password);
    if (result.success) {
      // CARGAR TODOS LOS DATOS DESDE localStorage (asegura que estén actualizados)
      const userData = userService.loadUserDataFromStorage();
      
      dispatch({ type: 'SET_COLOR', payload: userData.color });
      dispatch({ type: 'SET_MONEY', payload: userData.money });
      dispatch({ type: 'SET_SANDWICH_DONE', payload: userData.sandwichDone });
      dispatch({ type: 'SET_EDUCATIONAL_POINTS', payload: userData.educationalPoints });
      dispatch({ type: 'SET_TROFEOS', payload: userData.trofeos });
      dispatch({ type: 'SET_STEP', payload: "world" });
      
      // Cargar logros y misiones
      loadAchievementsData();
    } else {
      alert(result.error || "Error en login");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Por favor ingresa usuario y contraseña");
      return;
    }
    
    if (password.length < 3) {
      alert("La contraseña debe tener al menos 3 caracteres");
      return;
    }
    
    const result = await userService.register(username, password);
    if (result.success) {
      // CARGAR TODOS LOS DATOS DESDE localStorage
      const userData = userService.loadUserDataFromStorage();
      
      dispatch({ type: 'SET_COLOR', payload: userData.color });
      dispatch({ type: 'SET_MONEY', payload: userData.money });
      dispatch({ type: 'SET_SANDWICH_DONE', payload: userData.sandwichDone });
      dispatch({ type: 'SET_EDUCATIONAL_POINTS', payload: userData.educationalPoints });
      dispatch({ type: 'SET_TROFEOS', payload: userData.trofeos });
      dispatch({ type: 'SET_STEP', payload: "customize" });
      
      // Inicializar sistema de logros
      inicializarJugador();
    } else {
      alert(result.error || "Error en registro");
    }
  };

  const loadAchievementsData = async () => {
    const estado = await achievementsService.loadAchievementsData(username);
    if (estado) {
      dispatch({ type: 'SET_LOGROS', payload: estado.logros });
      dispatch({ type: 'SET_MISIONES', payload: estado.misiones });
      dispatch({ type: 'SET_TROFEOS', payload: estado.trofeos || { bronce: 0, plata: 0, oro: 0, total: 0 } });
    }
  };

  const inicializarJugador = async () => {
    await achievementsService.inicializarJugador(username);
    loadAchievementsData();
  };

  return (
    <div
      style={{
        textAlign: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #fceabb, #f8b500)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Roundy World - {isRegistering ? "Registro" : "Login"}</h1>
      <input
        placeholder="Ingresa tu nombre de usuario"
        value={username}
        onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
        style={inputStyle}
      />
      <button
        onClick={isRegistering ? handleRegister : handleLogin}
        disabled={!username || !password}
        style={buttonStyle}
      >
        {isRegistering ? "Registrarse" : "Iniciar Sesión"}
      </button>
      
      <button
        onClick={() => dispatch({ type: 'SET_IS_REGISTERING', payload: !isRegistering })}
        style={secondaryButtonStyle}
      >
        {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
      </button>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "2px solid #333",
  marginBottom: "10px",
  width: "250px"
};

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  backgroundColor: "#333",
  color: "#fff",
  marginBottom: "10px",
};

const secondaryButtonStyle = {
  padding: "8px 16px",
  borderRadius: "8px",
  backgroundColor: "transparent",
  color: "#333",
  border: "1px solid #333",
};