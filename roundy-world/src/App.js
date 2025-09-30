import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import p5 from "p5";

/*
  CÓMO SE TRABAJÓ REDIS PARA GUARDAR SESIÓN

  1. ESTRUCTURA DE DATOS
  En Redis se guarda cada usuario con una clave tipo "session:username" que contiene 
  un JSON con sus datos (color del personaje, dinero, si completó el minijuego).

  2. FLUJO DE CARGA
  Cuando el usuario hace login, el cliente React hace una petición GET al servidor 
  Express, que consulta Redis. Si encuentra datos, los devuelve y React los restaura. 
  Si no existe, inicializa valores por defecto y lo envía a personalizar su personaje.

  3. AUTO-GUARDADO
  Se usa un useEffect en React que escucha cambios en los estados (color, money, 
  sandwichDone). Cada vez que cambia alguno, automáticamente envía un POST al 
  servidor para actualizar Redis.

  4. TECNOLOGÍA
  Se usó redis-mock para desarrollo, que simula Redis en memoria sin necesidad de 
  instalar un servidor Redis real. Los datos se pierden al reiniciar el servidor 
  pero es ideal para testing.

  El resultado es un sistema donde el usuario nunca pierde su progreso y todo se 
  guarda automáticamente sin botones manuales.
*/

