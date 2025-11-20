import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Filter from "bad-words";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Filtro de palabras ofensivas
const filter = new Filter();
filter.addWords('tonto', 'feo', 'idiota', 'estupido');
filter.removeWords('hell', 'damn', 'god', 'sex');

// Almacen de jugadores conectados
const connectedPlayers = new Map();

// Manejador de conexiones Socket.io
io.on("connection", (socket) => {
  console.log(`🔗 Usuario conectado: ${socket.id} desde ${socket.handshake.address}`);

  // Unirse al juego
  socket.on("join-game", (playerData) => {
    const safeUsername = playerData.username;
    
    connectedPlayers.set(socket.id, {
      id: socket.id,
      username: safeUsername,
      color: playerData.color,
      x: playerData.x,
      y: playerData.y,
      currentMap: playerData.currentMap,
      selectedHat: playerData.selectedHat || null, // ✅ Guardar información del sombrero
      message: "",
      messageTimestamp: 0
    });

    console.log(`🎮 ${safeUsername} se unió al juego en ${playerData.currentMap} con sombrero:`, playerData.selectedHat);
    
    // ✅ CORRECCIÓN: Notificar a todos los jugadores incluyendo el sombrero
    socket.broadcast.emit("player-joined", connectedPlayers.get(socket.id));
    
    // ✅ CORRECCIÓN: Enviar información del sombrero a otros jugadores inmediatamente
    if (playerData.selectedHat) {
      socket.broadcast.emit("player-hat-changed", {
        id: socket.id,
        username: safeUsername,
        selectedHat: playerData.selectedHat
      });
    }
    
    // Enviar lista de jugadores actual al nuevo jugador
    const playersList = Array.from(connectedPlayers.values());
    console.log(`📋 Enviando lista de ${playersList.length} jugadores a ${safeUsername}`);
    socket.emit("current-players", playersList);
    
    console.log(`👥 Total de jugadores conectados: ${connectedPlayers.size}`);
  });

  // Movimiento del jugador
  socket.on("player-move", (data) => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      console.log(`🎯 ${player.username} se movió a:`, { x: data.x, y: data.y, map: data.currentMap });
      
      player.x = data.x;
      player.y = data.y;
      player.currentMap = data.currentMap;
      
      // Broadcast a todos los demás jugadores
      socket.broadcast.emit("player-moved", {
        id: socket.id,
        x: data.x,
        y: data.y,
        currentMap: data.currentMap
      });
      
      console.log(`📤 Enviando movimiento de ${player.username} a ${connectedPlayers.size - 1} jugadores`);
    }
  });

  // Cambio de sombrero - CORREGIDO
  socket.on("player-hat-change", (data) => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      console.log(`🎩 ${player.username} cambió sombrero a:`, data.selectedHat);
      
      player.selectedHat = data.selectedHat;
      
      // Notificar a todos los demás jugadores
      socket.broadcast.emit("player-hat-changed", {
        id: socket.id,
        username: player.username,
        selectedHat: data.selectedHat
      });
      
      console.log(`📤 Enviando cambio de sombrero de ${player.username} a ${connectedPlayers.size - 1} jugadores`);
    }
  });

  // Enviar mensaje de chat
  socket.on("send-message", (message) => {
    const player = connectedPlayers.get(socket.id);
    if (player && message.trim()) {
      try {
        let cleanMessage = message.trim().substring(0, 100);
        
        if (filter.isProfane(cleanMessage)) {
          cleanMessage = filter.clean(cleanMessage);
        }
        
        player.message = cleanMessage;
        player.messageTimestamp = Date.now();
        
        io.emit("player-message", {
          id: socket.id,
          username: player.username,
          message: cleanMessage,
          timestamp: player.messageTimestamp
        });
        
        console.log(`💬 ${player.username}: ${cleanMessage}`);
      } catch (error) {
        console.error("Error procesando mensaje:", error);
        player.message = message.trim().substring(0, 100);
        player.messageTimestamp = Date.now();
        
        io.emit("player-message", {
          id: socket.id,
          username: player.username,
          message: message.trim().substring(0, 100),
          timestamp: player.messageTimestamp
        });
      }
    }
  });

  // Desconexión
  socket.on("disconnect", () => {
    const player = connectedPlayers.get(socket.id);
    if (player) {
      console.log(`👋 ${player.username} se desconectó`);
      connectedPlayers.delete(socket.id);
      socket.broadcast.emit("player-left", socket.id);
      console.log(`👥 Total de jugadores: ${connectedPlayers.size}`);
    }
  });
});

// Endpoint para obtener estadísticas
app.get("/stats", (req, res) => {
  const players = Array.from(connectedPlayers.values());
  res.json({
    connectedPlayers: connectedPlayers.size,
    players: players.map(p => ({
      username: p.username,
      map: p.currentMap,
      x: p.x,
      y: p.y,
      hat: p.selectedHat ? p.selectedHat.name : "Ninguno"
    }))
  });
});

// Endpoint para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({ 
    status: "Servidor Socket.io funcionando",
    players: connectedPlayers.size,
    port: 4002,
    message: "Usa ?server=IP en la URL del cliente para conectar"
  });
});

const PORT = 4002;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🎮 Servidor de Socket.io ejecutándose en puerto ${PORT}`);
  console.log(`💬 Chat y sistema multijugador activo`);
  console.log(`🎩 Sistema de sombreros multijugador activado y corregido`);
  console.log(`🌐 Aceptando conexiones de cualquier origen`);
  console.log(`📡 Para conectar desde otra computadora usa: http://TU_IP_LOCAL:${PORT}`);
  console.log(`🎯 Los clientes pueden conectar con: http://localhost:3000/?server=TU_IP`);
});