import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";

export default function App() {
  const [step, setStep] = useState("login"); // login | customize | world
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(0xff0000);
  const [showSandwichMinigame, setShowSandwichMinigame] = useState(false);
  const [showPressAHint, setShowPressAHint] = useState(false);

  const [sandwich, setSandwich] = useState([]);
  const [sandwichDone, setSandwichDone] = useState(false);
  const [money, setMoney] = useState(0);

  const phaserRef = useRef(null);

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

  useEffect(() => {
    if (step === "world" && !phaserRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: "phaser-container",
        backgroundColor: 0x87ceeb,
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
        // Piso y paredes
        const floor = this.add.rectangle(400, 300, 800, 600, 0xdeb887);
        this.physics.add.existing(floor, true);

        const walls = [
          this.add.rectangle(400, 20, 800, 40, 0x8b4513),
          this.add.rectangle(400, 580, 800, 40, 0x8b4513),
          this.add.rectangle(20, 300, 40, 600, 0x8b4513),
          this.add.rectangle(780, 300, 40, 600, 0x8b4513),
        ];
        walls.forEach((wall) => this.physics.add.existing(wall, true));

        // Muebles
        table = this.add.rectangle(400, 300, 100, 50, 0xcd853f);
        const chair1 = this.add.rectangle(350, 350, 30, 30, 0x8b0000);
        const chair2 = this.add.rectangle(450, 350, 30, 30, 0x8b0000);
        const sofa = this.add.rectangle(600, 200, 120, 50, 0x556b2f);

        [table, chair1, chair2, sofa].forEach((obj) =>
          this.physics.add.existing(obj, true)
        );

        // Signo de exclamación sobre la mesa
        const exclamation = this.add.text(table.x, table.y - 40, "!", {
          font: "32px Arial",
          fill: "#ff0000",
          fontStyle: "bold",
        });
        exclamation.setOrigin(0.5, 0.5);
        window.tableExclamation = exclamation;

        // Jugador, empieza a la izquierda
        player = this.add.circle(50, 300, 15, color);
        this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);

        walls.concat([table, chair1, chair2, sofa]).forEach((obs) =>
          this.physics.add.collider(player, obs)
        );

        cursors = this.input.keyboard.createCursorKeys();
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // La cámara ya no sigue al jugador; el mundo está centrado
        this.cameras.main.centerOn(400, 300);
      }

      function update() {
        if (!player || !cursors) return;
        const speed = 150;
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

        if (dist < 60) {
          setShowPressAHint(true);
          if (Phaser.Input.Keyboard.JustDown(keyA) && !sandwichDone) {
            setShowSandwichMinigame(true);
            setShowPressAHint(false);
            setSandwich([]);
          }
        } else {
          setShowPressAHint(false);
        }

        if (window.tableExclamation) {
          window.tableExclamation.setVisible(!sandwichDone);
        }
      }

      phaserRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [step, color, sandwichDone]);

  function finishSandwich() {
    setSandwichDone(true);
    setShowSandwichMinigame(false);
    setMoney((prev) => prev + 5); // Sumar dinero al terminar sandwich
  }

  // Drag & Drop
  function onDragStart(e, ing) {
    e.dataTransfer.setData("ingredient", JSON.stringify(ing));
  }

  function onDrop(e) {
    const ing = JSON.parse(e.dataTransfer.getData("ingredient"));
    setSandwich((prev) => [...prev, ing]);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  // --- Login ---
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

  // --- Personalización ---
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
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "#" + color.toString(16).padStart(6, "0"),
            border: "3px solid #000",
            marginBottom: "20px",
          }}
        ></div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(colors).map(([name, hex]) => (
            <div
              key={name}
              onClick={() => setColor(hex)}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#" + hex.toString(16).padStart(6, "0"),
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
            marginTop: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#333",
            color: "#fff",
          }}
        >
          Continuar al Roundy World
        </button>
      </div>
    );
  }

  // --- Mundo ---
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to top, #87ceeb, #ffffff)",
        position: "relative",
      }}
    >
      <h2 style={{ textAlign: "center" }}>
        Hola {username}! Muévete con las flechas.
      </h2>
      <div id="phaser-container" />

      {/* Contador de dinero */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "#333",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        💰 {money}
      </div>

      {showPressAHint && !showSandwichMinigame && !sandwichDone && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          Presiona <b>A</b> para hacer un sándwich
        </div>
      )}

      {sandwichDone && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "green",
            color: "#fff",
            padding: "10px",
            borderRadius: "8px",
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
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            border: "3px solid #333",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            width: "350px",
          }}
        >
          <h3>🥪 ¡Arma tu Sandwich!</h3>

          <div
            onDrop={onDrop}
            onDragOver={allowDrop}
            style={{
              margin: "10px 0",
              minHeight: "150px",
              border: "2px dashed #aaa",
              borderRadius: "10px",
              background: "#f9f9f9",
              display: "flex",
              flexDirection: "column-reverse",
              alignItems: "center",
              padding: "10px",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "20px",
                background: "#deb887",
                borderRadius: "5px",
                margin: "2px 0",
              }}
            />
            {sandwich.map((ing, i) => (
              <div
                key={i}
                style={{
                  width: "120px",
                  height: "20px",
                  background: ing.color,
                  borderRadius: "5px",
                  margin: "2px 0",
                }}
              />
            ))}
            <div
              style={{
                width: "120px",
                height: "20px",
                background: "#deb887",
                borderRadius: "5px",
                margin: "2px 0",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {ingredients.map((ing) => (
              <div
                key={ing.name}
                draggable
                onDragStart={(e) => onDragStart(e, ing)}
                style={{
                  width: "60px",
                  height: "60px",
                  background: ing.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  cursor: "grab",
                  fontSize: "24px",
                }}
              >
                {ing.name.split(" ")[0]}
              </div>
            ))}
          </div>

          <button
            onClick={finishSandwich}
            style={{
              marginTop: "15px",
              padding: "8px 15px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Terminar Sandwich
          </button>
        </div>
      )}
    </div>
  );
}
