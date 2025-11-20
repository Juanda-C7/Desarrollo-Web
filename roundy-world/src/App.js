import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import p5 from "p5";
import io from "socket.io-client";
import EducationalGame from "./components/EducationalGame";
import { audioService } from "./services/audioService";

export default function App() {
  const [step, setStep] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [color, setColor] = useState(0xff0000);
  const [showSandwichMinigame, setShowSandwichMinigame] = useState(false);
  const [showPressAHint, setShowPressAHint] = useState(false);
  const [sandwich, setSandwich] = useState([]);
  const [sandwichDone, setSandwichDone] = useState(false);
  const [money, setMoney] = useState(0);
  const [currentMap, setCurrentMap] = useState("kitchen");
  const [educationalPoints, setEducationalPoints] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showPressEHint, setShowPressEHint] = useState(false);
  const [showSandwichMessage, setShowSandwichMessage] = useState(false);
  const [nearExitDoor, setNearExitDoor] = useState(false);
  
  // Nuevos estados para mapa y perfil
  const [showMap, setShowMap] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [playerHouse, setPlayerHouse] = useState(null);
  const [selectedHat, setSelectedHat] = useState(null);
  const [availableHats, setAvailableHats] = useState([]);
  const [ownedHats, setOwnedHats] = useState([]);

  // Estados para logros
  const [logros, setLogros] = useState([]);
  const [misiones, setMisiones] = useState([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [trofeos, setTrofeos] = useState({
    bronce: 0,
    plata: 0,
    oro: 0,
    total: 0
  });

  // Estados para multijugador y chat
  const [socket, setSocket] = useState(null);
  const [otherPlayers, setOtherPlayers] = useState({});
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [serverIP, setServerIP] = useState("localhost");

  const phaserRef = useRef(null);
  const p5Ref = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const MONGODB_API = "http://" + window.location.hostname + ":4001";
  const ACHIEVEMENTS_API = "http://" + window.location.hostname + ":2001";

  // Obtener IP del servidor desde parámetros URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const serverParam = urlParams.get('server');
    if (serverParam) {
      setServerIP(serverParam);
      console.log(`🌐 Servidor configurado desde URL: ${serverParam}`);
    }
  }, []);

  const SOCKET_API = `http://${serverIP}:4002`;

  // Inicializar casa personal después del login
  useEffect(() => {
    if (step === "world" && username) {
      const houseId = `casa_${username}`;
      setPlayerHouse(houseId);
      setCurrentMap(houseId);
    }
  }, [step, username]);

  // Cargar datos del usuario y sombreros
  useEffect(() => {
    if (step === "world" && username) {
      syncUserData();
    }
  }, [step, username]);

  const syncUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${MONGODB_API}/user`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        // Sincronizar todos los estados locales
        setMoney(userData.money || 0);
        setEducationalPoints(userData.educationalPoints || 0);
        setOwnedHats(userData.ownedHats || []);
        
        // Cargar lista de sombreros disponibles
        await loadHatsData(userData.ownedHats || []);
        
        // Cargar sombrero seleccionado
        if (userData.selectedHat) {
          const hat = getHatById(userData.selectedHat);
          if (hat) {
            setSelectedHat(hat);
            localStorage.setItem('selectedHat', JSON.stringify(hat));
          }
        }
      }
    } catch (error) {
      console.error("Error sincronizando datos del usuario:", error);
    }
  };

  // Función auxiliar para obtener sombrero por ID
  const getHatById = (hatId) => {
    const hats = [
      { 
        id: 1, 
        name: "🎓 Gorro de Graduado", 
        cost: 50, 
        currency: "points",
        description: "Para los más estudiosos"
      },
      { 
        id: 2, 
        name: "👑 Corona", 
        cost: 100, 
        currency: "points",
        description: "Para los reyes del conocimiento"
      },
      { 
        id: 3, 
        name: "🎩 Sombrero de Copa", 
        cost: 150, 
        currency: "points",
        description: "Elegancia y estilo"
      },
      { 
        id: 4, 
        name: "🧢 Gorra Deportiva", 
        cost: 200, 
        currency: "points", 
        description: "Para los más activos"
      },
      { 
        id: 5, 
        name: "⛑️ Casco de Seguridad", 
        cost: 25, 
        currency: "money",
        description: "Protección para tus aventuras"
      },
      { 
        id: 6, 
        name: "🧢 Gorra Béisbol", 
        cost: 50, 
        currency: "money",
        description: "Estilo deportivo"
      }
    ];
    
    return hats.find(h => h.id === hatId);
  };

  const loadHatsData = async (userOwnedHats = []) => {
    try {
      const hats = [
        { 
          id: 1, 
          name: "🎓 Gorro de Graduado", 
          cost: 50, 
          currency: "points",
          unlocked: educationalPoints >= 50,
          owned: userOwnedHats.includes(1),
          description: "Para los más estudiosos"
        },
        { 
          id: 2, 
          name: "👑 Corona", 
          cost: 100, 
          currency: "points",
          unlocked: educationalPoints >= 100,
          owned: userOwnedHats.includes(2),
          description: "Para los reyes del conocimiento"
        },
        { 
          id: 3, 
          name: "🎩 Sombrero de Copa", 
          cost: 150, 
          currency: "points",
          unlocked: educationalPoints >= 150,
          owned: userOwnedHats.includes(3),
          description: "Elegancia y estilo"
        },
        { 
          id: 4, 
          name: "🧢 Gorra Deportiva", 
          cost: 200, 
          currency: "points", 
          unlocked: educationalPoints >= 200,
          owned: userOwnedHats.includes(4),
          description: "Para los más activos"
        },
        { 
          id: 5, 
          name: "⛑️ Casco de Seguridad", 
          cost: 25, 
          currency: "money",
          unlocked: money >= 25,
          owned: userOwnedHats.includes(5),
          description: "Protección para tus aventuras"
        },
        { 
          id: 6, 
          name: "🧢 Gorra Béisbol", 
          cost: 50, 
          currency: "money",
          unlocked: money >= 50,
          owned: userOwnedHats.includes(6),
          description: "Estilo deportivo"
        }
      ];

      setAvailableHats(hats);
    } catch (error) {
      console.error("Error cargando sombreros:", error);
    }
  };

  const purchaseHat = async (hat) => {
    try {
      const token = localStorage.getItem('token');
      
      // Verificar si ya posee el sombrero
      if (hat.owned) {
        alert("¡Ya posees este sombrero! Puedes equiparlo desde tu colección.");
        return;
      }
      
      if (hat.currency === "points" && educationalPoints < hat.cost) {
        alert("No tienes suficientes puntos educativos");
        return;
      }
      
      if (hat.currency === "money" && money < hat.cost) {
        alert("No tienes suficiente dinero");
        return;
      }

      const response = await fetch(`${MONGODB_API}/user/purchase-hat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          hatId: hat.id,
          cost: hat.cost,
          currency: hat.currency
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar estados locales
        if (hat.currency === "points") {
          setEducationalPoints(prev => prev - hat.cost);
        } else {
          setMoney(prev => prev - hat.cost);
        }
        
        // Equipar automáticamente el sombrero después de comprarlo
        const newHat = { ...hat, owned: true };
        setSelectedHat(newHat);
        
        // Actualizar la lista de sombreros poseídos
        setOwnedHats(prev => [...prev, hat.id]);
        
        // Actualizar availableHats para marcar como poseído
        setAvailableHats(prev => prev.map(h => 
          h.id === hat.id ? { ...h, owned: true } : h
        ));
        
        // Guardar en localStorage
        localStorage.setItem('selectedHat', JSON.stringify(newHat));
        
        audioService.playSuccessSound();
        alert(`¡Felicidades! Has adquirido y equipado ${hat.name}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al comprar el sombrero");
      }
    } catch (error) {
      console.error("Error comprando sombrero:", error);
      alert("Error de conexión");
    }
  };

  const equipHat = async (hat) => {
    try {
      const token = localStorage.getItem('token');
      
      // Verificar que el usuario posea el sombrero
      if (!hat.owned && !ownedHats.includes(hat.id)) {
        alert("No posees este sombrero. Debes comprarlo primero.");
        return;
      }

      const response = await fetch(`${MONGODB_API}/user/equip-hat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          hatId: hat.id
        }),
      });

      if (response.ok) {
        // Actualizar estado local
        setSelectedHat(hat);
        
        // Guardar en localStorage para persistencia inmediata
        localStorage.setItem('selectedHat', JSON.stringify(hat));
        
        audioService.playSuccessSound();
        alert(`¡Has equipado ${hat.name}!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al equipar el sombrero");
      }
    } catch (error) {
      console.error("Error equipando sombrero:", error);
      alert("Error de conexión");
    }
  };

  // Cargar sombrero seleccionado desde localStorage al iniciar
  useEffect(() => {
    if (step === "world") {
      const savedHat = localStorage.getItem('selectedHat');
      if (savedHat) {
        try {
          const hat = JSON.parse(savedHat);
          setSelectedHat(hat);
        } catch (error) {
          console.error("Error cargando sombrero desde localStorage:", error);
        }
      }
    }
  }, [step]);

  // CONEXIÓN SOCKET PARA MULTIJUGADOR
  useEffect(() => {
    if (step === "world" && username) {
      console.log(`🔗 Conectando a servidor Socket.io: ${SOCKET_API}`);
      
      const newSocket = io(SOCKET_API, {
        timeout: 10000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Conectado al servidor Socket.io");
        setSocketStatus("connected");
        
        // Unirse al juego con información del sombrero
        newSocket.emit("join-game", {
          username,
          color,
          x: 150,
          y: 300,
          currentMap,
          selectedHat: selectedHat
        });
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Desconectado del servidor Socket.io");
        setSocketStatus("disconnected");
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Error conectando al servidor:", error);
        setSocketStatus("error");
      });

      // Escuchar jugadores actuales
      newSocket.on("current-players", (players) => {
        console.log("🎮 Jugadores actuales recibidos:", players.length);
        const playersMap = {};
        players.forEach(player => {
          if (player.id !== newSocket.id) {
            playersMap[player.id] = player;
          }
        });
        setOtherPlayers(playersMap);
      });

      // Jugador nuevo
      newSocket.on("player-joined", (player) => {
        console.log("🆕 Jugador unido:", player.username, "con sombrero:", player.selectedHat);
        if (player.id !== newSocket.id) {
          setOtherPlayers(prev => ({ ...prev, [player.id]: player }));
        }
      });

      // Jugador se movió
      newSocket.on("player-moved", (data) => {
        setOtherPlayers(prev => ({
          ...prev,
          [data.id]: {
            ...prev[data.id],
            x: data.x,
            y: data.y,
            currentMap: data.currentMap
          }
        }));
      });

      // Mensaje de chat
      newSocket.on("player-message", (data) => {
        setOtherPlayers(prev => ({
          ...prev,
          [data.id]: {
            ...prev[data.id],
            message: data.message,
            messageTimestamp: data.timestamp
          }
        }));
      });

      // Jugador cambió sombrero
      newSocket.on("player-hat-changed", (data) => {
        console.log("🎩 Jugador cambió sombrero:", data.username, data.selectedHat);
        setOtherPlayers(prev => ({
          ...prev,
          [data.id]: {
            ...prev[data.id],
            selectedHat: data.selectedHat
          }
        }));
      });

      // Jugador salió
      newSocket.on("player-left", (playerId) => {
        console.log("👋 Jugador salió:", playerId);
        setOtherPlayers(prev => {
          const newPlayers = { ...prev };
          delete newPlayers[playerId];
          return newPlayers;
        });
      });

      return () => {
        newSocket.close();
        setSocketStatus("disconnected");
      };
    }
  }, [step, username, color, currentMap, serverIP]);

  // Enviar actualización de sombrero a otros jugadores
  useEffect(() => {
    if (socket && selectedHat && step === "world") {
      console.log("🎩 Enviando actualización de sombrero:", selectedHat.name);
      socket.emit("player-hat-change", {
        selectedHat: selectedHat
      });
    }
  }, [selectedHat, socket, step]);

  // MONGODB: Login y Registro
  const handleLogin = async () => {
    if (!username || !password) {
      alert("Por favor ingresa usuario y contraseña");
      return;
    }
    
    try {
      const res = await fetch(`${MONGODB_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        
        setColor(data.user.color);
        setMoney(data.user.money);
        setSandwichDone(data.user.sandwichDone);
        setEducationalPoints(data.user.educationalPoints);
        if (data.user.trofeos) setTrofeos(data.user.trofeos);
        
        // Cargar sombrero seleccionado desde la base de datos
        if (data.user.selectedHat) {
          const hat = getHatById(data.user.selectedHat);
          if (hat) {
            setSelectedHat(hat);
            localStorage.setItem('selectedHat', JSON.stringify(hat));
          }
        }
        
        setStep("world");
        
        loadAchievementsData();
      } else {
        alert(data.error || "Error en login");
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      alert("Error de conexión con el servidor");
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
    
    try {
      const res = await fetch(`${MONGODB_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        
        setColor(data.user.color);
        setMoney(data.user.money);
        setSandwichDone(data.user.sandwichDone);
        setEducationalPoints(data.user.educationalPoints);
        if (data.user.trofeos) setTrofeos(data.user.trofeos);
        setStep("customize");
        
        inicializarJugador();
      } else {
        alert(data.error || "Error en registro");
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      alert("Error de conexión con el servidor");
    }
  };

  // MONGODB: Guardar datos automáticamente
  useEffect(() => {
    const saveUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !username || step !== "world") return;

      try {
        await fetch(`${MONGODB_API}/user`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            color, 
            money, 
            sandwichDone, 
            educationalPoints,
            trofeos,
            selectedHat: selectedHat ? selectedHat.id : null
          }),
        });
      } catch (error) {
        console.error("❌ Error guardando datos:", error);
      }
    };

    // Guardar datos periódicamente y cuando cambien
    const saveInterval = setInterval(saveUserData, 10000);
    saveUserData();
    
    return () => clearInterval(saveInterval);
  }, [username, color, money, sandwichDone, educationalPoints, trofeos, step, selectedHat]);

  // SISTEMA DE LOGROS Y MISIONES
  const loadAchievementsData = async () => {
    try {
      const response = await fetch(`${ACHIEVEMENTS_API}/estado/${username}`);
      const estado = await response.json();
      if (estado) {
        setLogros(estado.logros);
        setMisiones(estado.misiones);
        setTrofeos(estado.trofeos || { bronce: 0, plata: 0, oro: 0, total: 0 });
        
        syncAchievementsWithMongoDB(estado.trofeos);
      }
    } catch (error) {
      console.error("Error cargando logros y misiones:", error);
    }
  };

  const inicializarJugador = async () => {
    try {
      await fetch(`${ACHIEVEMENTS_API}/inicializar-jugador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugadorId: username }),
      });
      loadAchievementsData();
    } catch (error) {
      console.error("Error inicializando jugador:", error);
    }
  };

  const syncAchievementsWithMongoDB = async (newTrofeos) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${MONGODB_API}/sync-achievements`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          trofeos: newTrofeos || trofeos
        }),
      });
    } catch (error) {
      console.error("❌ Error sincronizando logros:", error);
    }
  };

  useEffect(() => {
    if (username && step === "world") {
      loadAchievementsData();
    }
  }, [username, step]);

  // SISTEMA DE CHAT
  const sendMessage = () => {
    if (chatMessage.trim() && socket) {
      socket.emit("send-message", chatMessage);
      setChatMessage("");
    }
  };

  // INGREDIENTES Y COLORES
  const ingredients = [
    { name: "🥬 Lechuga", color: "#4caf50" },
    { name: "🍅 Tomate", color: "#e74c3c" },
    { name: "🧀 Queso", color: "#f1c40f" },
    { name: "🥩 Carne", color: "#8b4513" },
  ];

  const colors = {
    amarillo: 0xffff00,
    rosa: 0xff69b4,
    rojo: 0xff0000,
    naranja: 0xffa500,
    celeste: 0x00ffff,
    verde: 0x00ff00,
  };

  const numToCssHex = (num) => "#" + num.toString(16).padStart(6, "0");

  // FUNCIONES DE NAVEGACIÓN
  const handleEnterLibrary = () => {
    setCurrentMap("library");
    audioService.playSuccessSound();
    checkLibraryAchievements();
  };

  const handleEnterSocratic = () => {
    setCurrentMap("socratic");
    audioService.playSuccessSound();
  };

  const handleExitToKitchen = () => {
    setCurrentMap(playerHouse || "kitchen");
    audioService.playSuccessSound();
  };

  // COMPONENTES DE MODALES
  const MapModal = () => {
    const locations = [
      { id: playerHouse, name: "🏠 Mi Casa", icon: "🏠", description: "Tu espacio personal" },
      { id: "library", name: "📚 Biblioteca", icon: "📚", description: "Minijuegos educativos" },
      { id: "socratic", name: "🏛️ Salón Socrático", icon: "🏛️", description: "Área de discusión" }
    ];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '20px',
          width: '500px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '30px' }}>🗺️ Mapa del Mundo</h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {locations.map(location => (
              <button
                key={location.id}
                onClick={() => {
                  setCurrentMap(location.id);
                  setShowMap(false);
                  audioService.playSuccessSound();
                }}
                style={{
                  padding: '15px 20px',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'rgba(255,255,255,1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255,255,255,0.9)';
                }}
              >
                <span style={{ fontSize: '24px' }}>{location.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{location.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{location.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowMap(false)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cerrar Mapa
          </button>
        </div>
      </div>
    );
  };

  const ProfileModal = () => {
    const [activeTab, setActiveTab] = useState('collection');

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('selectedHat');
      setStep('login');
      setShowProfile(false);
      if (socket) {
        socket.close();
      }
    };

    // Filtrar sombreros poseídos y disponibles
    const ownedHatsList = availableHats.filter(hat => hat.owned);
    const availableHatsList = availableHats.filter(hat => !hat.owned && hat.unlocked);
    const lockedHatsList = availableHats.filter(hat => !hat.owned && !hat.unlocked);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
          padding: '30px',
          borderRadius: '20px',
          width: '700px',
          maxHeight: '80vh',
          overflow: 'auto',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>👤 Perfil de {username}</h2>
          
          {/* Avatar Preview con Sombrero */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 100 100">
                {/* Cuerpo del personaje */}
                <g id="body">
                  <circle cx="50" cy="44" r="24" fill={numToCssHex(color)} stroke="#111" strokeWidth="1.8" />
                  <g id="eyes">
                    <circle cx="42" cy="40" r="3.7" fill="#000" />
                    <circle cx="58" cy="40" r="3.7" fill="#000" />
                  </g>
                  <path d="M40 52 Q50 60 60 52" stroke="#111" strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
                
                {/* Sombrero seleccionado */}
                {selectedHat && (
                  <g id="hat" transform="translate(0, -5)">
                    {selectedHat.id === 1 && ( // Gorro de Graduado
                      <>
                        <rect x="20" y="15" width="60" height="12" fill="#1a1a1a" />
                        <rect x="25" y="27" width="50" height="6" fill="#0f0f0f" />
                        <path d="M25 15 Q50 5 75 15" fill="none" stroke="#ffd700" strokeWidth="3" />
                      </>
                    )}
                    {selectedHat.id === 2 && ( // Corona
                      <>
                        <path d="M25 20 L35 12 L45 20 L43 25 L57 25 L55 20 L65 12 L75 20 L70 32 L30 32 Z" fill="#ffd700" stroke="#ff6b00" strokeWidth="1.5" />
                        <circle cx="35" cy="18" r="2" fill="#ff6b00" />
                        <circle cx="50" cy="15" r="2" fill="#ff6b00" />
                        <circle cx="65" cy="18" r="2" fill="#ff6b00" />
                      </>
                    )}
                    {selectedHat.id === 3 && ( // Sombrero de Copa
                      <>
                        <rect x="25" y="10" width="50" height="6" fill="#2c2c2c" />
                        <ellipse cx="50" cy="20" rx="30" ry="8" fill="#1a1a1a" />
                        <rect x="40" y="20" width="20" height="2" fill="#333" />
                      </>
                    )}
                    {selectedHat.id === 4 && ( // Gorra Deportiva
                      <>
                        <path d="M20 18 Q50 8 80 18 L75 28 L25 28 Z" fill="#e74c3c" />
                        <rect x="30" y="18" width="40" height="4" fill="#c0392b" />
                        <rect x="45" y="22" width="10" height="3" fill="#fff" />
                      </>
                    )}
                    {selectedHat.id === 5 && ( // Casco de Seguridad
                      <>
                        <path d="M25 15 Q50 5 75 15 Q75 30 50 35 Q25 30 25 15" fill="#e74c3c" />
                        <rect x="40" y="20" width="20" height="8" fill="#2c3e50" />
                        <rect x="45" y="28" width="10" height="2" fill="#34495e" />
                      </>
                    )}
                    {selectedHat.id === 6 && ( // Gorra Béisbol
                      <>
                        <path d="M20 17 Q50 7 80 17 L75 27 L25 27 Z" fill="#3498db" />
                        <rect x="30" y="17" width="40" height="4" fill="#2980b9" />
                        <path d="M45 21 L55 21 L55 24 L45 24 Z" fill="#fff" />
                      </>
                    )}
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Información del Jugador */}
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>💰 Monedas: <strong>{money}</strong></span>
              <span>🧠 Puntos Educativos: <strong>{educationalPoints}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🏆 Trofeos: <strong>{trofeos.total}</strong></span>
              <span>🎩 Sombreros: <strong>{ownedHats.length}/6</strong></span>
            </div>
            {selectedHat && (
              <div style={{ marginTop: '10px', padding: '8px', background: '#e3f2fd', borderRadius: '5px' }}>
                <strong>Sombrero equipado:</strong> {selectedHat.name}
              </div>
            )}
          </div>

          {/* Pestañas */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveTab('collection')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'collection' ? '#00b894' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎩 Mi Colección
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'shop' ? '#00b894' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🛒 Tienda
            </button>
            <button
              onClick={() => setActiveTab('color')}
              style={{
                padding: '10px 20px',
                background: activeTab === 'color' ? '#00b894' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎨 Color
            </button>
          </div>

          {/* Contenido de Pestañas */}
          {activeTab === 'collection' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>🎩 Mi Colección de Sombreros</h3>
              {ownedHatsList.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  {ownedHatsList.map(hat => (
                    <div
                      key={hat.id}
                      style={{
                        background: selectedHat?.id === hat.id ? '#ffd700' : '#00b894',
                        padding: '15px',
                        borderRadius: '12px',
                        border: selectedHat?.id === hat.id ? '3px solid #ff6b00' : '2px solid rgba(255,255,255,0.3)',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {hat.name.split(' ')[0]}
                      </div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {hat.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        {hat.description}
                      </div>
                      <button
                        onClick={() => equipHat(hat)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: selectedHat?.id === hat.id ? '#28a745' : '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedHat?.id === hat.id ? '✅ Equipado' : '🎯 Equipar'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.9)',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, color: '#666' }}>
                    🎩 Aún no tienes sombreros. ¡Visita la tienda para adquirir tu primer sombrero!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shop' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>🛒 Tienda de Sombreros</h3>
              
              {/* Sombreros disponibles para comprar */}
              {availableHatsList.length > 0 && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '10px' }}>Disponibles para comprar</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    {availableHatsList.map(hat => (
                      <div
                        key={hat.id}
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          padding: '15px',
                          borderRadius: '12px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                          {hat.name.split(' ')[0]}
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          {hat.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                          {hat.description}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                          {hat.currency === "points" ? `🧠 ${hat.cost} puntos` : `💰 ${hat.cost} monedas`}
                        </div>
                        <button
                          onClick={() => purchaseHat(hat)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#e67e22',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          🛒 Comprar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sombreros bloqueados */}
              {lockedHatsList.length > 0 && (
                <div>
                  <h4 style={{ color: 'white', marginBottom: '10px' }}>Próximamente</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px'
                  }}>
                    {lockedHatsList.map(hat => (
                      <div
                        key={hat.id}
                        style={{
                          background: 'rgba(255,255,255,0.5)',
                          padding: '15px',
                          borderRadius: '12px',
                          border: '2px solid rgba(255,255,255,0.2)',
                          textAlign: 'center',
                          opacity: 0.7
                        }}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                          {hat.name.split(' ')[0]}
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                          {hat.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                          {hat.description}
                        </div>
                        <div style={{
                          padding: '8px',
                          background: '#95a5a6',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}>
                          {hat.currency === "points" 
                            ? `🔒 Necesitas ${hat.cost} puntos` 
                            : `🔒 Necesitas ${hat.cost} monedas`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'color' && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '15px' }}>🎨 Cambiar Color</h3>
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: '25px'
              }}>
                {Object.entries(colors).map(([name, hex]) => (
                  <div
                    key={name}
                    onClick={() => setColor(hex)}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      backgroundColor: numToCssHex(hex),
                      border: color === hex ? "3px solid #fff" : "2px solid rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title={name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowMap(true)}
              style={{
                padding: '10px 20px',
                background: '#00b894',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🗺️ Abrir Mapa
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                background: '#ff7675',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🚪 Cerrar Sesión
            </button>
            
            <button
              onClick={() => setShowProfile(false)}
              style={{
                padding: '10px 20px',
                background: '#6c5ce7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ❌ Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // RENDERIZAR OTROS JUGADORES
  const renderOtherPlayers = () => {
    const currentPlayers = Object.values(otherPlayers)
      .filter(player => player.currentMap === currentMap);

    return currentPlayers.map(player => {
      const playerX = Number(player.x) || 100;
      const playerY = Number(player.y) || 100;

      return (
        <div
          key={player.id}
          style={{
            position: 'absolute',
            left: `${playerX}px`,
            top: `${playerY}px`,
            width: 64,
            height: 64,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <svg viewBox="0 0 100 100" width="64" height="64">
            <defs>
              <filter id={`otherPlayerShadow-${player.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
              </filter>
            </defs>
            
            {/* Sombrero de otros jugadores */}
            {player.selectedHat && (
              <g id="hat" transform="translate(0, -5)">
                {player.selectedHat.id === 1 && ( // Gorro de Graduado
                  <>
                    <rect x="20" y="15" width="60" height="12" fill="#1a1a1a" />
                    <rect x="25" y="27" width="50" height="6" fill="#0f0f0f" />
                    <path d="M25 15 Q50 5 75 15" fill="none" stroke="#ffd700" strokeWidth="3" />
                  </>
                )}
                {player.selectedHat.id === 2 && ( // Corona
                  <>
                    <path d="M25 20 L35 12 L45 20 L43 25 L57 25 L55 20 L65 12 L75 20 L70 32 L30 32 Z" fill="#ffd700" stroke="#ff6b00" strokeWidth="1.5" />
                    <circle cx="35" cy="18" r="2" fill="#ff6b00" />
                    <circle cx="50" cy="15" r="2" fill="#ff6b00" />
                    <circle cx="65" cy="18" r="2" fill="#ff6b00" />
                  </>
                )}
                {player.selectedHat.id === 3 && ( // Sombrero de Copa
                  <>
                    <rect x="25" y="10" width="50" height="6" fill="#2c2c2c" />
                    <ellipse cx="50" cy="20" rx="30" ry="8" fill="#1a1a1a" />
                    <rect x="40" y="20" width="20" height="2" fill="#333" />
                  </>
                )}
                {player.selectedHat.id === 4 && ( // Gorra Deportiva
                  <>
                    <path d="M20 18 Q50 8 80 18 L75 28 L25 28 Z" fill="#e74c3c" />
                    <rect x="30" y="18" width="40" height="4" fill="#c0392b" />
                    <rect x="45" y="22" width="10" height="3" fill="#fff" />
                  </>
                )}
                {player.selectedHat.id === 5 && ( // Casco de Seguridad
                  <>
                    <path d="M25 15 Q50 5 75 15 Q75 30 50 35 Q25 30 25 15" fill="#e74c3c" />
                    <rect x="40" y="20" width="20" height="8" fill="#2c3e50" />
                    <rect x="45" y="28" width="10" height="2" fill="#34495e" />
                  </>
                )}
                {player.selectedHat.id === 6 && ( // Gorra Béisbol
                  <>
                    <path d="M20 17 Q50 7 80 17 L75 27 L25 27 Z" fill="#3498db" />
                    <rect x="30" y="17" width="40" height="4" fill="#2980b9" />
                    <path d="M45 21 L55 21 L55 24 L45 24 Z" fill="#fff" />
                  </>
                )}
              </g>
            )}
            
            <g id="body">
              <circle
                cx="50"
                cy="44"
                r="24"
                fill={numToCssHex(player.color)}
                stroke="#111"
                strokeWidth="1.8"
                filter={`url(#otherPlayerShadow-${player.id})`}
              />
              <g id="eyes" transform="translate(0,0)">
                <circle cx="42" cy="40" r="3.7" fill="#000" />
                <circle cx="58" cy="40" r="3.7" fill="#000" />
              </g>
              <path
                d="M40 52 Q50 60 60 52"
                stroke="#111"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>
            <g id="arms" transform="translate(0,0)">
              <line
                x1="22"
                y1="50"
                x2="6"
                y2="66"
                stroke="#111"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="78"
                y1="50"
                x2="94"
                y2="66"
                stroke="#111"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
            <g id="legs">
              <line
                x1="42"
                y1="68"
                x2="36"
                y2="86"
                stroke="#111"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="58"
                y1="68"
                x2="64"
                y2="86"
                stroke="#111"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </svg>
          
          <div style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            zIndex: 20,
            border: '1px solid rgba(255,255,255,0.3)',
            minWidth: '60px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            {player.username}
          </div>
          
          {player.message && player.messageTimestamp && (Date.now() - player.messageTimestamp < 5000) && (
            <div style={{
              position: 'absolute',
              top: '-70px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.98)',
              color: '#333',
              padding: '8px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              maxWidth: '200px',
              wordWrap: 'break-word',
              border: '2px solid #4CAF50',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 21,
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.3'
            }}>
              {player.message}
            </div>
          )}
        </div>
      );
    });
  };

  // FUNCIONES DE LOGROS
  const finishSandwich = async () => {
    const requiredIngredients = 4;
    const hasAllIngredients = sandwich.length === requiredIngredients;
    
    if (!hasAllIngredients) {
      alert(`❌ Necesitas usar todos los ingredientes para completar el sandwich!\nTe faltan ${requiredIngredients - sandwich.length} ingredientes.`);
      audioService.playErrorSound();
      return;
    }
    
    setSandwichDone(true);
    setShowSandwichMinigame(false);
    setShowSandwichMessage(true);
    setMoney((prev) => prev + 5);
    audioService.playCoinSound();
    
    await checkSandwichAchievements();
  };

  const resetSandwich = () => {
    setSandwich([]);
  };

  const checkSandwichAchievements = async () => {
    try {
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/1/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      const logroSandwich = logros.find(l => l.nombre.includes("Sandwich"));
      if (logroSandwich && !logroSandwich.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroSandwich.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData();
        }
      }
    } catch (error) {
      console.error("Error actualizando logros:", error);
    }
  };

  const handleLessonComplete = async (points) => {
    setEducationalPoints(prev => prev + points);
    setCurrentLesson(null);
    audioService.playSuccessSound();
    await checkEducationAchievements();
  };

  const checkEducationAchievements = async () => {
    try {
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/2/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      const logroEducacion = logros.find(l => l.nombre.includes("Estudiante"));
      if (logroEducacion && !logroEducacion.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroEducacion.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData();
        }
      }
    } catch (error) {
      console.error("Error actualizando logros educativos:", error);
    }
  };

  const checkLibraryAchievements = async () => {
    try {
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/3/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      const logroExploracion = logros.find(l => l.nombre.includes("Explorador"));
      if (logroExploracion && !logroExploracion.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroExploracion.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData();
        }
      }
    } catch (error) {
      console.error("Error actualizando logros de biblioteca:", error);
    }
  };

  // INITIALIZE p5 + Phaser
  useEffect(() => {
    if (step === "world" && !phaserRef.current) {
      // --- p5 sketch ---
      const sketch = (s) => {
        const W = 800, H = 600;

        s.setup = () => {
          s.createCanvas(W, H).parent("p5-container");
        };

        s.draw = () => {
          s.push();
          s.noStroke();
          
          if (currentMap === "kitchen" || currentMap.startsWith("casa_")) {
            // Cocina o Casa Personal
            s.background("#e9f3fb");
            s.fill("#f2e9dc");
            s.rect(0, 0, W, 220);
            s.fill("#9fd3ff");
            s.rect(520, 30, 180, 110, 8);
            s.fill("#fff7");
            s.rect(540, 50, 140, 70, 6);
            s.translate(0, 220);
            s.fill("#f8f2e6");
            s.rect(0, 0, W, H - 220);
            s.stroke("#e0d3c3");
            const tile = 48;
            for (let y = 0; y < H - 220; y += tile) {
              for (let x = 0; x < W; x += tile) {
                s.noFill();
                s.rect(x, y, tile, tile);
              }
            }
            s.pop();

            // En casas personales, mostrar decoración única
            if (currentMap.startsWith("casa_")) {
              s.push();
              s.fill("#ffeb3b");
              s.rect(600, 100, 80, 80, 10);
              s.fill("#4caf50");
              s.rect(100, 350, 120, 60, 5);
              s.fill("#8bc34a");
              s.rect(650, 350, 100, 40, 5);
              s.fill("#2196f3");
              s.textSize(16);
              s.textAlign(s.LEFT, s.TOP);
              s.text("🏠 Mi Casa", 20, 20);
              s.pop();
            }

            // Mesa
            s.push();
            s.noStroke();
            s.fill("#00000022");
            s.ellipse(400, 330, 160, 30);
            s.fill("#cd853f");
            s.rectMode(s.CENTER);
            s.rect(400, 300, 220, 80, 8);
            s.fill("#8b5a2b");
            s.rect(330, 350, 18, 60, 4);
            s.rect(470, 350, 18, 60, 4);
            s.pop();

            // Estufa
            s.push();
            s.fill("#c7c7c7");
            s.rect(20, 280, 140, 120, 6);
            s.fill("#333");
            s.rect(20, 250, 100, 20, 4);
            s.fill("#8b0000");
            s.rect(20, 260, 40, 20, 4);
            const t = s.millis() / 800;
            s.noFill();
            s.stroke("#ffffff88");
            s.strokeWeight(2);
            for (let i = 0; i < 3; i++) {
              const yy = 235 - ((t + i * 0.6) % 1) * 30;
              s.ellipse(20, yy, 12, 8);
            }
            s.pop();

            // Estantes
            s.push();
            s.fill("#b3c8a6");
            s.rect(700, 160, 140, 60, 6);
            s.fill("#8b5a2b");
            s.rect(700, 200, 30, 30, 6);
            s.pop();

          } else if (currentMap === "library") {
            // Biblioteca
            s.background("#2c3e50");
            
            // Estantes de libros
            s.fill("#8B4513");
            for (let i = 0; i < 5; i++) {
              s.rect(100 + i * 120, 100, 80, 200, 5);
              s.fill("#e74c3c"); s.rect(105 + i * 120, 110, 70, 15, 2);
              s.fill("#3498db"); s.rect(105 + i * 120, 130, 70, 15, 2);
              s.fill("#f1c40f"); s.rect(105 + i * 120, 150, 70, 15, 2);
              s.fill("#2ecc71"); s.rect(105 + i * 120, 170, 70, 15, 2);
              s.fill("#9b59b6"); s.rect(105 + i * 120, 190, 70, 15, 2);
              s.fill("#e67e22"); s.rect(105 + i * 120, 210, 70, 15, 2);
              s.fill("#1abc9c"); s.rect(105 + i * 120, 230, 70, 15, 2);
              s.fill("#8B4513");
            }
            
            // Área de computadoras
            s.fill("#34495e");
            s.rect(100, 350, 600, 150, 10);
            s.fill("#2c3e50");
            s.rect(120, 370, 150, 110, 5);
            s.rect(290, 370, 150, 110, 5);
            s.rect(460, 370, 150, 110, 5);
            
          } else if (currentMap === "socratic") {
            // SALÓN SOCRÁTICO
            s.background("#4a708b");
            
            // Suelo
            s.fill("#8fbc8f");
            s.rect(0, 400, 800, 200);
            
            // Patrón de suelo
            s.stroke("#7a9f7a");
            s.strokeWeight(1);
            for (let x = 0; x < 800; x += 40) {
              s.line(x, 400, x, 600);
            }
            for (let y = 400; y < 600; y += 40) {
              s.line(0, y, 800, y);
            }
            
            // Columnas griegas
            s.noStroke();
            s.fill("#f0e68c");
            for (let i = 0; i < 4; i++) {
              const x = 150 + i * 200;
              s.rect(x - 10, 300, 20, 100);
              s.rect(x - 15, 300, 30, 10);
              s.rect(x - 12, 395, 24, 5);
            }
            
            // Estatuas decorativas
            s.fill("#a9a9a9");
            s.ellipse(100, 320, 40, 50);
            s.rect(80, 350, 40, 40);
            s.ellipse(700, 320, 40, 50);
            s.rect(680, 350, 40, 40);
            
            // Área central de discusión
            s.fill("#daa520");
            s.circle(400, 350, 120);
            s.fill("#b8860b");
            s.circle(400, 350, 100);
            s.fill("#ffd700");
            s.textSize(20);
            s.textAlign(s.CENTER, s.CENTER);
            s.text("💬", 400, 350);
            
            // Bancas de piedra
            s.fill("#cd853f");
            s.rect(200, 250, 120, 15, 5);
            s.rect(480, 250, 120, 15, 5);
            s.rect(200, 450, 120, 15, 5);
            s.rect(480, 450, 120, 15, 5);
            
            // Lámparas antiguas
            s.fill("#8b4513");
            s.rect(100, 450, 10, 30);
            s.rect(690, 450, 10, 30);
            s.fill("#ffa500");
            s.circle(105, 445, 15);
            s.circle(695, 445, 15);
            
            // Decoración de plantas
            s.fill("#2e8b57");
            s.ellipse(750, 500, 30, 20);
            s.ellipse(50, 500, 30, 20);
            
          }
        };
      };

      p5Ref.current = new p5(sketch, document.getElementById("p5-container"));

      // --- Phaser ---
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: "game-stage",
        transparent: true,
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 }, debug: false },
        },
        scene: { preload, create, update },
      };

      let player;
      let cursors;
      let table;
      let keyA;
      let lastSentPosition = { x: 0, y: 0 };

      function preload() {}

      function create() {
        const floor = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0);
        this.physics.add.existing(floor, true);

        // Configuración de colisiones por mapa
        const walls = [
          this.add.rectangle(400, 5, 800, 10, 0x000000, 0),
          this.add.rectangle(400, 595, 800, 10, 0x000000, 0),
          this.add.rectangle(5, 300, 10, 600, 0x000000, 0),
          this.add.rectangle(795, 300, 10, 600, 0x000000, 0),
        ];
        walls.forEach((w) => this.physics.add.existing(w, true));

        let obstacles = [...walls];

        if (currentMap === "kitchen" || currentMap.startsWith("casa_")) {
          // Obstáculos para cocina/casa
          table = this.add.rectangle(400, 300, 240, 100, 0x000000, 0);
          this.physics.add.existing(table, true);

          const chair1 = this.add.rectangle(330, 350, 35, 35, 0x000000, 0);
          const chair2 = this.add.rectangle(470, 350, 35, 35, 0x000000, 0);
          this.physics.add.existing(chair1, true);
          this.physics.add.existing(chair2, true);

          const stove = this.add.rectangle(20, 280, 150, 130, 0x000000, 0);
          this.physics.add.existing(stove, true);

          obstacles = [...obstacles, table, chair1, chair2, stove];
        } else if (currentMap === "socratic") {
          // SALÓN SOCRÁTICO: Solo bordes
          console.log("🎮 Salón Socrático: Sin obstáculos internos, solo bordes");
        } else if (currentMap === "library") {
          // Biblioteca: algunos obstáculos
          const bookshelf1 = this.add.rectangle(200, 200, 160, 40, 0x000000, 0);
          const bookshelf2 = this.add.rectangle(600, 200, 160, 40, 0x000000, 0);
          const computerArea = this.add.rectangle(400, 425, 600, 50, 0x000000, 0);
          
          this.physics.add.existing(bookshelf1, true);
          this.physics.add.existing(bookshelf2, true);
          this.physics.add.existing(computerArea, true);
          
          obstacles = [...obstacles, bookshelf1, bookshelf2, computerArea];
        }

        // Posición inicial
        player = this.add.circle(150, 300, 16, 0xffffff, 0);
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true, 1, 1, true);
        player.body.setCircle(16);
        player.body.setOffset(-16, -16);
        player.body.setBounce(0.1, 0.1);
        player.body.setDrag(800, 800);
        player.body.setMaxVelocity(200, 200);

        // Configurar colisiones
        obstacles.forEach((obs) => {
          this.physics.add.collider(player, obs, null, null, this);
        });

        // Indicador de interacción para cocina/casa
        if (currentMap === "kitchen" || currentMap.startsWith("casa_")) {
          const exclamation = this.add
            .text(table.x, table.y - 70, "!", {
              font: "48px Arial",
              fill: "#ff0000",
              fontStyle: "bold",
              stroke: "#ffffff",
              strokeThickness: 4
            })
            .setOrigin(0.5, 0.5)
            .setDepth(1000);
          
          window.tableExclamation = exclamation;
        }

        cursors = this.input.keyboard.createCursorKeys();
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        window.phaserScene = this;
        window.phaserPlayer = player;

        this.cameras.main.centerOn(400, 300);
      }

      function update() {
        if (!player || !cursors) return;

        const speed = 180;
        player.body.setVelocity(0);
        
        if (cursors.left.isDown) player.body.setVelocityX(-speed);
        if (cursors.right.isDown) player.body.setVelocityX(speed);
        if (cursors.up.isDown) player.body.setVelocityY(-speed);
        if (cursors.down.isDown) player.body.setVelocityY(speed);

        // Interacción con mesa (solo en cocina/casa)
        if (currentMap === "kitchen" || currentMap.startsWith("casa_")) {
          const distToTable = Phaser.Math.Distance.Between(
            player.x, player.y, 400, 300
          );
          if (distToTable < 90) {
            window.nearTable = true;
            if (Phaser.Input.Keyboard.JustDown(keyA) && !sandwichDone) {
              const ev = new CustomEvent("openSandwich");
              window.dispatchEvent(ev);
            }
          } else {
            window.nearTable = false;
          }
        }

        // Enviar posición al servidor
        const currentPos = { x: Math.round(player.x), y: Math.round(player.y) };
        const distance = Phaser.Math.Distance.Between(
          lastSentPosition.x, lastSentPosition.y, currentPos.x, currentPos.y
        );

        if (distance > 5 && socket) {
          socket.emit("player-move", {
            x: currentPos.x,
            y: currentPos.y,
            currentMap: currentMap
          });
          lastSentPosition = currentPos;
        }

        // Control de visibilidad de signos
        if (window.tableExclamation) {
          const shouldShow = !sandwichDone && (currentMap === "kitchen" || currentMap.startsWith("casa_"));
          window.tableExclamation.setVisible(shouldShow);
          
          if (shouldShow && window.nearTable) {
            window.tableExclamation.setScale(1 + Math.sin(this.time.now / 200) * 0.2);
          } else {
            window.tableExclamation.setScale(1);
          }
        }
      }

      phaserRef.current = new Phaser.Game(config);

      // RAF loop
      const updateSvg = () => {
        try {
          const scene = window.phaserScene;
          const playerObj = window.phaserPlayer;
          const svgEl = svgRef.current;
          if (scene && playerObj && svgEl) {
            const x = playerObj.x;
            const y = playerObj.y;
            svgEl.style.left = `${x}px`;
            svgEl.style.top = `${y}px`;

            const nearTable = !!window.nearTable;
            
            const ev1 = new CustomEvent("nearTableUpdate", { detail: { near: nearTable } });
            
            window.dispatchEvent(ev1);
          }
        } catch (err) {}
        rafRef.current = requestAnimationFrame(updateSvg);
      };
      rafRef.current = requestAnimationFrame(updateSvg);

      const openListener = () => {
        if (!sandwichDone) {
          setShowSandwichMinigame(true);
          setShowPressAHint(false);
          setSandwich([]);
        }
      };
      
      const nearTableListener = (e) => {
        setShowPressAHint(e.detail.near && !sandwichDone && (currentMap === "kitchen" || currentMap.startsWith("casa_")));
      };

      window.addEventListener("openSandwich", openListener);
      window.addEventListener("nearTableUpdate", nearTableListener);

      const cleanup = () => {
        window.removeEventListener("openSandwich", openListener);
        window.removeEventListener("nearTableUpdate", nearTableListener);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
      phaserRef.currentCleanup = cleanup;
    }

    return () => {
      if (phaserRef.current) {
        if (phaserRef.currentCleanup) phaserRef.currentCleanup();
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
      if (p5Ref.current) {
        try {
          p5Ref.current.remove();
          p5Ref.current = null;
        } catch (e) {}
      }
    };
  }, [step, color, sandwichDone, currentMap, socket]);

  // Scale / responsive handling
  useEffect(() => {
    const updateScale = () => {
      const wrapper = containerRef.current;
      const stage = stageRef.current;
      if (!wrapper || !stage) return;

      const maxW = Math.min(window.innerWidth * 0.95, 1000);
      const maxH = Math.min(window.innerHeight * 0.72, 800);
      const scale = Math.max(0.45, Math.min(maxW / 800, maxH / 600));

      wrapper.style.width = `${Math.round(Math.min(maxW, 800 * scale))}px`;
      wrapper.style.height = `${Math.round(Math.min(maxH, 600 * scale))}px`;

      stage.style.width = `800px`;
      stage.style.height = `600px`;
      stage.style.transformOrigin = "0 0";
      stage.style.transform = `scale(${scale})`;
      stage.dataset.scale = String(scale);

      const visualW = 800 * scale;
      const visualH = 600 * scale;
      stage.style.marginLeft = `${Math.round(
        (wrapper.clientWidth - visualW) / 2 / scale
      )}px`;
      stage.style.marginTop = `${Math.round(
        (wrapper.clientHeight - visualH) / 2 / scale
      )}px`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  function onDragStart(e, ing) {
    e.dataTransfer.setData("ingredient", JSON.stringify(ing));
  }

  function onDrop(e) {
    e.preventDefault();
    const ing = JSON.parse(e.dataTransfer.getData("ingredient"));
    setSandwich((prev) => [...prev, ing]);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  // ---------- UI render ----------
  if (step === "login") {
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
        {serverIP !== "localhost" && (
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            🌐 Conectado al servidor: {serverIP}
          </div>
        )}
        <input
          placeholder="Ingresa tu nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "2px solid #333",
            marginBottom: "10px",
            width: "250px"
          }}
        />
        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "2px solid #333",
            marginBottom: "10px",
            width: "250px"
          }}
        />
        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          disabled={!username || !password}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#333",
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          {isRegistering ? "Registrarse" : "Iniciar Sesión"}
        </button>
        
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            color: "#333",
            border: "1px solid #333",
          }}
        >
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
    );
  }

  if (step === "customize") {
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
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="40"
              fill={numToCssHex(color)}
              stroke="#000"
              strokeWidth="3"
            />
            <circle cx="48" cy="54" r="5" fill="#000" />
            <circle cx="72" cy="54" r="5" fill="#000" />
            <path
              d="M48 70 Q60 80 72 70"
              stroke="#000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
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
              onClick={() => setColor(hex)}
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
          onClick={() => setStep("world")}
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

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(to top, #87ceeb, #ffffff)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 12,
      }}
    >
      <h2 style={{ textAlign: "center" }}>
        Hola {username}! 
        {currentMap === "kitchen" ? " Cocina" : 
         currentMap.startsWith("casa_") ? " Mi Casa" :
         currentMap === "library" ? " Biblioteca" : 
         " Salón Socrático"} - Muévete con las flechas.
        {Object.values(otherPlayers).filter(p => p.currentMap === currentMap).length > 0 && 
          ` - Jugadores en esta área: ${Object.values(otherPlayers).filter(p => p.currentMap === currentMap).length + 1}`
        }
      </h2>
      
      {/* Información del servidor */}
      {serverIP !== "localhost" && (
        <div style={{
          background: '#2196F3',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          marginBottom: '10px',
          fontSize: '14px'
        }}>
          🌐 Servidor: {serverIP} | {socketStatus === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'} | 
          Jugadores: {Object.keys(otherPlayers).length + 1}
        </div>
      )}

      {/* Botones de Navegación */}
      <div style={{
        position: 'absolute',
        top: '70px',
        left: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <button 
          onClick={() => setShowMap(true)}
          style={{
            padding: '10px 15px',
            background: '#3498db',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          🗺️ Mapa
        </button>
        
        <button 
          onClick={() => setShowProfile(true)}
          style={{
            padding: '10px 15px',
            background: '#9b59b6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          👤 Perfil
        </button>
      </div>

      <div
        ref={containerRef}
        id="phaser-wrapper"
        style={{
          position: "relative",
          margin: "12px auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          borderRadius: 12,
          overflow: "hidden",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={stageRef}
          id="game-stage"
          style={{
            width: 800,
            height: 600,
            position: "relative",
          }}
        >
          <div
            id="p5-container"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 0,
            }}
          />
          
          {/* JUGADOR PRINCIPAL */}
          <div
            ref={svgRef}
            id="svg-player"
            style={{
              position: "absolute",
              left: 150,
              top: 300,
              width: 64,
              height: 64,
              transform: "translate(-50%,-50%)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 100 100" width="64" height="64">
              <defs>
                <filter
                  id="shadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="2"
                    floodColor="#000"
                    floodOpacity="0.18"
                  />
                </filter>
              </defs>
              
              {/* Cuerpo del personaje */}
              <g id="body">
                <circle
                  cx="50"
                  cy="44"
                  r="24"
                  fill={numToCssHex(color)}
                  stroke="#111"
                  strokeWidth="1.8"
                  filter="url(#shadow)"
                />
                <g id="eyes" transform="translate(0,0)">
                  <circle cx="42" cy="40" r="3.7" fill="#000" />
                  <circle cx="58" cy="40" r="3.7" fill="#000" />
                </g>
                <path
                  d="M40 52 Q50 60 60 52"
                  stroke="#111"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
              
              {/* Sombrero seleccionado */}
              {selectedHat && (
                <g id="hat" transform="translate(0, -5)">
                  {selectedHat.id === 1 && ( // Gorro de Graduado
                    <>
                      <rect x="20" y="15" width="60" height="12" fill="#1a1a1a" />
                      <rect x="25" y="27" width="50" height="6" fill="#0f0f0f" />
                      <path d="M25 15 Q50 5 75 15" fill="none" stroke="#ffd700" strokeWidth="3" />
                    </>
                  )}
                  {selectedHat.id === 2 && ( // Corona
                    <>
                      <path d="M25 20 L35 12 L45 20 L43 25 L57 25 L55 20 L65 12 L75 20 L70 32 L30 32 Z" fill="#ffd700" stroke="#ff6b00" strokeWidth="1.5" />
                      <circle cx="35" cy="18" r="2" fill="#ff6b00" />
                      <circle cx="50" cy="15" r="2" fill="#ff6b00" />
                      <circle cx="65" cy="18" r="2" fill="#ff6b00" />
                    </>
                  )}
                  {selectedHat.id === 3 && ( // Sombrero de Copa
                    <>
                      <rect x="25" y="10" width="50" height="6" fill="#2c2c2c" />
                      <ellipse cx="50" cy="20" rx="30" ry="8" fill="#1a1a1a" />
                      <rect x="40" y="20" width="20" height="2" fill="#333" />
                    </>
                  )}
                  {selectedHat.id === 4 && ( // Gorra Deportiva
                    <>
                      <path d="M20 18 Q50 8 80 18 L75 28 L25 28 Z" fill="#e74c3c" />
                      <rect x="30" y="18" width="40" height="4" fill="#c0392b" />
                      <rect x="45" y="22" width="10" height="3" fill="#fff" />
                    </>
                  )}
                  {selectedHat.id === 5 && ( // Casco de Seguridad
                    <>
                      <path d="M25 15 Q50 5 75 15 Q75 30 50 35 Q25 30 25 15" fill="#e74c3c" />
                      <rect x="40" y="20" width="20" height="8" fill="#2c3e50" />
                      <rect x="45" y="28" width="10" height="2" fill="#34495e" />
                    </>
                  )}
                  {selectedHat.id === 6 && ( // Gorra Béisbol
                    <>
                      <path d="M20 17 Q50 7 80 17 L75 27 L25 27 Z" fill="#3498db" />
                      <rect x="30" y="17" width="40" height="4" fill="#2980b9" />
                      <path d="M45 21 L55 21 L55 24 L45 24 Z" fill="#fff" />
                    </>
                  )}
                </g>
              )}
              
              <g id="arms" transform="translate(0,0)">
                <line
                  x1="22"
                  y1="50"
                  x2="6"
                  y2="66"
                  stroke="#111"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="78"
                  y1="50"
                  x2="94"
                  y2="66"
                  stroke="#111"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
              <g id="legs">
                <line
                  x1="42"
                  y1="68"
                  x2="36"
                  y2="86"
                  stroke="#111"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="58"
                  y1="68"
                  x2="64"
                  y2="86"
                  stroke="#111"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* OTROS JUGADORES */}
          {renderOtherPlayers()}
        </div>
      </div>

      {/* Panel de información */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "#333",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        💰 {money}
      </div>

      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "#2c3e50",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        🧠 {educationalPoints}
      </div>

      {/* Botón de Logros */}
      <button 
        onClick={() => setShowAchievements(true)}
        style={{
          position: 'absolute',
          top: 70,
          right: 20,
          background: '#ff6b35',
          color: '#fff',
          padding: '10px 15px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: 16,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        🏆 Trofeos ({trofeos.total})
      </button>

      {/* Interfaz de Chat */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '300px',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '10px',
        padding: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '2px solid #4CAF50',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <h4 style={{ margin: 0, color: '#2E7D32' }}>💬 Chat</h4>
          <button 
            onClick={() => setShowChat(!showChat)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {showChat ? '▲' : '▼'}
          </button>
        </div>
        
        {showChat && (
          <>
            <div style={{
              height: '120px',
              overflowY: 'auto',
              marginBottom: '8px',
              padding: '5px',
              background: '#f5f5f5',
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                Escribe un mensaje para comenzar a chatear...
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                onFocus={() => {
                  if (window.phaserScene && window.phaserScene.input) {
                    window.phaserScene.input.keyboard.enabled = false;
                  }
                }}
                onBlur={() => {
                  if (window.phaserScene && window.phaserScene.input) {
                    window.phaserScene.input.keyboard.enabled = true;
                  }
                }}
                placeholder="Escribe tu mensaje..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif'
                }}
                maxLength={100}
              />
              <button
                onClick={sendMessage}
                disabled={!chatMessage.trim()}
                style={{
                  padding: '8px 16px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: chatMessage.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Enviar
              </button>
            </div>
            
            <div style={{
              fontSize: '11px',
              color: '#666',
              marginTop: '5px',
              textAlign: 'center'
            }}>
              Haz clic en el input para escribir • Máx. 100 caracteres
            </div>
          </>
        )}
      </div>

      {/* Hints */}
      {showPressAHint && !showSandwichMinigame && !sandwichDone && (currentMap === "kitchen" || currentMap.startsWith("casa_")) && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          Presiona <b>A</b> para hacer sandwich
        </div>
      )}

      {/* Mensaje de sandwich completado */}
      {showSandwichMessage && (currentMap === "kitchen" || currentMap.startsWith("casa_")) && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "green",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 100
          }}
        >
          <span>✅ ¡Sandwich completado! +5 monedas</span>
          <button 
            onClick={() => setShowSandwichMessage(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* BIBLIOTECA - INTERFAZ MEJORADA */}
      {currentMap === "library" && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '25px',
          borderRadius: '15px',
          zIndex: 100,
          width: '500px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '3px solid #3498db'
        }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>📚 Biblioteca Educativa</h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            flexDirection: 'column', 
            marginBottom: '20px' 
          }}>
            {/* Minijuego de Programación */}
            <div style={{
              padding: '15px',
              background: '#e8f4fd',
              borderRadius: '10px',
              border: '2px solid #3498db'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🧠 Minijuego de Programación</h3>
              <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                Aprende programación con lecciones interactivas estilo Duolingo
              </p>
              <button 
                onClick={() => {
                  if (money >= 5) {
                    setMoney(money - 5);
                    setCurrentLesson('programming');
                    audioService.playCoinSound();
                  }
                }}
                disabled={money < 5}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: money >= 5 ? '#3498db' : '#95a5a6',
                  color: 'white',
                  border: 'none',
                  cursor: money >= 5 ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  width: '100%'
                }}
              >
                {money >= 5 ? '🎮 Jugar (5 monedas)' : '❌ Necesitas 5 monedas'}
              </button>
            </div>
          </div>
          
          <div style={{ 
            padding: '12px', 
            background: '#ecf0f1', 
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span><strong>💰 Monedas:</strong> {money}</span>
              <span><strong>🧠 Puntos Educativos:</strong> {educationalPoints}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Completa actividades para ganar más puntos y monedas
            </div>
          </div>
          
          <button onClick={() => setCurrentMap(playerHouse || "kitchen")} style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            🚪 Volver a la Cocina
          </button>
        </div>
      )}

      {/* Modal del sandwich */}
      {showSandwichMinigame && !sandwichDone && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div
            style={{
              width: 400,
              background: "#fff",
              border: "3px solid #333",
              padding: 20,
              borderRadius: 12,
              position: 'relative'
            }}
          >
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>🥪 Arma tu Sandwich</h3>
            
            <div style={{
              textAlign: 'center',
              marginBottom: 10,
              padding: '5px 10px',
              backgroundColor: sandwich.length === 4 ? '#4caf50' : '#ff9800',
              color: 'white',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 'bold'
            }}>
              Ingredientes: {sandwich.length}/4
              {sandwich.length === 4 && ' ✅ Listo!'}
            </div>
            
            <div
              onDrop={onDrop}
              onDragOver={allowDrop}
              style={{
                minHeight: 160,
                border: "2px dashed #ccc",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                padding: 15,
                background: "#fbfbfb",
                marginBottom: 15
              }}
            >
              <div
                style={{
                  width: 160,
                  height: 22,
                  background: "#deb887",
                  borderRadius: "6px 6px 0 0",
                  margin: "3px 0",
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              
              {sandwich.map((ing, i) => (
                <div
                  key={i}
                  style={{
                    width: 160,
                    height: 20,
                    background: ing.color,
                    borderRadius: 4,
                    margin: "4px 0",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                  title={ing.name}
                >
                  {ing.name.split(" ")[1]}
                </div>
              ))}
              
              <div
                style={{
                  width: 160,
                  height: 22,
                  background: "#deb887",
                  borderRadius: "0 0 6px 6px",
                  margin: "3px 0",
                  boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </div>
            
            <div style={{ marginBottom: 15 }}>
              <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Ingredientes Disponibles</h4>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {ingredients.map((ing) => (
                  <div
                    key={ing.name}
                    draggable
                    onDragStart={(e) => onDragStart(e, ing)}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 10,
                      background: ing.color,
                      display: "flex",
                      flexDirection: 'column',
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      cursor: "grab",
                      border: '2px solid #333',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title={ing.name}
                  >
                    {ing.name.split(" ")[0]}
                    <div style={{ fontSize: 10, color: 'white', marginTop: 2 }}>
                      {ing.name.split(" ")[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginTop: 12,
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={finishSandwich}
                disabled={sandwich.length !== 4}
                style={{
                  padding: "10px 20px",
                  background: sandwich.length === 4 ? "#4caf50" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: sandwich.length === 4 ? "pointer" : "not-allowed",
                  fontWeight: 'bold',
                  minWidth: 140
                }}
              >
                {sandwich.length === 4 ? "✅ Terminar Sandwich" : "Completar Ingredientes"}
              </button>
              
              <button
                onClick={resetSandwich}
                style={{
                  padding: "10px 15px",
                  background: "#ff9800",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                🔄 Reiniciar
              </button>
              
              <button
                onClick={() => {
                  setShowSandwichMinigame(false);
                  resetSandwich();
                }}
                style={{
                  padding: "10px 15px",
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                ❌ Cancelar
              </button>
            </div>
            
            <div style={{
              marginTop: 15,
              padding: 10,
              background: '#e3f2fd',
              borderRadius: 8,
              fontSize: 12,
              textAlign: 'center'
            }}>
              💡 <strong>Instrucciones:</strong> Arrastra todos los ingredientes al sandwich
            </div>
          </div>
        </div>
      )}

      {/* Modal para EducationalGame */}
      {currentLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <EducationalGame 
            onComplete={handleLessonComplete}
            cost={5}
            username={username}
          />
        </div>
      )}

      {/* Modal para Logros y Misiones */}
      {showAchievements && (
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
            onClick={() => setShowAchievements(false)}
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
      )}

      {/* Modales */}
      {showMap && <MapModal />}
      {showProfile && <ProfileModal />}
    </div>
  );
}