import React, { useState } from "react";

export default function App() {
  const [step, setStep] = useState("login"); // login | customize | world
  const [username, setUsername] = useState("");
  const [color, setColor] = useState(0xff0000);

  const colors = {
    amarillo: 0xffff00,
    rosa: 0xff69b4,
    rojo: 0xff0000,
    naranja: 0xffa500,
    celeste: 0x00ffff,
    verde: 0x00ff00,
  };

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

  return null;
}
