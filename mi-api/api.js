// ========================================
// API PARA LOGROS Y MISIONES DEL JUEGO ROUNDY WORLD
// ========================================
<<<<<<< HEAD
//Comentario
=======
//En esta carpeta se hicieron los cambios de entrega_10
>>>>>>> entrega9y10
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 2001;

app.use(cors());
app.use(express.json());

// Base de datos en memoria solo para logros y misiones
let jugadores = {}; // { username: { logros: [], progresoMisiones: {} } }

// Misiones globales para todos los jugadores
const misiones = [
    { 
        id: 1, 
        nombre: "🍽️ Chef Novato", 
        descripcion: "Prepara tu primer sandwich",
        recompensa: "🥉",
        tipo: "cocina"
    },
    { 
        id: 2, 
        nombre: "🎓 Aprendiz del Saber", 
        descripcion: "Completa una lección educativa",
        recompensa: "🥈",
        tipo: "educacion"
    },
    { 
        id: 3, 
        nombre: "🏛️ Explorador Académico", 
        descripcion: "Visita la biblioteca por primera vez",
        recompensa: "🥉",
        tipo: "exploracion"
    },
    { 
        id: 4, 
        nombre: "🏆 Maestro de Quizzes", 
        descripcion: "Completa un quiz correctamente",
        recompensa: "🥇",
        tipo: "educacion"
    }
];

// ========================================
// RUTAS DE LOGROS
// ========================================

// GET /logros/:jugadorId - Obtener logros de un jugador
app.get('/logros/:jugadorId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    
    // Si el jugador no existe, devolver logros base
    if (!jugadores[jugadorId]) {
        const logrosBase = crearLogrosBase(jugadorId);
        jugadores[jugadorId] = {
            logros: logrosBase,
            progresoMisiones: {}
        };
        return res.json(logrosBase);
    }
    
    res.json(jugadores[jugadorId].logros);
});

// GET /logros/:jugadorId/:logroId - Obtener un logro específico
app.get('/logros/:jugadorId/:logroId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const logroId = Number(req.params.logroId);
    
    if (!jugadores[jugadorId]) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    const logro = jugadores[jugadorId].logros.find(l => l.id === logroId);
    
    if (!logro) {
        return res.status(404).json({ error: 'Logro no encontrado' });
    }
    
    res.json(logro);
});

// POST /logros/:jugadorId - Crear nuevo logro
app.post('/logros/:jugadorId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const { nombre, descripcion, tipo, recompensa, icono } = req.body;
    
    if (!nombre) {
        return res.status(422).json({ error: 'El campo "nombre" es obligatorio' });
    }
    
    // Si el jugador no existe, crearlo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            logros: crearLogrosBase(jugadorId),
            progresoMisiones: {}
        };
    }
    
    const nuevoId = jugadores[jugadorId].logros.length > 0 
        ? Math.max(...jugadores[jugadorId].logros.map(l => l.id)) + 1 
        : 1;
    
    const nuevoLogro = {
        id: nuevoId,
        jugadorId,
        nombre,
        descripcion: descripcion || "Nuevo logro personalizado",
        completado: false,
        tipo: tipo || "general",
        recompensa: recompensa || "🥉",
        icono: icono || "🎯"
    };
    
    jugadores[jugadorId].logros.push(nuevoLogro);
    res.status(201).json(nuevoLogro);
});

// PATCH /logros/:jugadorId/:logroId/completar - Marcar logro como completado
app.patch('/logros/:jugadorId/:logroId/completar', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const logroId = Number(req.params.logroId);
    
    // Si el jugador no existe, crearlo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            logros: crearLogrosBase(jugadorId),
            progresoMisiones: {}
        };
    }
    
    const logro = jugadores[jugadorId].logros.find(l => l.id === logroId);
    
    if (!logro) {
        return res.status(404).json({ error: 'Logro no encontrado' });
    }

    if (!logro.completado) {
        logro.completado = true;
    }

    res.json({ 
        logro, 
        mensaje: `¡Logro ${logro.nombre} completado! Ganaste: ${logro.recompensa}`
    });
});

// DELETE /logros/:jugadorId/:logroId - Eliminar un logro
app.delete('/logros/:jugadorId/:logroId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const logroId = Number(req.params.logroId);
    
    if (!jugadores[jugadorId]) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    
    const logroIndex = jugadores[jugadorId].logros.findIndex(l => l.id === logroId);
    
    if (logroIndex === -1) {
        return res.status(404).json({ error: 'Logro no encontrado' });
    }
    
    const logroEliminado = jugadores[jugadorId].logros.splice(logroIndex, 1)[0];
    res.json(logroEliminado);
});

// ========================================
// RUTAS DE MISIONES
// ========================================

// GET /misiones - Obtener todas las misiones
app.get('/misiones', (req, res) => {
    res.json(misiones);
});

// GET /misiones/:id - Obtener una misión específica
app.get('/misiones/:id', (req, res) => {
    const misionId = Number(req.params.id);
    const mision = misiones.find(m => m.id === misionId);
    
    if (!mision) {
        return res.status(404).json({ error: 'Misión no encontrada' });
    }
    
    res.json(mision);
});

