import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import p5 from "p5";
import EducationalGame from "./components/EducationalGame";
import QuizComponent from "./components/QuizComponent";
import { audioService } from "./services/audioService";

export default function App() {
  const [step, setStep] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [color, setColor] = useState(null);
  const [showSandwichMinigame, setShowSandwichMinigame] = useState(false);
  const [showPressAHint, setShowPressAHint] = useState(false);
  const [sandwich, setSandwich] = useState([]);
  const [sandwichDone, setSandwichDone] = useState(null);
  const [money, setMoney] = useState(null);
  const [currentMap, setCurrentMap] = useState("kitchen");
  const [educationalPoints, setEducationalPoints] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showPressEHint, setShowPressEHint] = useState(false);
  const [showSandwichMessage, setShowSandwichMessage] = useState(false); // NUEVO ESTADO
  
  // Nuevos estados para logros y misiones
  const [logros, setLogros] = useState([]);
  const [misiones, setMisiones] = useState([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [trofeos, setTrofeos] = useState({
    bronce: 0,
    plata: 0,
    oro: 0,
    total: 0
  });

  const phaserRef = useRef(null);
  const p5Ref = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  const MONGODB_API = "http://localhost:4001";
  const ACHIEVEMENTS_API = "http://localhost:2001";

  // --------------------------- 
  // MONGODB: Login y Registro
  // --------------------------- 
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
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        
        setColor(data.user.color);
        setMoney(data.user.money);
        setSandwichDone(data.user.sandwichDone);
        setEducationalPoints(data.user.educationalPoints);
        if (data.user.trofeos) setTrofeos(data.user.trofeos);
        setStep("world");
        
        // Cargar logros y misiones
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
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        
        setColor(data.user.color);
        setMoney(data.user.money);
        setSandwichDone(data.user.sandwichDone);
        setEducationalPoints(data.user.educationalPoints);
        if (data.user.trofeos) setTrofeos(data.user.trofeos);
        setStep("customize");
        
        // Inicializar sistema de logros
        inicializarJugador();
      } else {
        alert(data.error || "Error en registro");
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      alert("Error de conexión con el servidor");
    }
  };

  // --------------------------- 
  // MONGODB: Guardar datos automáticamente
  // --------------------------- 
  useEffect(() => {
    const saveUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token || !username) return;

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
            trofeos 
          }),
        });
      } catch (error) {
        console.error("❌ Error guardando datos:", error);
      }
    };

    if (username && step === "world") {
      saveUserData();
    }
  }, [username, color, money, sandwichDone, educationalPoints, trofeos, step]);

  // ---------------------------
  // SISTEMA DE LOGROS Y MISIONES
  // ---------------------------
  const loadAchievementsData = async () => {
    try {
      const response = await fetch(`${ACHIEVEMENTS_API}/estado/${username}`);
      const estado = await response.json();
      if (estado) {
        setLogros(estado.logros);
        setMisiones(estado.misiones);
        setTrofeos(estado.trofeos || { bronce: 0, plata: 0, oro: 0, total: 0 });
        
        // Sincronizar con MongoDB
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
      // Recargar datos después de inicializar
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

  // Cargar datos al entrar al mundo
  useEffect(() => {
    if (username && step === "world") {
      loadAchievementsData();
    }
  }, [username, step]);

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

  // ---------- FUNCIONES DE LOGROS CON TROFEOS ----------
  const finishSandwich = async () => {
    // Verificar que se hayan usado todos los ingredientes
    const requiredIngredients = 4; // Lechuga, Tomate, Queso, Carne
    const hasAllIngredients = sandwich.length === requiredIngredients;
    
    if (!hasAllIngredients) {
      alert(`❌ Necesitas usar todos los ingredientes para completar el sandwich!\nTe faltan ${requiredIngredients - sandwich.length} ingredientes.`);
      audioService.playErrorSound();
      return;
    }
    
    // CORRECCIÓN: sandwichDone se mantiene en true permanentemente
    setSandwichDone(true);
    setShowSandwichMinigame(false);
    setShowSandwichMessage(true); // Mostrar mensaje
    setMoney((prev) => prev + 5);
    audioService.playCoinSound();
    
    await checkSandwichAchievements();
  };

  // Agregar función para resetear el sandwich
  const resetSandwich = () => {
    setSandwich([]);
  };

  const checkSandwichAchievements = async () => {
    try {
      // Misión 1: Chef Novato
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/1/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      // Logro 1: Primer Sandwich
      const logroSandwich = logros.find(l => l.nombre.includes("Sandwich"));
      if (logroSandwich && !logroSandwich.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroSandwich.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData(); // Recargar para actualizar trofeos
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
      // Misión 2: Aprendiz del Saber
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/2/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      // Logro educativo
      const logroEducacion = logros.find(l => l.nombre.includes("Estudiante"));
      if (logroEducacion && !logroEducacion.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroEducacion.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData(); // Recargar para actualizar trofeos
        }
      }
    } catch (error) {
      console.error("Error actualizando logros educativos:", error);
    }
  };

  const handleQuizComplete = async (points) => {
    setEducationalPoints(prev => prev + points);
    setCurrentQuiz(null);
    audioService.playSuccessSound();
    
    await checkQuizAchievements();
  };

  const checkQuizAchievements = async () => {
    try {
      // Misión 4: Maestro de Quizzes
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/4/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      // Logro de quiz
      const logroQuiz = logros.find(l => l.nombre.includes("Campeón") || l.nombre.includes("Conocimiento"));
      if (logroQuiz && !logroQuiz.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroQuiz.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData(); // Recargar para actualizar trofeos
        }
      }
    } catch (error) {
      console.error("Error actualizando logros de quiz:", error);
    }
  };

  const handleEnterLibrary = () => {
    setCurrentMap("library");
    audioService.playSuccessSound();
    checkLibraryAchievements();
  };

  const checkLibraryAchievements = async () => {
    try {
      // Misión 3: Explorador Académico
      const responseMision = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/3/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento: 1 }),
      });
      
      const resultadoMision = await responseMision.json();
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      // Logro de exploración
      const logroExploracion = logros.find(l => l.nombre.includes("Explorador"));
      if (logroExploracion && !logroExploracion.completado) {
        const responseLogro = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroExploracion.id}/completar`, {
          method: 'PATCH',
        });
        
        const logroCompletado = await responseLogro.json();
        if (logroCompletado) {
          audioService.playSuccessSound();
          loadAchievementsData(); // Recargar para actualizar trofeos
        }
      }
    } catch (error) {
      console.error("Error actualizando logros de biblioteca:", error);
    }
  };

  // ---------- INITIALIZE p5 + Phaser when entering world ----------
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
          
          if (currentMap === "kitchen") {
            // Cocina
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
            s.rect(90, 280, 140, 120, 6);
            s.fill("#333");
            s.rect(90, 250, 100, 20, 4);
            s.fill("#8b0000");
            s.rect(90, 260, 40, 20, 4);
            const t = s.millis() / 800;
            s.noFill();
            s.stroke("#ffffff88");
            s.strokeWeight(2);
            for (let i = 0; i < 3; i++) {
              const yy = 235 - ((t + i * 0.6) % 1) * 30;
              s.ellipse(90, yy, 12, 8);
            }
            s.pop();

            // Estantes
            s.push();
            s.fill("#b3c8a6");
            s.rect(700, 160, 140, 60, 6);
            s.fill("#8b5a2b");
            s.rect(700, 200, 30, 30, 6);
            s.pop();

            // Puerta Biblioteca
            s.push();
            s.fill("#8B4513");
            s.rect(700, 160, 60, 80, 5);
            s.fill("#654321");
            s.rect(730, 200, 8, 4);
            s.pop();

          } else if (currentMap === "library") {
            // Biblioteca
            s.background("#2c3e50");
            
            // Estantes de libros
            s.fill("#8B4513");
            for (let i = 0; i < 5; i++) {
              s.rect(100 + i * 120, 100, 80, 200, 5);
              // Libros
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
            
            // Mesa de quiz
            s.fill("#16a085");
            s.rect(300, 200, 200, 80, 5);
            s.fill("#1abc9c");
            s.textSize(16);
            s.textAlign(s.CENTER, s.CENTER);
            s.text("📝 Área de Quizzes", 400, 240);
            
            // Puerta de regreso
            s.fill("#8B4513");
            s.rect(50, 300, 60, 80, 5);
            s.fill("#fff");
            s.textSize(12);
            s.text("Salir", 80, 340);
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
      let keyA, keyE;

      function preload() {}

      function create() {
        const floor = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0);
        this.physics.add.existing(floor, true);

        // Mejorar las paredes con mejores colisiones
        const walls = [
          this.add.rectangle(400, 5, 800, 10, 0x000000, 0),   // Top
          this.add.rectangle(400, 595, 800, 10, 0x000000, 0), // Bottom
          this.add.rectangle(5, 300, 10, 600, 0x000000, 0),   // Left
          this.add.rectangle(795, 300, 10, 600, 0x000000, 0), // Right
        ];
        walls.forEach((w) => this.physics.add.existing(w, true));

        // Mesa - colisión más precisa
        table = this.add.rectangle(400, 300, 240, 100, 0x000000, 0);
        this.physics.add.existing(table, true);

        // Sillas - colisiones mejoradas
        const chair1 = this.add.rectangle(330, 350, 35, 35, 0x000000, 0);
        const chair2 = this.add.rectangle(470, 350, 35, 35, 0x000000, 0);
        this.physics.add.existing(chair1, true);
        this.physics.add.existing(chair2, true);

        // CORRECCIÓN: Estufa con colisión normal - se puede pasar a los lados
        const stove = this.add.rectangle(90, 280, 150, 130, 0x000000, 0);
        this.physics.add.existing(stove, true);

        // Puerta biblioteca - mejor colocación
        const libraryDoor = this.add.rectangle(700, 200, 70, 90, 0x000000, 0);
        this.physics.add.existing(libraryDoor, true);

        // Puerta salida biblioteca
        const exitDoor = this.add.rectangle(80, 340, 70, 90, 0x000000, 0);
        this.physics.add.existing(exitDoor, true);

        // Player con mejor configuración de física
        player = this.add.circle(50, 300, 16, 0xffffff, 0);
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true, 1, 1, true);
        player.body.setCircle(16);
        player.body.setOffset(-16, -16);
        
        // Mejorar las propiedades físicas del jugador
        player.body.setBounce(0.1, 0.1);
        player.body.setDrag(800, 800);
        player.body.setMaxVelocity(200, 200);

        const obstacles = [...walls, table, chair1, chair2, stove, libraryDoor, exitDoor];
        obstacles.forEach((obs) => {
          // Configurar colisiones más suaves
          this.physics.add.collider(player, obs, null, null, this);
        });

        // Signo de exclamación - MEJORAR VISIBILIDAD
        const exclamation = this.add
          .text(table.x, table.y - 70, "!", {
            font: "48px Arial",
            fill: "#ff0000",
            fontStyle: "bold",
            stroke: "#ffffff",
            strokeThickness: 4
          })
          .setOrigin(0.5, 0.5)
          .setDepth(1000); // Alto z-index para asegurar visibilidad
        
        window.tableExclamation = exclamation;

        const librarySign = this.add
          .text(libraryDoor.x, libraryDoor.y - 70, "📚", {
            font: "32px Arial",
            stroke: "#000000",
            strokeThickness: 3
          })
          .setOrigin(0.5, 0.5)
          .setDepth(1000);
        
        window.librarySign = librarySign;

        cursors = this.input.keyboard.createCursorKeys();
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        window.phaserScene = this;
        window.phaserPlayer = player;

        this.cameras.main.centerOn(400, 300);
      }

      function update() {
        if (!player || !cursors) return;

        const speed = 180;
        player.body.setVelocity(0);
        
        // Movimiento más suave
        if (cursors.left.isDown) player.body.setVelocityX(-speed);
        if (cursors.right.isDown) player.body.setVelocityX(speed);
        if (cursors.up.isDown) player.body.setVelocityY(-speed);
        if (cursors.down.isDown) player.body.setVelocityY(speed);

        // CORRECCIÓN: Interacción con mesa - SOLO si sandwich no está hecho
        const distToTable = Phaser.Math.Distance.Between(
          player.x, player.y, table.x, table.y
        );
        if (distToTable < 90 && currentMap === "kitchen") {
          window.nearTable = true;
          // CORRECCIÓN: Solo permitir abrir el minijuego si sandwichDone es false
          if (Phaser.Input.Keyboard.JustDown(keyA) && !sandwichDone) {
            const ev = new CustomEvent("openSandwich");
            window.dispatchEvent(ev);
          }
        } else {
          window.nearTable = false;
        }

        // Interacción con puerta biblioteca
        const distToLibrary = Phaser.Math.Distance.Between(
          player.x, player.y, 700, 200
        );
        if (distToLibrary < 60 && currentMap === "kitchen") {
          window.nearLibraryDoor = true;
          if (Phaser.Input.Keyboard.JustDown(keyE)) {
            const ev = new CustomEvent("enterLibrary");
            window.dispatchEvent(ev);
          }
        } else {
          window.nearLibraryDoor = false;
        }

        // Interacción con puerta salida
        const distToExit = Phaser.Math.Distance.Between(
          player.x, player.y, 80, 340
        );
        if (distToExit < 60 && currentMap === "library") {
          window.nearExitDoor = true;
          if (Phaser.Input.Keyboard.JustDown(keyE)) {
            const ev = new CustomEvent("exitLibrary");
            window.dispatchEvent(ev);
          }
        } else {
          window.nearExitDoor = false;
        }

        // Control de visibilidad del signo de exclamación
        if (window.tableExclamation) {
          // CORRECCIÓN: Solo mostrar si sandwich no está hecho
          const shouldShow = !sandwichDone && currentMap === "kitchen";
          window.tableExclamation.setVisible(shouldShow);
          
          // Efecto de animación parpadeante cuando está cerca
          if (shouldShow && window.nearTable) {
            window.tableExclamation.setScale(1 + Math.sin(this.time.now / 200) * 0.2);
          } else {
            window.tableExclamation.setScale(1);
          }
        }
        
        if (window.librarySign) {
          window.librarySign.setVisible(currentMap === "kitchen");
        }
      }

      phaserRef.current = new Phaser.Game(config);

      // RAF loop
      const updateSvg = () => {
        try {
          const scene = window.phaserScene;
          const playerObj = window.phaserPlayer;
          const svgEl = svgRef.current;
          const stageEl = stageRef.current;
          if (scene && playerObj && svgEl && stageEl) {
            const x = playerObj.x;
            const y = playerObj.y;
            svgEl.style.left = `${x}px`;
            svgEl.style.top = `${y}px`;

            const nearTable = !!window.nearTable;
            const nearLibrary = !!window.nearLibraryDoor;
            const nearExit = !!window.nearExitDoor;
            
            const ev1 = new CustomEvent("nearTableUpdate", { detail: { near: nearTable } });
            const ev2 = new CustomEvent("nearLibraryUpdate", { detail: { near: nearLibrary } });
            const ev3 = new CustomEvent("nearExitUpdate", { detail: { near: nearExit } });
            
            window.dispatchEvent(ev1);
            window.dispatchEvent(ev2);
            window.dispatchEvent(ev3);
          }
        } catch (err) {}
        rafRef.current = requestAnimationFrame(updateSvg);
      };
      rafRef.current = requestAnimationFrame(updateSvg);

      const openListener = () => {
        // CORRECCIÓN: Solo abrir si sandwich no está hecho
        if (!sandwichDone) {
          setShowSandwichMinigame(true);
          setShowPressAHint(false);
          setSandwich([]);
        }
      };
      
      const nearTableListener = (e) => {
        // CORRECCIÓN: Solo mostrar hint si sandwich no está hecho
        setShowPressAHint(e.detail.near && !sandwichDone && currentMap === "kitchen");
      };
      
      const nearLibraryListener = (e) => {
        setShowPressEHint(e.detail.near && currentMap === "kitchen");
      };
      
      const enterLibraryListener = () => {
        handleEnterLibrary();
      };
      
      const exitLibraryListener = () => {
        setCurrentMap("kitchen");
        audioService.playSuccessSound();
      };

      window.addEventListener("openSandwich", openListener);
      window.addEventListener("nearTableUpdate", nearTableListener);
      window.addEventListener("nearLibraryUpdate", nearLibraryListener);
      window.addEventListener("enterLibrary", enterLibraryListener);
      window.addEventListener("exitLibrary", exitLibraryListener);

      const cleanup = () => {
        window.removeEventListener("openSandwich", openListener);
        window.removeEventListener("nearTableUpdate", nearTableListener);
        window.removeEventListener("nearLibraryUpdate", nearLibraryListener);
        window.removeEventListener("enterLibrary", enterLibraryListener);
        window.removeEventListener("exitLibrary", exitLibraryListener);
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
  }, [step, color, sandwichDone, currentMap]);

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
        Hola {username}! {currentMap === "kitchen" ? "Cocina" : "Biblioteca"} - Muévete con las flechas.
      </h2>
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
          <div
            ref={svgRef}
            id="svg-player"
            style={{
              position: "absolute",
              left: 50,
              top: 300,
              width: 64,
              height: 64,
              transform: "translate(-50%,-50%)",
              zIndex: 2,
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

      {/* CORRECCIÓN: Solo mostrar hint si sandwich no está hecho */}
      {showPressAHint && !showSandwichMinigame && !sandwichDone && currentMap === "kitchen" && (
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

      {showPressEHint && currentMap === "kitchen" && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16a085",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          Presiona <b>E</b> para entrar a la biblioteca
        </div>
      )}

      {/* CORRECCIÓN: Mensaje de sandwich completado - con estado separado para mostrar/ocultar */}
      {showSandwichMessage && currentMap === "kitchen" && (
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
            onClick={() => setShowSandwichMessage(false)} // CORRECCIÓN: Funciona correctamente
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

      {currentMap === "library" && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 100,
          width: '400px',
          textAlign: 'center'
        }}>
          <h2>📚 Biblioteca Educativa</h2>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginBottom: '20px' }}>
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
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: money >= 5 ? '#3498db' : '#95a5a6',
                color: 'white',
                border: 'none',
                cursor: money >= 5 ? 'pointer' : 'not-allowed'
              }}
            >
              🧠 Minijuego de Programación (5 monedas)
            </button>
            
            <button 
              onClick={() => setCurrentQuiz('computer_science')}
              disabled={educationalPoints < 10}
              style={{
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: educationalPoints >= 10 ? '#9b59b6' : '#95a5a6',
                color: 'white',
                border: 'none',
                cursor: educationalPoints >= 10 ? 'pointer' : 'not-allowed'
              }}
            >
              📝 Tomar Quiz CS (Requiere 10 puntos)
            </button>
            
            <button onClick={() => {
              setCurrentMap('kitchen');
              audioService.playSuccessSound();
            }} style={{
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}>
              🚪 Volver a la Cocina
            </button>
          </div>
          
          <div style={{ marginTop: '10px', padding: '10px', background: '#ecf0f1', borderRadius: '5px' }}>
            <strong>Puntos Educativos:</strong> {educationalPoints}
          </div>
        </div>
      )}

      {/* Modal del sandwich - CORRECCIÓN: Solo mostrar si sandwich no está hecho */}
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
            
            {/* Contador de ingredientes */}
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
              {/* Pan superior */}
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
              
              {/* Pan inferior */}
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
            
            {/* Área de ingredientes */}
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
            
            {/* Instrucciones */}
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
          />
        </div>
      )}

      {/* Modal para QuizComponent */}
      {currentQuiz && (
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
          <QuizComponent 
            topic={currentQuiz}
            onComplete={handleQuizComplete}
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
    </div>
  );
}