export default function App() {
  const [step, setStep] = useState("login");
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(null);
  const [showSandwichMinigame, setShowSandwichMinigame] = useState(false);
  const [showPressAHint, setShowPressAHint] = useState(false);
  const [sandwich, setSandwich] = useState([]);
  const [sandwichDone, setSandwichDone] = useState(null);
  const [money, setMoney] = useState(null);

  const phaserRef = useRef(null);
  const p5Ref = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  // --------------------------- 
  // REDIS: Recuperar sesión al hacer login
  // --------------------------- 
  const handleLogin = async () => {
    if (!username) return;
    try {
      const res = await fetch(`http://localhost:4000/session/${username}`);
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        // Usuario existente → restaurar sesión
        setColor(data.color ?? 0xff0000);
        setMoney(data.money ?? 0);
        setSandwichDone(data.sandwichDone ?? false);
        setStep("world"); // ir directo al mundo
      } else {
        // Usuario nuevo → inicializamos valores y vamos a personalización
        setColor(0xff0000);
        setMoney(0);
        setSandwichDone(false);
        setStep("customize");
      }
    } catch (err) {
      console.error("❌ No se pudo recuperar sesión de Redis", err);
      setColor(0xff0000);
      setMoney(0);
      setSandwichDone(false);
      setStep("customize");
    }
  };

  // --------------------------- 
  // REDIS: Guardar sesión cuando cambien los datos
  // --------------------------- 
  useEffect(() => {
    if (
      username &&
      color !== null &&
      money !== null &&
      sandwichDone !== null
    ) {
      const sessionData = { color, money, sandwichDone };
      fetch("http://localhost:4000/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, data: sessionData }),
      }).catch(() => console.log("❌ No se pudo guardar sesión en Redis"));
    }
  }, [username, color, money, sandwichDone]);

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

  // Helper to convert Phaser-style hex number (0xff0000) to CSS hex "#ff0000"
  const numToCssHex = (num) => "#" + num.toString(16).padStart(6, "0");

  // ---------- INITIALIZE p5 + Phaser when entering world ----------
  useEffect(() => {
      if (step === "world" && !phaserRef.current) {
        // --- p5 sketch ---
        const sketch = (s) => {
          // logical stage size (Phaser physics use the same logical size)
          const W = 800,
            H = 600;
  
          s.setup = () => {
            // we will create canvas inside an element within the stage (so it gets scaled)
            s.createCanvas(W, H).parent("p5-container");
          };
  
          s.draw = () => {
            s.push();
            s.noStroke();
            s.background("#e9f3fb");
  
            // pared
            s.fill("#f2e9dc");
            s.rect(0, 0, W, 220);
  
            // ventana
            s.fill("#9fd3ff");
            s.rect(520, 30, 180, 110, 8);
            s.fill("#fff7");
            s.rect(540, 50, 140, 70, 6);
  
            // suelo y tiles
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
  
            // mesa
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
  
            // estufa
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
  
            // estantes
            s.push();
            s.fill("#b3c8a6");
            s.rect(700, 160, 140, 60, 6);
            s.fill("#8b5a2b");
            s.rect(700, 200, 30, 30, 6);
            s.pop();
          };
        };
  
        // mount p5 inside stage's p5-container
        p5Ref.current = new p5(sketch, document.getElementById("p5-container"));
  
        // --- Phaser ---
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: "game-stage", // ahora apuntamos al elemento stage
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
  
        function preload() {}
  
        function create() {
          const floor = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0);
          this.physics.add.existing(floor, true);
  
          const walls = [
            this.add.rectangle(400, 10, 800, 20, 0x000000, 0),
            this.add.rectangle(400, 590, 800, 20, 0x000000, 0),
            this.add.rectangle(10, 300, 20, 600, 0x000000, 0),
            this.add.rectangle(790, 300, 20, 600, 0x000000, 0),
          ];
          walls.forEach((w) => this.physics.add.existing(w, true));
  
          table = this.add.rectangle(400, 300, 220, 80, 0x000000, 0);
          this.physics.add.existing(table, true);
  
          const chair1 = this.add.rectangle(330, 350, 30, 30, 0x000000, 0);
          const chair2 = this.add.rectangle(470, 350, 30, 30, 0x000000, 0);
          this.physics.add.existing(chair1, true);
          this.physics.add.existing(chair2, true);
  
          const stove = this.add.rectangle(90, 280, 140, 120, 0x000000, 0);
          this.physics.add.existing(stove, true);
  
          player = this.add.circle(50, 300, 18, 0xffffff, 0);
          this.physics.add.existing(player);
          player.body.setCollideWorldBounds(true);
          player.body.setCircle(18);
          player.body.setOffset(-18, -18);
  
          const obstacles = [...walls, table, chair1, chair2, stove];
          obstacles.forEach((obs) => {
            this.physics.add.collider(player, obs);
          });
  
          const exclamation = this.add
            .text(table.x, table.y - 60, "!", {
              font: "36px Arial",
              fill: "#ff3333",
              fontStyle: "bold",
            })
            .setOrigin(0.5, 0.5);
          window.tableExclamation = exclamation;
  
          cursors = this.input.keyboard.createCursorKeys();
          keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  
          window.phaserScene = this;
          window.phaserPlayer = player;
  
          this.cameras.main.centerOn(400, 300);
        }

      function update() {
        if (!player || !cursors) return;

        const speed = 160;
        player.body.setVelocity(0);
        if (cursors.left.isDown) player.body.setVelocityX(-speed);
        if (cursors.right.isDown) player.body.setVelocityX(speed);
        if (cursors.up.isDown) player.body.setVelocityY(-speed);
        if (cursors.down.isDown) player.body.setVelocityY(speed);

        const dist = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          table.x,
          table.y
        );
        if (dist < 70) {
          window.nearTable = true;
          if (Phaser.Input.Keyboard.JustDown(keyA) && !sandwichDone) {
            const ev = new CustomEvent("openSandwich");
            window.dispatchEvent(ev);
          }
        } else {
          window.nearTable = false;
        }

        if (window.tableExclamation)
          window.tableExclamation.setVisible(!sandwichDone);
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

            const near = !!window.nearTable;
            const ev = new CustomEvent("nearTableUpdate", { detail: { near } });
            window.dispatchEvent(ev);
          }
        } catch (err) {}
        rafRef.current = requestAnimationFrame(updateSvg);
      };
      rafRef.current = requestAnimationFrame(updateSvg);

      const openListener = () => {
        setShowSandwichMinigame(true);
        setShowPressAHint(false);
        setSandwich([]);
      };
      const nearListener = (e) => {
        setShowPressAHint(e.detail.near && !sandwichDone);
      };
      window.addEventListener("openSandwich", openListener);
      window.addEventListener("nearTableUpdate", nearListener);

      const cleanup = () => {
        window.removeEventListener("openSandwich", openListener);
        window.removeEventListener("nearTableUpdate", nearListener);
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
  }, [step, color, sandwichDone]);

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

  function finishSandwich() {
    setSandwichDone(true);
    setShowSandwichMinigame(false);
    setMoney((prev) => prev + 5);
  }

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
        <h1>Roundy World - Login</h1>
        <input
          placeholder="Ingresa tu nombre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "2px solid #333",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={handleLogin}
          disabled={!username}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#333",
            color: "#fff",
          }}
        >
          Entrar
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
        Hola {username}! Muévete con las flechas.
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

      {showPressAHint && !showSandwichMinigame && !sandwichDone && (
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
          Presiona <b>A</b> para interactuar
        </div>
      )}

      {sandwichDone && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "green",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          ✅ Ya hiciste un sándwich
        </div>
      )}

      {showSandwichMinigame && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 360,
            background: "#fff",
            border: "3px solid #333",
            padding: 18,
            borderRadius: 12,
            zIndex: 10,
          }}
        >
          <h3 style={{ marginTop: 0 }}>🥪 Arma tu Sandwich</h3>
          <div
            onDrop={onDrop}
            onDragOver={allowDrop}
            style={{
              minHeight: 140,
              border: "2px dashed #ccc",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column-reverse",
              alignItems: "center",
              padding: 10,
              background: "#fbfbfb",
            }}
          >
            <div
              style={{
                width: 140,
                height: 20,
                background: "#deb887",
                borderRadius: 6,
                margin: "6px 0",
              }}
            />
            {sandwich.map((ing, i) => (
              <div
                key={i}
                style={{
                  width: 140,
                  height: 18,
                  background: ing.color,
                  borderRadius: 5,
                  margin: "5px 0",
                }}
              />
            ))}
            <div
              style={{
                width: 140,
                height: 20,
                background: "#deb887",
                borderRadius: 6,
                margin: "6px 0",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {ingredients.map((ing) => (
              <div
                key={ing.name}
                draggable
                onDragStart={(e) => onDragStart(e, ing)}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  background: ing.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  cursor: "grab",
                }}
                title={ing.name}
              >
                {ing.name.split(" ")[0]}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 12,
            }}
          >
            <button
              onClick={finishSandwich}
              style={{
                padding: "8px 12px",
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 8,
              }}
            >
              Terminar Sandwich
            </button>
            <button
              onClick={() => {
                setShowSandwichMinigame(false);
              }}
              style={{
                padding: "8px 12px",
                background: "#ccc",
                border: "none",
                borderRadius: 8,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}