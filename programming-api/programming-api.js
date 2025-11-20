// programming-api.js - API PARA MINIJUEGOS DE PROGRAMACIÓN CON OUTPUT
const express = require('express');
const cors = require('cors');
const { VM } = require('vm2'); // Para ejecutar código de forma segura

const app = express();
const PORT = 2002;

app.use(cors());
app.use(express.json());

// Base de datos en memoria para lecciones y progreso
let jugadores = {};

// Lecciones globales para todos los jugadores - 10 LECCIONES COMPLETAS
const lecciones = [
    {
        id: 1,
        titulo: "📝 Introducción a las Funciones",
        descripcion: "Aprende a crear tu primera función en JavaScript",
        dificultad: "principiante",
        desbloqueada: true,
        completada: false,
        contenido: {
            explicacion: `Una función es un bloque de código reutilizable que realiza una tarea específica. 
            
En JavaScript, se definen con la palabra clave 'function', seguida del nombre de la función y paréntesis ().`,
            
            reto: {
                tarea: "Completa la función 'saludar' que debe retornar el texto '¡Hola Mundo!'",
                plantilla: "function saludar() {\n  // Tu código aquí\n  return '¡Hola Mundo!';\n}",
                solucion: "function saludar() {\n  return '¡Hola Mundo!';\n}",
                pruebas: [
                    { entrada: "saludar()", salidaEsperada: "¡Hola Mundo!" }
                ]
            },
            
            pistas: [
                "Usa la palabra clave 'return' para devolver un valor",
                "El texto debe ir entre comillas simples o dobles",
                "Recuerda que JavaScript es sensible a mayúsculas y minúsculas"
            ],
            
            ejemplos: [
                "function decirHola() { return 'Hola'; }",
                "function sumar(a, b) { return a + b; }"
            ]
        }
    },
    {
        id: 2,
        titulo: "🔄 Funciones con Parámetros",
        descripcion: "Aprende a pasar información a las funciones",
        dificultad: "principiante", 
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `Los parámetros permiten que las funciones reciban información. Son como variables que se definen entre los paréntesis de la función.`,
            
            reto: {
                tarea: "Completa la función 'sumar' que recibe dos números y retorna su suma",
                plantilla: "function sumar(a, b) {\n  // Tu código aquí\n  return a + b;\n}",
                solucion: "function sumar(a, b) {\n  return a + b;\n}",
                pruebas: [
                    { entrada: "sumar(2, 3)", salidaEsperada: 5 },
                    { entrada: "sumar(10, 5)", salidaEsperada: 15 }
                ]
            },
            
            pistas: [
                "Los parámetros 'a' y 'b' ya están definidos",
                "Usa el operador '+' para sumar los números",
                "No olvides la palabra 'return'"
            ],
            
            ejemplos: [
                "function multiplicar(x, y) { return x * y; }",
                "function concatenar(texto1, texto2) { return texto1 + texto2; }"
            ]
        }
    },
    {
        id: 3,
        titulo: "🎯 Condicionales Básicos",
        descripcion: "Aprende a tomar decisiones en tu código",
        dificultad: "principiante",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `Los condicionales permiten que tu código tome decisiones. La estructura 'if' ejecuta código solo si una condición es verdadera.`,
            
            reto: {
                tarea: "Completa la función 'esMayor' que retorna true si el número es mayor que 10",
                plantilla: "function esMayor(numero) {\n  // Tu código aquí\n  if (numero > 10) {\n    return true;\n  }\n  return false;\n}",
                solucion: "function esMayor(numero) {\n  if (numero > 10) {\n    return true;\n  }\n  return false;\n}",
                pruebas: [
                    { entrada: "esMayor(15)", salidaEsperada: true },
                    { entrada: "esMayor(5)", salidaEsperada: false }
                ]
            },
            
            pistas: [
                "Usa 'if (condición) { }' para el condicional",
                "La condición debe ser 'numero > 10'",
                "Recuerda retornar false si la condición no se cumple"
            ],
            
            ejemplos: [
                "function esPositivo(n) { if (n > 0) return true; return false; }",
                "function esPar(n) { if (n % 2 === 0) return true; return false; }"
            ]
        }
    },
    {
        id: 4,
        titulo: "🔄 Bucles For",
        descripcion: "Aprende a repetir código con bucles",
        dificultad: "intermedio",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `Los bucles 'for' te permiten repetir código múltiples veces. Tienen tres partes: inicialización, condición e incremento.`,
            
            reto: {
                tarea: "Completa la función 'contarHasta5' que retorna un array con números del 1 al 5",
                plantilla: "function contarHasta5() {\n  let resultado = [];\n  // Tu código aquí\n  for (let i = 1; i <= 5; i++) {\n    resultado.push(i);\n  }\n  return resultado;\n}",
                solucion: "function contarHasta5() {\n  let resultado = [];\n  for (let i = 1; i <= 5; i++) {\n    resultado.push(i);\n  }\n  return resultado;\n}",
                pruebas: [
                    { entrada: "contarHasta5()", salidaEsperada: [1, 2, 3, 4, 5] }
                ]
            },
            
            pistas: [
                "Usa 'for (let i = 1; i <= 5; i++)'",
                "Dentro del bucle, usa 'resultado.push(i)'",
                "No olvides retornar el array resultado"
            ],
            
            ejemplos: [
                "for (let i = 0; i < 3; i++) { console.log(i); }",
                "let nums = []; for (let i = 1; i <= 3; i++) { nums.push(i); }"
            ]
        }
    },
    {
        id: 5,
        titulo: "📦 Trabajando con Arrays",
        descripcion: "Aprende métodos básicos de arrays",
        dificultad: "intermedio",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `Los arrays son listas de elementos. Tienen métodos útiles como 'push' para agregar elementos y 'length' para saber cuántos elementos tienen.`,
            
            reto: {
                tarea: "Completa la función 'duplicarArray' que recibe un array y retorna uno nuevo con cada número duplicado",
                plantilla: "function duplicarArray(numeros) {\n  let resultado = [];\n  // Tu código aquí\n  for (let i = 0; i < numeros.length; i++) {\n    resultado.push(numeros[i] * 2);\n  }\n  return resultado;\n}",
                solucion: "function duplicarArray(numeros) {\n  let resultado = [];\n  for (let i = 0; i < numeros.length; i++) {\n    resultado.push(numeros[i] * 2);\n  }\n  return resultado;\n}",
                pruebas: [
                    { entrada: "duplicarArray([1, 2, 3])", salidaEsperada: [2, 4, 6] },
                    { entrada: "duplicarArray([5, 10])", salidaEsperada: [10, 20] }
                ]
            },
            
            pistas: [
                "Usa un bucle 'for' para recorrer el array",
                "La condición del bucle es 'i < numeros.length'",
                "Multiplica cada elemento por 2 antes de agregarlo"
            ],
            
            ejemplos: [
                "let arr = [1, 2, 3]; arr.push(4); // [1, 2, 3, 4]",
                "for (let i = 0; i < arr.length; i++) { console.log(arr[i]); }"
            ]
        }
    },
    {
        id: 6,
        titulo: "🔍 Métodos de Array",
        descripcion: "Aprende métodos modernos de arrays como map y filter",
        dificultad: "intermedio",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `JavaScript tiene métodos poderosos para arrays como map(), filter() y forEach() que hacen el código más limpio y expresivo.`,
            
            reto: {
                tarea: "Completa la función 'elevarAlCuadrado' que recibe un array y retorna uno nuevo con cada número elevado al cuadrado usando map()",
                plantilla: "function elevarAlCuadrado(numeros) {\n  // Tu código aquí\n  return numeros.map(num => num * num);\n}",
                solucion: "function elevarAlCuadrado(numeros) {\n  return numeros.map(num => num * num);\n}",
                pruebas: [
                    { entrada: "elevarAlCuadrado([1, 2, 3])", salidaEsperada: [1, 4, 9] },
                    { entrada: "elevarAlCuadrado([5, 10])", salidaEsperada: [25, 100] }
                ]
            },
            
            pistas: [
                "Usa el método .map() del array",
                "map() recibe una función que transforma cada elemento",
                "La función flecha es: num => num * num"
            ],
            
            ejemplos: [
                "let dobles = [1, 2, 3].map(x => x * 2); // [2, 4, 6]",
                "let textos = [1, 2, 3].map(x => 'Número ' + x);"
            ]
        }
    },
    {
        id: 7,
        titulo: "🎲 Objetos en JavaScript",
        descripcion: "Aprende a trabajar con objetos y sus propiedades",
        dificultad: "intermedio",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `Los objetos son colecciones de propiedades, donde cada propiedad tiene un nombre y un valor. Son fundamentales en JavaScript.`,
            
            reto: {
                tarea: "Completa la función 'crearPersona' que recibe nombre y edad, y retorna un objeto con esas propiedades",
                plantilla: "function crearPersona(nombre, edad) {\n  // Tu código aquí\n  return { nombre: nombre, edad: edad };\n}",
                solucion: "function crearPersona(nombre, edad) {\n  return { nombre: nombre, edad: edad };\n}",
                pruebas: [
                    { entrada: "crearPersona('Ana', 25)", salidaEsperada: { nombre: 'Ana', edad: 25 } }
                ]
            },
            
            pistas: [
                "Usa llaves {} para crear un objeto",
                "Las propiedades se definen como nombre: valor",
                "Separa las propiedades con comas"
            ],
            
            ejemplos: [
                "let persona = { nombre: 'Ana', edad: 25 };",
                "function crearCoche(marca, modelo) { return { marca, modelo }; }"
            ]
        }
    },
    {
        id: 8,
        titulo: "⚡ Arrow Functions",
        descripcion: "Aprende la sintaxis moderna de funciones flecha",
        dificultad: "intermedio",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `Las arrow functions (funciones flecha) son una sintaxis más corta para escribir funciones en JavaScript. Son especialmente útiles para funciones simples.`,
            
            reto: {
                tarea: "Convierte la función 'multiplicar' a una arrow function",
                plantilla: "const multiplicar = // Tu código aquí\nconst multiplicar = (a, b) => a * b;",
                solucion: "const multiplicar = (a, b) => a * b;",
                pruebas: [
                    { entrada: "multiplicar(3, 4)", salidaEsperada: 12 },
                    { entrada: "multiplicar(5, 6)", salidaEsperada: 30 }
                ]
            },
            
            pistas: [
                "Usa la sintaxis: (parámetros) => expresión",
                "Si es una sola expresión, no necesitas return",
                "Si es un solo parámetro, no necesitas paréntesis"
            ],
            
            ejemplos: [
                "const sumar = (a, b) => a + b;",
                "const cuadrado = x => x * x;",
                "const saludar = () => 'Hola Mundo';"
            ]
        }
    },
    {
        id: 9,
        titulo: "🛡️ Manejo de Errores",
        descripcion: "Aprende a manejar errores con try-catch",
        dificultad: "avanzado",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `El manejo de errores permite que tu código se recupere de situaciones inesperadas. Se usa try para el código que puede fallar y catch para manejar el error.`,
            
            reto: {
                tarea: "Completa la función 'dividirSeguro' que divide dos números, pero retorna null si hay división por cero",
                plantilla: "function dividirSeguro(a, b) {\n  // Tu código aquí\n  if (b === 0) {\n    return null;\n  }\n  return a / b;\n}",
                solucion: "function dividirSeguro(a, b) {\n  if (b === 0) {\n    return null;\n  }\n  return a / b;\n}",
                pruebas: [
                    { entrada: "dividirSeguro(10, 2)", salidaEsperada: 5 },
                    { entrada: "dividirSeguro(10, 0)", salidaEsperada: null }
                ]
            },
            
            pistas: [
                "Primero verifica si el divisor es cero",
                "Si es cero, retorna null",
                "Si no, realiza la división normal"
            ],
            
            ejemplos: [
                "try { resultado = peligroso(); } catch (error) { console.log(error); }",
                "if (divisor !== 0) { resultado = dividendo / divisor; }"
            ]
        }
    },
    {
        id: 10,
        titulo: "🎯 Proyecto Final",
        descripcion: "Combina todo lo aprendido en un proyecto práctico",
        dificultad: "avanzado",
        desbloqueada: false,
        completada: false,
        contenido: {
            explicacion: `En este proyecto final, combinarás funciones, arrays, objetos y condicionales para crear una aplicación pequeña pero completa.`,
            
            reto: {
                tarea: "Crea una función 'filtrarYTransformar' que recibe un array de números, filtra los mayores que 5 y los transforma a strings",
                plantilla: "function filtrarYTransformar(numeros) {\n  // Tu código aquí\n  return numeros\n    .filter(num => num > 5)\n    .map(num => 'Número: ' + num);\n}",
                solucion: "function filtrarYTransformar(numeros) {\n  return numeros\n    .filter(num => num > 5)\n    .map(num => 'Número: ' + num);\n}",
                pruebas: [
                    { entrada: "filtrarYTransformar([1, 6, 3, 8])", salidaEsperada: ['Número: 6', 'Número: 8'] }
                ]
            },
            
            pistas: [
                "Usa .filter() primero para filtrar",
                "Luego usa .map() para transformar",
                "Encadena los métodos: array.filter().map()"
            ],
            
            ejemplos: [
                "let resultado = [1, 6, 3, 8].filter(x => x > 5).map(x => x * 2);",
                "function procesarDatos(datos) { return datos.filter().map(); }"
            ]
        }
    }
];

