import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";

export default function App() {
  const [step, setStep] = useState("login"); // login | customize | world
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(0xff0000);

  const phaserRef = useRef(null);

  const colors = {
    amarillo: 0xffff00,
    rosa: 0xff69b4,
    rojo: 0xff0000,
    naranja: 0xffa500,
    celeste: 0x00ffff,
    verde: 0x00ff00,
  };

  // --- Mundo con Phaser ---
  useEffect(() => {
    if (step !== "world") return; // solo inicializar Phaser si estamos en "world"
    if (phaserRef.current) return; // evitar reinicializar

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
      const table = this.add.rectangle(400, 300, 100, 50, 0xcd853f);
      const chair1 = this.add.rectangle(350, 350, 30, 30, 0x8b0000);
      const chair2 = this.add.rectangle(450, 350, 30, 30, 0x8b0000);
      const sofa = this.add.rectangle(600, 200, 120, 50, 0x556b2f);

      [table, chair1, chair2, sofa].forEach((obj) =>
        this.physics.add.existing(obj, true)
      );

      // Jugador
      player = this.add.circle(50, 300, 15, color);
      this.physics.add.existing(player);
      player.body.setCollideWorldBounds(true);

      walls.concat([table, chair1, chair2, sofa]).forEach((obs) =>
        this.physics.add.collider(player, obs)
      );

      cursors = this.input.keyboard.createCursorKeys();

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
    }

    phaserRef.current = new Phaser.Game(config);

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [step, color]);

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
        />
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
    </div>
  );
}
