// server.js
import express from "express";
import Redis from "redis-mock";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Redis mock en memoria
const client = Redis.createClient();

// Guardar sesión
app.post("/session", async (req, res) => {
  const { username, data } = req.body;
  if (!username || !data) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    client.set(username, JSON.stringify(data));
    res.json({ ok: true, message: "Sesión guardada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cargar sesión
app.get("/session/:username", async (req, res) => {
  const { username } = req.params;
  
  client.get(username, (err, session) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        res.json(sessionData);
      } catch (parseError) {
        res.status(500).json({ error: "Error parsing session data" });
      }
    } else {
      res.json(null);
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));