// ========================================
// RUTAS DE LECCIONES
// ========================================

// GET /lecciones - Obtener todas las lecciones
app.get('/lecciones', (req, res) => {
    res.json(lecciones);
});

// GET /lecciones/:id - Obtener una lección específica
app.get('/lecciones/:id', (req, res) => {
    const leccionId = Number(req.params.id);
    const leccion = lecciones.find(l => l.id === leccionId);
    
    if (!leccion) {
        return res.status(404).json({ error: 'Lección no encontrada' });
    }
    
    res.json(leccion);
});

// ========================================
// RUTAS DE PROGRESO
// ========================================

// GET /progreso/:jugadorId - Obtener progreso del jugador
app.get('/progreso/:jugadorId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    
    // Si el jugador no existe, crear uno nuevo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            leccionesCompletadas: [],
            puntos: 0,
            leccionActual: 1
        };
    }
    
    res.json(jugadores[jugadorId]);
});

// PATCH /lecciones/:jugadorId/:leccionId/completar - Completar lección
app.patch('/lecciones/:jugadorId/:leccionId/completar', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const leccionId = Number(req.params.leccionId);
    
    const leccion = lecciones.find(l => l.id === leccionId);
    
    if (!leccion) {
        return res.status(404).json({ error: 'Lección no encontrada' });
    }
    
    if (!leccion.desbloqueada) {
        return res.status(400).json({ error: 'Lección no desbloqueada' });
    }
    
    // Si el jugador no existe, crearlo
    if (!jugadores[jugadorId]) {
        jugadores[jugadorId] = {
            leccionesCompletadas: [],
            puntos: 0,
            leccionActual: 1
        };
    }
    
    // Marcar lección como completada
    leccion.completada = true;
    
    // Actualizar progreso del jugador
    if (!jugadores[jugadorId].leccionesCompletadas.includes(leccionId)) {
        jugadores[jugadorId].leccionesCompletadas.push(leccionId);
        jugadores[jugadorId].puntos += 10;
        jugadores[jugadorId].leccionActual = leccionId + 1;
    }
    
    // Desbloquear siguiente lección
    const siguienteLeccion = lecciones.find(l => l.id === leccionId + 1);
    if (siguienteLeccion) {
        siguienteLeccion.desbloqueada = true;
    }
    
    res.json({ 
        leccion,
        progreso: jugadores[jugadorId],
        siguienteLeccionDesbloqueada: !!siguienteLeccion,
        puntosGanados: 10,
        mensaje: `¡Lección "${leccion.titulo}" completada! Ganaste 10 puntos.`
    });
});

