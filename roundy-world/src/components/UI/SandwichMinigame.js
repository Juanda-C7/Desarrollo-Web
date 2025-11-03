import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { audioService } from '../../services/audio/audioService';
import { achievementsService } from '../../services/api/achievementsService';

export default function SandwichMinigame() {
  const { state, dispatch } = useGame();
  const { showSandwichMinigame, sandwich, sandwichDone, username, logros } = state;

  const ingredients = [
    { name: "🥬 Lechuga", color: "#4caf50" },
    { name: "🍅 Tomate", color: "#e74c3c" },
    { name: "🧀 Queso", color: "#f1c40f" },
    { name: "🥩 Carne", color: "#8b4513" },
  ];

  const finishSandwich = async () => {
    const requiredIngredients = 4;
    const hasAllIngredients = sandwich.length === requiredIngredients;
    
    if (!hasAllIngredients) {
      alert(`❌ Necesitas usar todos los ingredientes para completar el sandwich!\nTe faltan ${requiredIngredients - sandwich.length} ingredientes.`);
      audioService.playErrorSound();
      return;
    }
    
    dispatch({ type: 'SET_SANDWICH_DONE', payload: true });
    dispatch({ type: 'SHOW_SANDWICH_MINIGAME', payload: false });
    dispatch({ type: 'SHOW_SANDWICH_MESSAGE', payload: true });
    dispatch({ type: 'SET_MONEY', payload: state.money + 5 });
    audioService.playCoinSound();
    
    await checkSandwichAchievements();
  };

  const resetSandwich = () => {
    dispatch({ type: 'RESET_SANDWICH' });
  };

  const checkSandwichAchievements = async () => {
    try {
      // Misión 1: Chef Novato
      const resultadoMision = await achievementsService.updateMisionProgreso(username, 1, 1);
      if (resultadoMision && resultadoMision.completada) {
        audioService.playSuccessSound();
      }

      // Logro 1: Primer Sandwich
      const logroSandwich = logros.find(l => l.nombre.includes("Sandwich"));
      if (logroSandwich && !logroSandwich.completado) {
        const logroCompletado = await achievementsService.completarLogro(username, logroSandwich.id);
        if (logroCompletado) {
          audioService.playSuccessSound();
        }
      }
    } catch (error) {
      console.error("Error actualizando logros:", error);
    }
  };

  function onDragStart(e, ing) {
    e.dataTransfer.setData("ingredient", JSON.stringify(ing));
  }

  function onDrop(e) {
    e.preventDefault();
    const ing = JSON.parse(e.dataTransfer.getData("ingredient"));
    dispatch({ type: 'SET_SANDWICH', payload: [...sandwich, ing] });
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  if (!showSandwichMinigame || sandwichDone) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div
        style={{
          width: 400,
          background: "#fff",
          border: "3px solid #333",
          padding: 20,
          borderRadius: 12,
          position: 'relative'
        }}
      >
        <h3 style={{ marginTop: 0, textAlign: 'center' }}>🥪 Arma tu Sandwich</h3>
        
        {/* Contador de ingredientes */}
        <div style={{
          textAlign: 'center',
          marginBottom: 10,
          padding: '5px 10px',
          backgroundColor: sandwich.length === 4 ? '#4caf50' : '#ff9800',
          color: 'white',
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 'bold'
        }}>
          Ingredientes: {sandwich.length}/4
          {sandwich.length === 4 && ' ✅ Listo!'}
        </div>
        
        <div
          onDrop={onDrop}
          onDragOver={allowDrop}
          style={{
            minHeight: 160,
            border: "2px dashed #ccc",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
            padding: 15,
            background: "#fbfbfb",
            marginBottom: 15
          }}
        >
          {/* Pan superior */}
          <div
            style={{
              width: 160,
              height: 22,
              background: "#deb887",
              borderRadius: "6px 6px 0 0",
              margin: "3px 0",
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          
          {sandwich.map((ing, i) => (
            <div
              key={i}
              style={{
                width: 160,
                height: 20,
                background: ing.color,
                borderRadius: 4,
                margin: "4px 0",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              title={ing.name}
            >
              {ing.name.split(" ")[1]}
            </div>
          ))}
          
          {/* Pan inferior */}
          <div
            style={{
              width: 160,
              height: 22,
              background: "#deb887",
              borderRadius: "0 0 6px 6px",
              margin: "3px 0",
              boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>
        
        {/* Área de ingredientes */}
        <div style={{ marginBottom: 15 }}>
          <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Ingredientes Disponibles</h4>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {ingredients.map((ing) => (
              <div
                key={ing.name}
                draggable
                onDragStart={(e) => onDragStart(e, ing)}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 10,
                  background: ing.color,
                  display: "flex",
                  flexDirection: 'column',
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  cursor: "grab",
                  border: '2px solid #333',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={ing.name}
              >
                {ing.name.split(" ")[0]}
                <div style={{ fontSize: 10, color: 'white', marginTop: 2 }}>
                  {ing.name.split(" ")[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 12,
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={finishSandwich}
            disabled={sandwich.length !== 4}
            style={{
              padding: "10px 20px",
              background: sandwich.length === 4 ? "#4caf50" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: sandwich.length === 4 ? "pointer" : "not-allowed",
              fontWeight: 'bold',
              minWidth: 140
            }}
          >
            {sandwich.length === 4 ? "✅ Terminar Sandwich" : "Completar Ingredientes"}
          </button>
          
          <button
            onClick={resetSandwich}
            style={{
              padding: "10px 15px",
              background: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            🔄 Reiniciar
          </button>
          
          <button
            onClick={() => {
              dispatch({ type: 'SHOW_SANDWICH_MINIGAME', payload: false });
              resetSandwich();
            }}
            style={{
              padding: "10px 15px",
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            ❌ Cancelar
          </button>
        </div>
        
        {/* Instrucciones */}
        <div style={{
          marginTop: 15,
          padding: 10,
          background: '#e3f2fd',
          borderRadius: 8,
          fontSize: 12,
          textAlign: 'center'
        }}>
          💡 <strong>Instrucciones:</strong> Arrastra todos los ingredientes al sandwich
        </div>
      </div>
    </div>
  );
}