// PATCH /misiones/:jugadorId/:misionId/progreso - Actualizar progreso de misión
app.patch('/misiones/:jugadorId/:misionId/progreso', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const misionId = Number(req.params.misionId);
    
    const mision = misiones.find(m => m.id === misionId);
    
    if (!mision) {
        return res.status(404).json({ error: 'Misión no encontrada' });
    }

    // Si el jugador no existe, crearlo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            logros: crearLogrosBase(jugadorId),
            progresoMisiones: {}
        };
    }

    // Inicializar progreso de misiones si no existe
    if (!jugadores[jugadorId].progresoMisiones[misionId]) {
        jugadores[jugadorId].progresoMisiones[misionId] = {
            progresoActual: 0,
            completada: false
        };
    }

    const { incremento } = req.body;
    jugadores[jugadorId].progresoMisiones[misionId].progresoActual += Number(incremento) || 1;
    
    let completada = false;
    if (jugadores[jugadorId].progresoMisiones[misionId].progresoActual >= 1 && 
        !jugadores[jugadorId].progresoMisiones[misionId].completada) {
        jugadores[jugadorId].progresoMisiones[misionId].completada = true;
        completada = true;
    }

    res.json({ 
        mision, 
        progreso: jugadores[jugadorId].progresoMisiones[misionId],
        completada,
        mensaje: completada ? `¡Misión ${mision.nombre} completada! Ganaste: ${mision.recompensa}` : "Progreso actualizado"
    });
});

// ========================================
// RUTAS ESPECIALES PARA EL JUEGO
// ========================================

// GET /estado/:jugadorId - Estado completo del jugador
app.get('/estado/:jugadorId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    
    // Si el jugador no existe, crear uno nuevo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            logros: crearLogrosBase(jugadorId),
            progresoMisiones: {}
        };
        
        // Inicializar progreso de misiones
        misiones.forEach(mision => {
            jugadores[jugadorId].progresoMisiones[mision.id] = {
                progresoActual: 0,
                completada: false
            };
        });
    }
    
    const logrosJugador = jugadores[jugadorId].logros;
    const logrosCompletados = logrosJugador.filter(l => l.completado);
    
    // Calcular trofeos basados en logros completados
    const trofeos = {
        bronce: logrosCompletados.filter(l => l.recompensa === "🥉").length,
        plata: logrosCompletados.filter(l => l.recompensa === "🥈").length,
        oro: logrosCompletados.filter(l => l.recompensa === "🥇").length,
        total: logrosCompletados.length
    };
    
    // Obtener misiones activas (no completadas por este jugador)
    const misionesActivas = misiones.filter(mision => {
        const progreso = jugadores[jugadorId].progresoMisiones[mision.id];
        return !progreso || !progreso.completada;
    });
    
    res.json({
        jugadorId,
        logros: logrosJugador,
        misiones: misionesActivas,
        trofeos: trofeos,
        totalLogros: logrosJugador.length,
        logrosCompletados: logrosCompletados.length,
        misionesActivas: misionesActivas.length,
        progresoTotal: logrosJugador.length > 0 ? Math.round((logrosCompletados.length / logrosJugador.length) * 100) : 0
    });
});

// POST /inicializar-jugador - Inicializar jugador
app.post('/inicializar-jugador', (req, res) => {
    const { jugadorId } = req.body;
    
    if (!jugadorId) {
        return res.status(422).json({ error: 'El campo "jugadorId" es obligatorio' });
    }
    
    // Si el jugador no existe, crearlo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            logros: crearLogrosBase(jugadorId),
            progresoMisiones: {}
        };
        
        // Inicializar progreso de misiones
        misiones.forEach(mision => {
            jugadores[jugadorId].progresoMisiones[mision.id] = {
                progresoActual: 0,
                completada: false
            };
        });
    }
    
    res.json({ 
        message: 'Jugador inicializado correctamente', 
        logros: jugadores[jugadorId].logros
    });
});

// Función para crear logros base para cualquier jugador
function crearLogrosBase(jugadorId) {
    return [
        { 
            id: 1,
            jugadorId, 
            nombre: "🧑‍🍳 Primer Sandwich", 
            descripcion: "Completa tu primer sandwich",
            completado: false,
            tipo: "cocina",
            recompensa: "🥉",
            icono: "🥪"
        },
        { 
            id: 2,
            jugadorId, 
            nombre: "📚 Estudiante Aplicado", 
            descripcion: "Completa una lección educativa",
            completado: false,
            tipo: "educacion",
            recompensa: "🥈",
            icono: "🧠"
        },
        { 
            id: 3,
            jugadorId, 
            nombre: "🏛️ Explorador Académico", 
            descripcion: "Descubre la biblioteca",
            completado: false,
            tipo: "exploracion",
            recompensa: "🥉",
            icono: "🏛️"
        },
        { 
            id: 4,
            jugadorId, 
            nombre: "🏆 Campeón del Conocimiento", 
            descripcion: "Completa un quiz exitosamente",
            completado: false,
            tipo: "educacion",
            recompensa: "🥇",
            icono: "🏆"
        }
    ];
}

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡API de Logros y Misiones del Juego Roundy World!');
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🎮 API de Logros y Misiones escuchando en http://localhost:${PORT}`);
    console.log(`Endpoints disponibles:`);
    console.log(`   LOGROS:`);
    console.log(`     GET    /logros/:jugadorId                   - Logros del jugador`);
    console.log(`     GET    /logros/:jugadorId/:logroId          - Logro específico`);
    console.log(`     POST   /logros/:jugadorId                   - Crear logro`);
    console.log(`     PATCH  /logros/:jugadorId/:logroId/completar - Completar logro`);
    console.log(`     DELETE /logros/:jugadorId/:logroId          - Eliminar logro`);
    console.log(`   MISIONES:`);
    console.log(`     GET    /misiones                           - Todas las misiones`);
    console.log(`     GET    /misiones/:id                       - Misión específica`);
    console.log(`     PATCH  /misiones/:jugadorId/:misionId/progreso - Actualizar progreso`);
    console.log(`   ESPECIALES:`);
    console.log(`     GET    /estado/:jugadorId                  - Estado completo`);
    console.log(`     POST   /inicializar-jugador                - Inicializar jugador`);
});