// PATCH /lecciones/:jugadorId/:leccionId/validar - Validar código del usuario CON OUTPUT
app.patch('/lecciones/:jugadorId/:leccionId/validar', (req, res) => {
    const jugadorId = req.params.jugadorId;
    const leccionId = Number(req.params.leccionId);
    const { codigoUsuario } = req.body;
    
    const leccion = lecciones.find(l => l.id === leccionId);
    
    if (!leccion) {
        return res.status(404).json({ error: 'Lección no encontrada' });
    }
    
    // Validación del código con ejecución y pruebas
    const resultadoValidacion = validarYEjecutarCodigo(codigoUsuario, leccion.contenido.reto);
    
    res.json({
        esCorrecto: resultadoValidacion.esCorrecto,
        feedback: resultadoValidacion.feedback,
        output: resultadoValidacion.output,
        pruebas: resultadoValidacion.pruebas,
        solucion: resultadoValidacion.esCorrecto ? null : leccion.contenido.reto.solucion
    });
});

// Función mejorada para validar y ejecutar código
function validarYEjecutarCodigo(codigoUsuario, reto) {
    try {
        // Crear un entorno de ejecución seguro
        const vm = new VM({
            timeout: 1000,
            sandbox: {}
        });
        
        // Ejecutar el código del usuario
        vm.run(codigoUsuario);
        
        // Ejecutar las pruebas
        const resultadosPruebas = [];
        let todasLasPruebasPasaron = true;
        
        for (const prueba of reto.pruebas) {
            try {
                const resultado = vm.run(prueba.entrada);
                const pruebaPasada = JSON.stringify(resultado) === JSON.stringify(prueba.salidaEsperada);
                
                resultadosPruebas.push({
                    prueba: prueba.entrada,
                    resultado: resultado,
                    esperado: prueba.salidaEsperada,
                    pasada: pruebaPasada
                });
                
                if (!pruebaPasada) {
                    todasLasPruebasPasaron = false;
                }
            } catch (error) {
                resultadosPruebas.push({
                    prueba: prueba.entrada,
                    resultado: `Error: ${error.message}`,
                    esperado: prueba.salidaEsperada,
                    pasada: false
                });
                todasLasPruebasPasaron = false;
            }
        }
        
        // Validación de sintaxis adicional
        const esValido = validarCodigo(codigoUsuario, reto.solucion);
        
        return {
            esCorrecto: todasLasPruebasPasaron && esValido,
            feedback: todasLasPruebasPasaron 
                ? "✅ ¡Correcto! Tu código pasa todas las pruebas."
                : "❌ Tu código necesita ajustes. Revisa los resultados de las pruebas.",
            output: resultadosPruebas,
            pruebas: resultadosPruebas
        };
        
    } catch (error) {
        return {
            esCorrecto: false,
            feedback: `❌ Error de sintaxis: ${error.message}`,
            output: [],
            pruebas: []
        };
    }
}

