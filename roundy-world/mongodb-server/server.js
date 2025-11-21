import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB Atlas
const MONGODB_URI = "mongodb+srv://Juanda:mongojuanda@clusterrw.21u8eyr.mongodb.net/roundyworld?retryWrites=true&w=majority";

console.log("🔗 Conectando a MongoDB Atlas...");
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  });

// Esquema del usuario ACTUALIZADO con progreso de programación
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  color: { type: Number, default: 0xff0000 },
  money: { type: Number, default: 0 },
  educationalPoints: { type: Number, default: 0 },
  sandwichDone: { type: Boolean, default: false },
  selectedHat: { type: Number, default: null },
  ownedHats: { type: [Number], default: [] },
  trofeos: {
    bronce: { type: Number, default: 0 },
    plata: { type: Number, default: 0 },
    oro: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  logrosCompletados: [String],
  misionesProgreso: Object,
  programmingProgress: {
    leccionesCompletadas: { type: [Number], default: [] },
    leccionActual: { type: Number, default: 1 },
    puntosProgramacion: { type: Number, default: 0 },
    leccionesDesbloqueadas: { type: [Number], default: [1] }, // Solo la primera desbloqueada
    historialValidaciones: [{
      leccionId: Number,
      timestamp: Date,
      esCorrecto: Boolean
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

const JWT_SECRET = "roundyworld_secret_key_2024";

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user;
    next();
  });
};

// ========================================
// RUTAS DE PROGRAMACIÓN (NUEVAS)
// ========================================

// 🔹 OBTENER progreso de programación del jugador
app.get("/programming/progress", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      leccionesCompletadas: user.programmingProgress.leccionesCompletadas || [],
      leccionActual: user.programmingProgress.leccionActual || 1,
      puntosProgramacion: user.programmingProgress.puntosProgramacion || 0,
      leccionesDesbloqueadas: user.programmingProgress.leccionesDesbloqueadas || [1]
    });
  } catch (error) {
    console.error("Error obteniendo progreso de programación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 VALIDAR código de una lección
app.post("/programming/validate", authenticateToken, async (req, res) => {
  try {
    const { leccionId, esCorrecto } = req.body;

    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Registrar validación en historial
    if (!user.programmingProgress.historialValidaciones) {
      user.programmingProgress.historialValidaciones = [];
    }

    user.programmingProgress.historialValidaciones.push({
      leccionId,
      timestamp: new Date(),
      esCorrecto
    });

    await user.save();

    res.json({
      message: "Validación registrada",
      esCorrecto,
      leccionId
    });
  } catch (error) {
    console.error("Error registrando validación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 COMPLETAR una lección
app.post("/programming/complete-lesson", authenticateToken, async (req, res) => {
  try {
    const { leccionId } = req.body;

    if (!leccionId) {
      return res.status(400).json({ error: "leccionId es requerido" });
    }

    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar que la lección esté desbloqueada
    const leccionesDesbloqueadas = user.programmingProgress.leccionesDesbloqueadas || [1];
    if (!leccionesDesbloqueadas.includes(leccionId)) {
      return res.status(400).json({ error: "Esta lección no está desbloqueada" });
    }

    // Verificar que no esté ya completada
    const leccionesCompletadas = user.programmingProgress.leccionesCompletadas || [];
    if (leccionesCompletadas.includes(leccionId)) {
      return res.status(400).json({ error: "Esta lección ya fue completada" });
    }

    // Marcar lección como completada
    user.programmingProgress.leccionesCompletadas.push(leccionId);
    
    // Otorgar puntos (10 por lección completada)
    const puntosGanados = 10;
    user.programmingProgress.puntosProgramacion += puntosGanados;
    
    // También agregar a puntos educativos generales
    user.educationalPoints += puntosGanados;

    // Desbloquear siguiente lección
    const siguienteLeccionId = leccionId + 1;
    if (!leccionesDesbloqueadas.includes(siguienteLeccionId)) {
      user.programmingProgress.leccionesDesbloqueadas.push(siguienteLeccionId);
    }

    // Actualizar lección actual
    user.programmingProgress.leccionActual = siguienteLeccionId;

    await user.save();

    res.json({
      message: `¡Lección ${leccionId} completada! Ganaste ${puntosGanados} puntos.`,
      puntosGanados,
      siguienteLeccionDesbloqueada: true,
      siguienteLeccionId,
      progreso: {
        leccionesCompletadas: user.programmingProgress.leccionesCompletadas,
        leccionActual: user.programmingProgress.leccionActual,
        puntosProgramacion: user.programmingProgress.puntosProgramacion,
        leccionesDesbloqueadas: user.programmingProgress.leccionesDesbloqueadas
      },
      educationalPoints: user.educationalPoints
    });
  } catch (error) {
    console.error("Error completando lección:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 REINICIAR progreso de programación
app.post("/programming/reset", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Reiniciar progreso de programación
    user.programmingProgress = {
      leccionesCompletadas: [],
      leccionActual: 1,
      puntosProgramacion: 0,
      leccionesDesbloqueadas: [1],
      historialValidaciones: []
    };

    await user.save();

    res.json({
      message: "Progreso de programación reiniciado exitosamente",
      progreso: user.programmingProgress
    });
  } catch (error) {
    console.error("Error reiniciando progreso:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 OBTENER estado completo de programación
app.get("/programming/status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const totalLecciones = 10; // Puedes hacerlo dinámico si lo necesitas
    const leccionesCompletadas = user.programmingProgress.leccionesCompletadas?.length || 0;
    const progresoPorcentaje = totalLecciones > 0 ? Math.round((leccionesCompletadas / totalLecciones) * 100) : 0;

    res.json({
      username: user.username,
      progreso: user.programmingProgress,
      leccionesCompletadas: leccionesCompletadas,
      totalLecciones: totalLecciones,
      progresoPorcentaje: progresoPorcentaje,
      puntosTotales: user.programmingProgress.puntosProgramacion || 0,
      leccionActual: user.programmingProgress.leccionActual || 1,
      leccionesDesbloqueadas: user.programmingProgress.leccionesDesbloqueadas || [1]
    });
  } catch (error) {
    console.error("Error obteniendo estado de programación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ========================================
// RUTAS EXISTENTES (MONGODB)
// ========================================

// 🔹 REGISTRO de usuario
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    if (password.length < 3) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 3 caracteres" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      password: hashedPassword,
      color: 0xff0000,
      money: 0,
      educationalPoints: 0,
      sandwichDone: false,
      selectedHat: null,
      ownedHats: [],
      trofeos: {
        bronce: 0,
        plata: 0,
        oro: 0,
        total: 0
      },
      logrosCompletados: [],
      misionesProgreso: {},
      programmingProgress: {
        leccionesCompletadas: [],
        leccionActual: 1,
        puntosProgramacion: 0,
        leccionesDesbloqueadas: [1],
        historialValidaciones: []
      }
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign({ username: newUser.username }, JWT_SECRET);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        username: newUser.username,
        color: newUser.color,
        money: newUser.money,
        educationalPoints: newUser.educationalPoints,
        sandwichDone: newUser.sandwichDone,
        selectedHat: newUser.selectedHat,
        ownedHats: newUser.ownedHats,
        trofeos: newUser.trofeos,
        programmingProgress: newUser.programmingProgress
      }
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 LOGIN de usuario
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET);

    res.json({
      message: "Login exitoso",
      token,
      user: {
        username: user.username,
        color: user.color,
        money: user.money,
        educationalPoints: user.educationalPoints,
        sandwichDone: user.sandwichDone,
        selectedHat: user.selectedHat,
        ownedHats: user.ownedHats,
        trofeos: user.trofeos,
        programmingProgress: user.programmingProgress
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 OBTENER datos del usuario (protegido)
app.get("/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      username: user.username,
      color: user.color,
      money: user.money,
      educationalPoints: user.educationalPoints,
      sandwichDone: user.sandwichDone,
      selectedHat: user.selectedHat,
      ownedHats: user.ownedHats || [],
      trofeos: user.trofeos,
      logrosCompletados: user.logrosCompletados,
      misionesProgreso: user.misionesProgreso,
      programmingProgress: user.programmingProgress
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 ACTUALIZAR datos del usuario (protegido)
app.put("/user", authenticateToken, async (req, res) => {
  try {
    const { 
      color, money, educationalPoints, sandwichDone, trofeos, 
      logrosCompletados, misionesProgreso, selectedHat, ownedHats,
      programmingProgress 
    } = req.body;

    const updateData = {};
    if (color !== undefined) updateData.color = color;
    if (money !== undefined) updateData.money = money;
    if (educationalPoints !== undefined) updateData.educationalPoints = educationalPoints;
    if (sandwichDone !== undefined) updateData.sandwichDone = sandwichDone;
    if (trofeos !== undefined) updateData.trofeos = trofeos;
    if (logrosCompletados !== undefined) updateData.logrosCompletados = logrosCompletados;
    if (misionesProgreso !== undefined) updateData.misionesProgreso = misionesProgreso;
    if (selectedHat !== undefined) updateData.selectedHat = selectedHat;
    if (ownedHats !== undefined) updateData.ownedHats = ownedHats;
    if (programmingProgress !== undefined) updateData.programmingProgress = programmingProgress;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.user.username },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Usuario actualizado exitosamente",
      user: {
        username: updatedUser.username,
        color: updatedUser.color,
        money: updatedUser.money,
        educationalPoints: updatedUser.educationalPoints,
        sandwichDone: updatedUser.sandwichDone,
        selectedHat: updatedUser.selectedHat,
        ownedHats: updatedUser.ownedHats,
        trofeos: updatedUser.trofeos,
        programmingProgress: updatedUser.programmingProgress
      }
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Actualizar puntos educativos
app.post("/update-educational-points", authenticateToken, async (req, res) => {
  try {
    const { points, action = 'add' } = req.body;
    
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (action === 'add') {
      user.educationalPoints += points;
    } else if (action === 'subtract') {
      user.educationalPoints = Math.max(0, user.educationalPoints - points);
    } else if (action === 'set') {
      user.educationalPoints = points;
    }

    await user.save();

    res.json({
      message: `Puntos educativos ${action === 'add' ? 'incrementados' : 'actualizados'} exitosamente`,
      educationalPoints: user.educationalPoints
    });
  } catch (error) {
    console.error("Error actualizando puntos educativos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 COMPRAR sombrero
app.post("/user/purchase-hat", authenticateToken, async (req, res) => {
  try {
    const { hatId, cost, currency } = req.body;
    
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.ownedHats && user.ownedHats.includes(hatId)) {
      return res.status(400).json({ error: "Ya posees este sombrero" });
    }

    if (currency === "points" && user.educationalPoints < cost) {
      return res.status(400).json({ error: "Puntos educativos insuficientes" });
    }
    
    if (currency === "money" && user.money < cost) {
      return res.status(400).json({ error: "Dinero insuficiente" });
    }

    if (currency === "points") {
      user.educationalPoints -= cost;
    } else {
      user.money -= cost;
    }

    if (!user.ownedHats) {
      user.ownedHats = [];
    }

    user.ownedHats.push(hatId);
    user.selectedHat = hatId;

    await user.save();

    res.json({
      message: "Sombrero comprado y equipado exitosamente",
      user: {
        username: user.username,
        money: user.money,
        educationalPoints: user.educationalPoints,
        ownedHats: user.ownedHats,
        selectedHat: user.selectedHat
      }
    });
  } catch (error) {
    console.error("Error comprando sombrero:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 EQUIPAR sombrero
app.post("/user/equip-hat", authenticateToken, async (req, res) => {
  try {
    const { hatId } = req.body;
    
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!user.ownedHats || !user.ownedHats.includes(hatId)) {
      return res.status(400).json({ error: "No posees este sombrero" });
    }

    user.selectedHat = hatId;
    await user.save();

    res.json({
      message: "Sombrero equipado exitosamente",
      user: {
        username: user.username,
        selectedHat: user.selectedHat
      }
    });
  } catch (error) {
    console.error("Error equipando sombrero:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Sincronizar con sistema de logros
app.post("/sync-achievements", authenticateToken, async (req, res) => {
  try {
    const { logros, misiones, trofeos } = req.body;

    const updateData = {};
    if (trofeos) updateData.trofeos = trofeos;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.user.username },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Logros sincronizados exitosamente",
      user: {
        username: updatedUser.username,
        trofeos: updatedUser.trofeos
      }
    });
  } catch (error) {
    console.error("Error sincronizando logros:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ========================================
// RUTAS ADICIONALES
// ========================================

// 🔹 Health check
app.get("/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: "OK", 
      database: "Connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Error", 
      database: "Disconnected",
      error: error.message 
    });
  }
});

// 🔹 Obtener todos los usuarios (solo para desarrollo)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🔹 Eliminar usuario (solo para desarrollo)
app.delete("/user", authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ username: req.user.username });
    if (!deletedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`✅ MongoDB Server running on http://localhost:${PORT}`);
  console.log(`📊 Conectado a: ${MONGODB_URI.split('@')[1]}`);
  console.log(`🧠 Integrado con Programming API`);
  console.log(`🔐 Endpoints disponibles:`);
  console.log(`\n   === AUTENTICACIÓN ===`);
  console.log(`   POST   /register`);
  console.log(`   POST   /login`);
  console.log(`   GET    /user (protegido)`);
  console.log(`   PUT    /user (protegido)`);
  console.log(`\n   === PROGRAMACIÓN (NUEVOS) ===`);
  console.log(`   GET    /programming/progress (protegido)`);
  console.log(`   POST   /programming/validate (protegido)`);
  console.log(`   POST   /programming/complete-lesson (protegido)`);
  console.log(`   POST   /programming/reset (protegido)`);
  console.log(`   GET    /programming/status (protegido)`);
  console.log(`\n   === OTROS ===`);
  console.log(`   POST   /update-educational-points (protegido)`);
  console.log(`   POST   /user/purchase-hat (protegido)`);
  console.log(`   POST   /user/equip-hat (protegido)`);
  console.log(`   POST   /sync-achievements (protegido)`);
  console.log(`   GET    /health`);
});