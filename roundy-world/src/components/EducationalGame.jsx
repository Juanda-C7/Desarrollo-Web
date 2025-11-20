import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

const EducationalGame = ({ onComplete, cost = 5, username }) => {
  const [lecciones, setLecciones] = useState([]);
  const [leccionActual, setLeccionActual] = useState(null);
  const [codigoUsuario, setCodigoUsuario] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(true);
  const [mostrarPistas, setMostrarPistas] = useState(false);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [output, setOutput] = useState([]);
  const [mostrarOutput, setMostrarOutput] = useState(false);

  // Obtener token del localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (username) {
      cargarLecciones();
      cargarProgreso();
    }
  }, [username]);

  const cargarLecciones = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch('http://localhost:2002/lecciones', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar lecciones');
      }

      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setLecciones(data);
        
        // Seleccionar la primera lección desbloqueada que no esté completada
        const primeraNoCompletada = data.find(leccion => leccion.desbloqueada && !leccion.completada);
        const leccionASeleccionar = primeraNoCompletada || data.find(leccion => leccion.desbloqueada);
        
        if (leccionASeleccionar) {
          setLeccionActual(leccionASeleccionar);
          setCodigoUsuario(leccionASeleccionar.contenido.reto.plantilla);
        }
      }
    } catch (error) {
      console.error('Error cargando lecciones:', error);
      // Fallback hardcodeado
      const leccionesFallback = [
        {
          id: 1,
          titulo: "📝 Introducción a las Funciones",
          descripcion: "Aprende a crear tu primera función en JavaScript",
          dificultad: "principiante",
          desbloqueada: true,
          completada: false,
          contenido: {
            explicacion: "Una función es un bloque de código reutilizable que realiza una tarea específica.",
            reto: {
              tarea: "Completa la función 'saludar' que debe retornar el texto '¡Hola Mundo!'",
              plantilla: "function saludar() {\n  // Tu código aquí\n  return '¡Hola Mundo!';\n}",
              solucion: "function saludar() {\n  return '¡Hola Mundo!';\n}",
              pruebas: [
                { entrada: "saludar()", salidaEsperada: "¡Hola Mundo!" }
              ]
            },
            pistas: [
              "Usa la palabra clave 'return'",
              "El texto va entre comillas",
              "Ejemplo: return 'texto';"
            ]
          }
        }
      ];
      setLecciones(leccionesFallback);
      setLeccionActual(leccionesFallback[0]);
      setCodigoUsuario(leccionesFallback[0].contenido.reto.plantilla);
    }
  };

  const cargarProgreso = async () => {
    if (!username) return;
    
    try {
      const token = getToken();
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch('http://localhost:2002/progreso', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar progreso');
      }

      const data = await response.json();
      
      if (data) {
        setProgreso(data);
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
      // Inicializar progreso vacío para evitar errores
      setProgreso({
        leccionesCompletadas: [],
        puntos: 0,
        leccionActual: 1
      });
    }
  };

  const validarCodigo = async () => {
    if (!codigoUsuario.trim() || !leccionActual) return;
    
    setCargando(true);
    setFeedback('');
    setOutput([]);

    try {
      const token = getToken();
      if (!token) {
        setFeedback('❌ Error: No hay sesión iniciada');
        setCargando(false);
        return;
      }

      const response = await fetch(`http://localhost:2002/lecciones/${leccionActual.id}/validar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigoUsuario }),
      });

      if (!response.ok) {
        throw new Error('Error al validar código');
      }

      const result = await response.json();

      if (result) {
        setFeedback(result.feedback);
        setOutput(result.output || []);
        setMostrarOutput(true);
        
        if (result.esCorrecto) {
          await audioService.playSuccessSound();
          
          // Completar lección
          const completeResponse = await fetch(`http://localhost:2002/lecciones/${leccionActual.id}/completar`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!completeResponse.ok) {
            throw new Error('Error al completar lección');
          }

          const completeResult = await completeResponse.json();
          
          if (completeResult) {
            // Mostrar mensaje de éxito con puntos ganados
            setFeedback(`${result.feedback}\n\n🎉 ${completeResult.mensaje || '¡Lección completada!'}`);
            
            // Recargar lecciones y progreso
            await cargarLecciones();
            await cargarProgreso();
            
            // Notificar al componente padre después de 2 segundos
            setTimeout(() => {
              onComplete(completeResult.puntosGanados || 10);
            }, 2000);
          }
        } else {
          await audioService.playErrorSound();
        }
      }
    } catch (error) {
      console.error('Error validando código:', error);
      setFeedback('❌ Error de conexión. Intenta nuevamente.');
      await audioService.playErrorSound();
    } finally {
      setCargando(false);
    }
  };

  const ejecutarPruebas = async () => {
    if (!codigoUsuario.trim() || !leccionActual) return;
    
    setCargando(true);
    setFeedback('');

    try {
      const token = getToken();
      if (!token) {
        setFeedback('❌ Error: No hay sesión iniciada');
        setCargando(false);
        return;
      }

      const response = await fetch(`http://localhost:2002/lecciones/${leccionActual.id}/validar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigoUsuario }),
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar pruebas');
      }

      const result = await response.json();

      if (result) {
        setOutput(result.output || []);
        setMostrarOutput(true);
        setFeedback('🔍 Ejecutando pruebas...');
        
        if (result.esCorrecto) {
          setFeedback('✅ ¡Todas las pruebas pasaron!');
        } else {
          setFeedback('❌ Algunas pruebas fallaron. Revisa el output.');
        }
      }
    } catch (error) {
      console.error('Error ejecutando pruebas:', error);
      setFeedback('❌ Error ejecutando pruebas.');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarLeccion = (leccion) => {
    if (leccion.desbloqueada) {
      setLeccionActual(leccion);
      setCodigoUsuario(leccion.contenido.reto.plantilla);
      setFeedback('');
      setMostrarExplicacion(true);
      setMostrarPistas(false);
      setMostrarSolucion(false);
      setMostrarOutput(false);
      setOutput([]);
    }
  };

  if (!leccionActual) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        width: '500px'
      }}>
        <div>📚 Cargando lecciones...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '15px',
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '3px solid #3498db'
    }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', textAlign: 'center' }}>
        🧠 Minijuego de Programación - Costo: {cost} monedas
      </h3>

      {/* Información de progreso */}
      {progreso && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          background: '#e8f4fd', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <strong>📊 Tu Progreso:</strong> {progreso.puntos || 0} puntos • 
          {(progreso.leccionesCompletadas || []).length} lecciones completadas
        </div>
      )}

      {/* Selector de lecciones */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          Lecciones disponibles:
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {lecciones.map(leccion => (
            <button
              key={leccion.id}
              onClick={() => seleccionarLeccion(leccion)}
              disabled={!leccion.desbloqueada}
              style={{
                padding: '8px 12px',
                backgroundColor: 
                  leccionActual.id === leccion.id ? '#3498db' :
                  leccion.desbloqueada ? (leccion.completada ? '#27ae60' : '#95a5a6') : '#bdc3c7',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: leccion.desbloqueada ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                opacity: leccion.desbloqueada ? 1 : 0.6
              }}
            >
              {leccion.completada ? '✅ ' : ''}
              {leccion.titulo} {!leccion.desbloqueada && '🔒'}
            </button>
          ))}
        </div>
      </div>

      {/* Lección actual */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#ecf0f1', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          {leccionActual.titulo}
        </h4>
        <p style={{ margin: '0 0 15px 0', lineHeight: '1.4' }}>
          {leccionActual.descripcion}
        </p>

        {/* Explicación */}
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setMostrarExplicacion(!mostrarExplicacion)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '10px'
            }}
          >
            {mostrarExplicacion ? '📖 Ocultar Explicación' : '📖 Mostrar Explicación'}
          </button>
          
          {mostrarExplicacion && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#fff9e6', 
              borderRadius: '5px',
              border: '1px solid #f39c12'
            }}>
              <strong>📚 Explicación:</strong>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', marginTop: '5px' }}>
                {leccionActual.contenido.explicacion}
              </div>
            </div>
          )}
        </div>

        {/* Reto actual */}
        <div style={{ 
          padding: '12px', 
          background: '#2c3e50', 
          color: 'white', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <strong>🎯 Reto:</strong> {leccionActual.contenido.reto.tarea}
        </div>

        {/* Pistas */}
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => setMostrarPistas(!mostrarPistas)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '10px'
            }}
          >
            {mostrarPistas ? '💡 Ocultar Pistas' : '💡 Mostrar Pistas'}
          </button>
          
          {mostrarPistas && leccionActual.contenido.pistas && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#fff3cd', 
              borderRadius: '5px',
              border: '1px solid #ffc107'
            }}>
              <strong>💡 Pistas:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {leccionActual.contenido.pistas.map((pista, index) => (
                  <li key={index} style={{ marginBottom: '3px' }}>{pista}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Solución */}
        <div>
          <button 
            onClick={() => setMostrarSolucion(!mostrarSolucion)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {mostrarSolucion ? '👀 Ocultar Solución' : '👀 Mostrar Solución'}
          </button>
          
          {mostrarSolucion && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#f8d7da', 
              borderRadius: '5px',
              border: '1px solid #dc3545'
            }}>
              <strong>💡 Solución:</strong>
              <pre style={{ 
                background: '#34495e', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '5px', 
                fontSize: '12px',
                marginTop: '8px',
                overflowX: 'auto'
              }}>
                {leccionActual.contenido.reto.solucion}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Editor de código */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📝 Tu Código:</h4>
        <textarea
          value={codigoUsuario}
          onChange={(e) => setCodigoUsuario(e.target.value)}
          placeholder="Escribe tu código aquí..."
          style={{ 
            width: '100%', 
            height: '150px', 
            margin: '10px 0', 
            padding: '10px',
            borderRadius: '5px',
            border: '2px solid #bdc3c7',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Output de pruebas */}
      {mostrarOutput && output.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => setMostrarOutput(!mostrarOutput)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#9b59b6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginBottom: '10px'
            }}
          >
            {mostrarOutput ? '📊 Ocultar Resultados' : '📊 Mostrar Resultados'}
          </button>
          
          {mostrarOutput && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#2c3e50', 
              borderRadius: '5px',
              color: 'white'
            }}>
              <strong>📊 Resultado de Pruebas:</strong>
              {output.map((prueba, index) => (
                <div key={index} style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  background: prueba.pasada ? '#27ae60' : '#e74c3c',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>
                  <div><strong>Prueba:</strong> {prueba.prueba}</div>
                  <div><strong>Resultado:</strong> {JSON.stringify(prueba.resultado)}</div>
                  <div><strong>Esperado:</strong> {JSON.stringify(prueba.esperado)}</div>
                  <div><strong>Estado:</strong> {prueba.pasada ? '✅ PASÓ' : '❌ FALLÓ'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={validarCodigo} 
          disabled={cargando || !codigoUsuario.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: cargando ? '#95a5a6' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: cargando || !codigoUsuario.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            minWidth: '140px'
          }}
        >
          {cargando ? '🔄 Validando...' : '✅ Validar Código'}
        </button>

        <button 
          onClick={ejecutarPruebas}
          disabled={cargando || !codigoUsuario.trim()}
          style={{
            padding: '10px 15px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: cargando || !codigoUsuario.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔍 Ejecutar Pruebas
        </button>

        <button 
          onClick={() => setCodigoUsuario(leccionActual.contenido.reto.plantilla)}
          style={{
            padding: '10px 15px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Reiniciar
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          background: feedback.includes('✅') ? '#d5edda' : '#fff3cd',
          borderRadius: '8px',
          border: `2px solid ${feedback.includes('✅') ? '#28a745' : '#ffc107'}`
        }}>
          <div style={{ lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
            {feedback}
          </div>
        </div>
      )}

      <button 
        onClick={() => onComplete(0)}
        style={{
          marginTop: '15px',
          padding: '8px 15px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Salir del Minijuego
      </button>
    </div>
  );
};

export default EducationalGame;