// PATCH /reiniciar-progreso/:jugadorId - Reiniciar progreso del jugador
app.patch('/reiniciar-progreso/:jugadorId', (req, res) => {
    const jugadorId = req.params.jugadorId;
    
    // Reiniciar lecciones
    lecciones.forEach(leccion => {
        leccion.completada = false;
        leccion.desbloqueada = leccion.id === 1; // Solo la primera desbloqueada
    });
    
    // Reiniciar progreso del jugador
    jugadores[jugadorId] = {
        leccionesCompletadas: [],
        puntos: 0,
        leccionActual: 1
    };
    
    res.json({ 
        mensaje: 'Progreso reiniciado exitosamente',
        progreso: jugadores[jugadorId]
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
            leccionesCompletadas: [],
            puntos: 0,
            leccionActual: 1
        };
    }
    
    const leccionesCompletadas = jugadores[jugadorId].leccionesCompletadas.length;
    const totalLecciones = lecciones.length;
    const progresoPorcentaje = totalLecciones > 0 ? Math.round((leccionesCompletadas / totalLecciones) * 100) : 0;
    
    res.json({
        jugadorId,
        progreso: jugadores[jugadorId],
        leccionesCompletadas: leccionesCompletadas,
        totalLecciones: totalLecciones,
        progresoPorcentaje: progresoPorcentaje,
        puntosTotales: jugadores[jugadorId].puntos,
        leccionActual: jugadores[jugadorId].leccionActual
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
            leccionesCompletadas: [],
            puntos: 0,
            leccionActual: 1
        };
    }
    
    res.json({ 
        message: 'Jugador inicializado correctamente', 
        progreso: jugadores[jugadorId]
    });
});

