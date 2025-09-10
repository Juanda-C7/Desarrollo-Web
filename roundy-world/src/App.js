import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import p5 from "p5";

/*
  Versión mejorada:
  - p5 dibuja la cocina en el fondo
  - Phaser mantiene físicas y colisiones (player invisible)
  - SVG encima representa al jugador (cara, brazos, piernas) y se mueve según Phaser
  - Minijuego y UI en React siguen igual
*/

export default function App() {
  const [step, setStep] = useState("login"); // login | customize | world
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(0xff0000); // color (hex number para Phaser, también lo usamos para SVG)
  const [showSandwichMinigame, setShowSandwichMinigame] = useState(false);
  const [showPressAHint, setShowPressAHint] = useState(false);

  const [sandwich, setSandwich] = useState([]);
  const [sandwichDone, setSandwichDone] = useState(false);
  const [money, setMoney] = useState(0);

  // refs
  const phaserRef = useRef(null);
  const p5Ref = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const containerRef = useRef(null);

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

  useEffect(() => {
    // --- cuando entramos al mundo inicializamos p5 y Phaser ---
    if (step === "world" && !phaserRef.current) {
      // 1) Inicializar p5 (fondo cocina)
      const sketch = (s) => {
        const W = 800,
          H = 600;

        s.setup = () => {
          s.createCanvas(W, H);
        };

        s.draw = () => {
          // Suelo (baldosa)
          s.push();
          s.noStroke();
          s.background("#e9f3fb"); // cielo por ventana
          // pared
          s.fill("#f2e9dc");
          s.rect(0, 0, W, 220);
          // ventana
          s.fill("#9fd3ff");
          s.rect(520, 30, 180, 110, 8);
          s.fill("#fff7");
          s.rect(540, 50, 140, 70, 6);
          // azulejos del suelo (cuadrícula)
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

          // Encima: muebles vectoriales sencillos (mesa central)
          s.push();
          s.noStroke();
          // sombra de mesa
          s.fill("#00000022");
          s.ellipse(400, 330, 160, 30);
          // mesa
          s.fill("#cd853f");
          s.rectMode(s.CENTER);
          s.rect(400, 300, 220, 80, 8);
          // patas de mesa
          s.fill("#8b5a2b");
          s.rect(330, 350, 18, 60, 4);
          s.rect(470, 350, 18, 60, 4);
          s.pop();

          // cocina: estufa a la izquierda
          s.push();
          s.fill("#c7c7c7");
          s.rect(90, 280, 140, 120, 6);
          s.fill("#333");
          s.rect(90, 250, 100, 20, 4);
          // olla con vapor animado
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

          // estantes y detalles derecho
          s.push();
          s.fill("#b3c8a6");
          s.rect(700, 160, 140, 60, 6);
          s.fill("#8b5a2b");
          s.rect(700, 200, 30, 30, 6);
          s.pop();
        };
      };

      p5Ref.current = new p5(sketch, document.getElementById("p5-container"));

      // 2) Inicializar Phaser (motor físico / colisiones)
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: "phaser-wrapper", // div que contendrá el canvas
        transparent: true, // importante: transparente para ver el p5 detrás
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

      function preload() {
        // no sprites externos; todo se hará con formas y SVG encima
      }

      function create() {
        // floor & walls collision bodies (invisibles)
        const floor = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0);
        this.physics.add.existing(floor, true);

        const walls = [
          this.add.rectangle(400, 10, 800, 20, 0x000000, 0),
          this.add.rectangle(400, 590, 800, 20, 0x000000, 0),
          this.add.rectangle(10, 300, 20, 600, 0x000000, 0),
          this.add.rectangle(790, 300, 20, 600, 0x000000, 0),
        ];
        walls.forEach((w) => this.physics.add.existing(w, true));

        // Mesa (cuerpo de colisión) - coincide con el dibujo de p5
        table = this.add.rectangle(400, 300, 220, 80, 0x000000, 0);
        this.physics.add.existing(table, true);

        // Sillas como obstáculos
        const chair1 = this.add.rectangle(330, 350, 30, 30, 0x000000, 0);
        const chair2 = this.add.rectangle(470, 350, 30, 30, 0x000000, 0);
        this.physics.add.existing(chair1, true);
        this.physics.add.existing(chair2, true);

        // Estufa/objetos
        const stove = this.add.rectangle(90, 280, 140, 120, 0x000000, 0);
        this.physics.add.existing(stove, true);

        // Jugador (fisica) - invisible en Phaser; el SVG será la vista
        player = this.add.circle(50, 300, 18, 0xffffff, 0); // alpha 0 shape
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        player.body.setCircle(18);
        player.body.setOffset(-18, -18);

        // Colisiones físicas
        const obstacles = [...walls, table, chair1, chair2, stove];
        obstacles.forEach((obs) => {
          this.physics.add.collider(player, obs);
        });

        // Exclamación (texto Phaser), se mostrará/ocultará según sandwichDone
        const exclamation = this.add
          .text(table.x, table.y - 60, "!", {
            font: "36px Arial",
            fill: "#ff3333",
            fontStyle: "bold",
          })
          .setOrigin(0.5, 0.5);
        window.tableExclamation = exclamation;

        // Teclado
        cursors = this.input.keyboard.createCursorKeys();
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // Exponer escena & player para React (lectura)
        window.phaserScene = this;
        window.phaserPlayer = player;

        // La cámara centrada en el 'mapa' (no seguimos al jugador)
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

        // proximidad mesa
        const dist = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          table.x,
          table.y
        );

        if (dist < 70) {
          // mostrar hint (React lee showPressAHint desde setShowPressAHint)
          // en lugar de setState desde Phaser (para evitar hooks desde fuera),
          // exponemos la condición y React consulta en RAF loop
          window.nearTable = true;
          if (Phaser.Input.Keyboard.JustDown(keyA) && !sandwichDone) {
            // para abrir minijuego usamos un evento DOM custom para comunicarnos con React
            const ev = new CustomEvent("openSandwich");
            window.dispatchEvent(ev);
          }
        } else {
          window.nearTable = false;
        }

        if (window.tableExclamation) window.tableExclamation.setVisible(!sandwichDone);
      }

      phaserRef.current = new Phaser.Game(config);

      // 3) RAF loop para sincronizar SVG (visual) con player (físico) y para chequear hints
      const updateSvg = () => {
        try {
          const scene = window.phaserScene;
          const playerObj = window.phaserPlayer;
          const svgEl = svgRef.current;
          const containerEl = containerRef.current;
          if (scene && playerObj && svgEl && containerEl) {
            // posicion relativa dentro del wrapper (800x600)
            const x = playerObj.x;
            const y = playerObj.y;
            // colocar el svg centrado en (x,y)
            svgEl.style.left = `${x}px`;
            svgEl.style.top = `${y}px`;
            // update hint (React state) by dispatching event; we will also set showPressAHint in response
            const near = !!window.nearTable;
            const ev = new CustomEvent("nearTableUpdate", { detail: { near } });
            window.dispatchEvent(ev);
          }
        } catch (err) {
          // ignore
        }
        rafRef.current = requestAnimationFrame(updateSvg);
      };
      rafRef.current = requestAnimationFrame(updateSvg);

      // 4) Event listener desde Phaser->React para abrir minijuego y nearTable updates
      const openListener = () => {
        // abrir minijuego desde React
        setShowSandwichMinigame(true);
        setShowPressAHint(false);
        setSandwich([]);
      };
      const nearListener = (e) => {
        setShowPressAHint(e.detail.near && !sandwichDone);
      };
      window.addEventListener("openSandwich", openListener);
      window.addEventListener("nearTableUpdate", nearListener);

      // Cleanup attachments on unmount or leaving world
      const cleanup = () => {
        window.removeEventListener("openSandwich", openListener);
        window.removeEventListener("nearTableUpdate", nearListener);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };

      // store cleanup on phaserRef for later
      phaserRef.currentCleanup = cleanup;
    }

    // cleanup when leaving world
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, color, sandwichDone]);

  // Al terminar sandwich
  function finishSandwich() {
    setSandwichDone(true);
    setShowSandwichMinigame(false);
    setMoney((prev) => prev + 5);
  }

  // Drag & Drop (React DOM)
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

  // --- Login UI ---
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
          onClick={() => setStep("customize")}
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

  // --- Personalización UI ---
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

        {/* SVG preview simple */}
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
            <circle cx="60" cy="60" r="40" fill={numToCssHex(color)} stroke="#000" strokeWidth="3" />
            <circle cx="48" cy="54" r="5" fill="#000" />
            <circle cx="72" cy="54" r="5" fill="#000" />
            <path d="M48 70 Q60 80 72 70" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
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

  // --- Mundo (Phaser canvas + p5 background + SVG player) ---
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
      <h2 style={{ textAlign: "center" }}>Hola {username}! Muévete con las flechas.</h2>

      {/* wrapper centrado que contiene p5 (fondo), canvas Phaser (transparent) y svg jugador encima */}
      <div
        ref={containerRef}
        id="phaser-wrapper"
        style={{
          width: 800,
          height: 600,
          position: "relative",
          margin: "12px auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          borderRadius: 12,
          overflow: "hidden",
          background: "transparent",
        }}
      >
        {/* p5 background (z-index 0) */}
        <div id="p5-container" style={{ position: "absolute", left: 0, top: 0, zIndex: 0 }} />

        {/* Phaser canvas will be injected into this wrapper by config.parent = "phaser-wrapper" */}
        {/* we don't add explicit div for phaser canvas beyond parent wrapper */}

        {/* SVG player (z-index 2) */}
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
            pointerEvents: "none", // don't block keyboard / drag
          }}
        >
          {/* inline SVG character */}
          <svg viewBox="0 0 100 100" width="64" height="64">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
              </filter>
            </defs>
            {/* cuerpo (fill viene de color personalizado) */}
            <g id="body">
              <circle cx="50" cy="44" r="24" fill={numToCssHex(color)} stroke="#111" strokeWidth="1.8" filter="url(#shadow)" />
              {/* ojos */}
              <g id="eyes" transform="translate(0,0)">
                <circle cx="42" cy="40" r="3.7" fill="#000" />
                <circle cx="58" cy="40" r="3.7" fill="#000" />
              </g>
              {/* boca */}
              <path d="M40 52 Q50 60 60 52" stroke="#111" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>

            {/* brazos - palitos (animación con CSS) */}
            <g id="arms" transform="translate(0,0)">
              <line x1="22" y1="50" x2="6" y2="66" stroke="#111" strokeWidth="4" strokeLinecap="round" />
              <line x1="78" y1="50" x2="94" y2="66" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* piernas */}
            <g id="legs">
              <line x1="42" y1="68" x2="36" y2="86" stroke="#111" strokeWidth="4" strokeLinecap="round" />
              <line x1="58" y1="68" x2="64" y2="86" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>

      {/* HUD */}
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

      {/* Hint */}
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

      {/* Sandwich Done */}
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

      {/* Minijuego Sandwich (React) */}
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
            {/* pan inferior */}
            <div style={{ width: 140, height: 20, background: "#deb887", borderRadius: 6, margin: "6px 0" }} />
            {sandwich.map((ing, i) => (
              <div key={i} style={{ width: 140, height: 18, background: ing.color, borderRadius: 5, margin: "5px 0" }} />
            ))}
            {/* pan superior */}
            <div style={{ width: 140, height: 20, background: "#deb887", borderRadius: 6, margin: "6px 0" }} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
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

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
            <button onClick={finishSandwich} style={{ padding: "8px 12px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 8 }}>
              Terminar Sandwich
            </button>
            <button
              onClick={() => {
                setShowSandwichMinigame(false);
              }}
              style={{ padding: "8px 12px", background: "#ccc", border: "none", borderRadius: 8 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
