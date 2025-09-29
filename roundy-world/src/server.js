// server.js
import express from "express";
import Redis from "redis-mock"; // simulación de Redis en memoria
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Redis mock en memoria
const client = Redis.createClient();

// Guardar sesión
app.post("/session", async (req, res) => {
  const { username, data } = req.body;
  if (!username || !data) return res.status(400).json({ error: "Faltan datos" });

  client.set(username, JSON.stringify(data));
  res.json({ ok: true });
});

// Cargar sesión
app.get("/session/:username", async (req, res) => {
  const { username } = req.params;
  client.get(username, (err, session) => {
    if (err) return res.status(500).json({ error: err.message });
    if (session) {
      res.json(JSON.parse(session));
    } else {
      res.json(null);
    }
  });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