// Función de validación de código mejorada
function validarCodigo(codigoUsuario, solucion) {
    try {
        // Limpiar y normalizar ambos códigos
        const limpiarCodigo = (codigo) => {
            return codigo
                .replace(/\s/g, '') // Eliminar todos los espacios
                .replace(/\/\/.*$/gm, '') // Eliminar comentarios de una línea
                .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios multilínea
                .toLowerCase();
        };
        
        const usuarioLimpio = limpiarCodigo(codigoUsuario);
        const solucionLimpia = limpiarCodigo(solucion);
        
        console.log("Código usuario limpio:", usuarioLimpio.substring(0, 50) + "...");
        console.log("Solución limpia:", solucionLimpia.substring(0, 50) + "...");
        
        // Comparación más flexible
        const similitud = calcularSimilitud(usuarioLimpio, solucionLimpia);
        
        console.log("Similitud calculada:", similitud);
        
        // Considerar correcto si la similitud es mayor al 70%
        return similitud > 0.7 || 
               usuarioLimpio.includes(solucionLimpia.substring(0, 20)) || 
               solucionLimpia.includes(usuarioLimpio.substring(0, 20));
    } catch (error) {
        console.error("Error en validación:", error);
        return false;
    }
}

// Función para calcular similitud entre strings
function calcularSimilitud(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - calcularDistancia(longer, shorter)) / parseFloat(longer.length);
}

// Función para calcular distancia de edición
function calcularDistancia(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡API de Minijuegos de Programación del Juego Roundy World!');
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🧠 API de Programación escuchando en http://localhost:${PORT}`);
    console.log(`📚 Total de lecciones: ${lecciones.length}`);
    console.log(`🎯 Endpoints disponibles:`);
    console.log(`   GET    /lecciones                          - Todas las lecciones`);
    console.log(`   GET    /lecciones/:id                      - Lección específica`);
    console.log(`   GET    /progreso/:jugadorId                - Progreso del jugador`);
    console.log(`   PATCH  /lecciones/:jugadorId/:leccionId/completar - Completar lección`);
    console.log(`   PATCH  /lecciones/:jugadorId/:leccionId/validar - Validar código con OUTPUT`);
    console.log(`   PATCH  /reiniciar-progreso/:jugadorId      - Reiniciar progreso`);
    console.log(`   GET    /estado/:jugadorId                  - Estado completo`);
    console.log(`   POST   /inicializar-jugador                - Inicializar jugador`);
});