import React, { useState } from "react";

export default function App() {
  const [step, setStep] = useState("login"); // login | customize | world
  const [username, setUsername] = useState("");

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

  return null;
}
