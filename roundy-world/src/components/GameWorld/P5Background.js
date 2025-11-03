import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { useGame } from '../../contexts/GameContext';

export default function P5Background() {
  const p5Ref = useRef(null);
  const { state } = useGame();
  const { currentMap } = state;

  useEffect(() => {
    console.log('P5Background - currentMap:', currentMap);

    const sketch = (s) => {
      const W = 800, H = 600;

      s.setup = () => {
        s.createCanvas(W, H).parent("p5-container");
        console.log('P5 Canvas created for map:', currentMap);
      };

      s.draw = () => {
        s.push();
        s.noStroke();
        
        if (currentMap === "kitchen") {
          // COCINA - Fondo completo
          s.background("#e9f3fb");
          
          // Pared superior (azulejos)
          s.fill("#f2e9dc");
          s.rect(0, 0, W, 220);
          
          // Ventana
          s.fill("#9fd3ff");
          s.rect(520, 30, 180, 110, 8);
          s.fill("#fff7");
          s.rect(540, 50, 140, 70, 6);
          
          // Línea de separación piso/pared
          s.translate(0, 220);
          
          // Piso
          s.fill("#f8f2e6");
          s.rect(0, 0, W, H - 220);
          s.stroke("#e0d3c3");
          s.strokeWeight(1);
          const tile = 48;
          for (let y = 0; y < H - 220; y += tile) {
            for (let x = 0; x < W; x += tile) {
              s.noFill();
              s.rect(x, y, tile, tile);
            }
          }
          s.pop();

          // Mesa central
          s.push();
          s.noStroke();
          // Sombra de la mesa
          s.fill("#00000022");
          s.ellipse(400, 330, 160, 30);
          // Mesa
          s.fill("#cd853f");
          s.rectMode(s.CENTER);
          s.rect(400, 300, 220, 80, 8);
          // Patas de la mesa
          s.fill("#8b5a2b");
          s.rect(330, 350, 18, 60, 4);
          s.rect(470, 350, 18, 60, 4);
          s.pop();

          // Estufa (esquina izquierda)
          s.push();
          s.fill("#c7c7c7");
          s.rect(90, 280, 140, 120, 6);
          // Parte superior de la estufa
          s.fill("#333");
          s.rect(90, 250, 100, 20, 4);
          // Quemador
          s.fill("#8b0000");
          s.rect(90, 260, 40, 20, 4);
          // Humo animado
          const t = s.millis() / 800;
          s.noFill();
          s.stroke("#ffffff88");
          s.strokeWeight(2);
          for (let i = 0; i < 3; i++) {
            const yy = 235 - ((t + i * 0.6) % 1) * 30;
            s.ellipse(90, yy, 12, 8);
          }
          s.pop();

          // Estantes (esquina derecha superior)
          s.push();
          s.fill("#b3c8a6");
          s.rect(700, 160, 140, 60, 6);
          // Estante pequeño
          s.fill("#8b5a2b");
          s.rect(700, 200, 30, 30, 6);
          s.pop();

          // Puerta Biblioteca (esquina derecha)
          s.push();
          s.fill("#8B4513");
          s.rect(700, 160, 60, 80, 5);
          // Manija
          s.fill("#654321");
          s.rect(730, 200, 8, 4);
          s.pop();

          // Alacena
          s.push();
          s.fill("#a0522d");
          s.rect(200, 160, 100, 120, 5);
          // Puertas de la alacena
          s.fill("#8b4513");
          s.rect(195, 165, 45, 110, 3);
          s.rect(260, 165, 45, 110, 3);
          // Manijas
          s.fill("#d2691e");
          s.rect(210, 220, 6, 4);
          s.rect(285, 220, 6, 4);
          s.pop();

        } else if (currentMap === "library") {
          // BIBLIOTECA - Fondo completo
          s.background("#2c3e50");
          
          // Piso principal
          s.fill("#34495e");
          s.rect(0, 0, W, H);
          
          // Detalles del piso (tablas de madera)
          s.stroke("#2c3e50");
          s.strokeWeight(2);
          for (let i = 0; i < 8; i++) {
            s.line(0, 100 + i * 60, W, 100 + i * 60);
          }
          
          // ESTANTES IZQUIERDOS
          s.push();
          s.fill("#8B4513"); // Color madera oscura
          s.noStroke();
          
          // Estante grande izquierdo
          s.rect(100, 80, 80, 250, 5);
          // Estante pequeño izquierdo
          s.rect(200, 150, 60, 180, 4);
          
          // Libros en estante grande izquierdo (10 libros)
          s.fill("#e74c3c"); s.rect(105, 90, 70, 15, 2);  // Rojo
          s.fill("#3498db"); s.rect(105, 110, 70, 15, 2); // Azul
          s.fill("#f1c40f"); s.rect(105, 130, 70, 15, 2); // Amarillo
          s.fill("#2ecc71"); s.rect(105, 150, 70, 15, 2); // Verde
          s.fill("#9b59b6"); s.rect(105, 170, 70, 15, 2); // Púrpura
          s.fill("#e67e22"); s.rect(105, 190, 70, 15, 2); // Naranja
          s.fill("#1abc9c"); s.rect(105, 210, 70, 15, 2); // Turquesa
          s.fill("#e74c3c"); s.rect(105, 230, 70, 15, 2); // Rojo
          s.fill("#3498db"); s.rect(105, 250, 70, 15, 2); // Azul
          s.fill("#f1c40f"); s.rect(105, 270, 70, 15, 2); // Amarillo
          
          // Libros en estante pequeño izquierdo (9 libros)
          s.fill("#2ecc71"); s.rect(205, 160, 50, 12, 2); // Verde
          s.fill("#9b59b6"); s.rect(205, 175, 50, 12, 2); // Púrpura
          s.fill("#e67e22"); s.rect(205, 190, 50, 12, 2); // Naranja
          s.fill("#1abc9c"); s.rect(205, 205, 50, 12, 2); // Turquesa
          s.fill("#e74c3c"); s.rect(205, 220, 50, 12, 2); // Rojo
          s.fill("#3498db"); s.rect(205, 235, 50, 12, 2); // Azul
          s.fill("#f1c40f"); s.rect(205, 250, 50, 12, 2); // Amarillo
          s.fill("#2ecc71"); s.rect(205, 265, 50, 12, 2); // Verde
          s.fill("#9b59b6"); s.rect(205, 280, 50, 12, 2); // Púrpura
          s.pop();
          
          // ESTANTES DERECHOS
          s.push();
          s.fill("#8B4513");
          s.noStroke();
          
          // Estante grande derecho
          s.rect(620, 80, 80, 250, 5);
          // Estante pequeño derecho
          s.rect(540, 150, 60, 180, 4);
          
          // Libros en estante grande derecho (10 libros)
          s.fill("#1abc9c"); s.rect(625, 90, 70, 15, 2);  // Turquesa
          s.fill("#e67e22"); s.rect(625, 110, 70, 15, 2); // Naranja
          s.fill("#9b59b6"); s.rect(625, 130, 70, 15, 2); // Púrpura
          s.fill("#2ecc71"); s.rect(625, 150, 70, 15, 2); // Verde
          s.fill("#f1c40f"); s.rect(625, 170, 70, 15, 2); // Amarillo
          s.fill("#3498db"); s.rect(625, 190, 70, 15, 2); // Azul
          s.fill("#e74c3c"); s.rect(625, 210, 70, 15, 2); // Rojo
          s.fill("#1abc9c"); s.rect(625, 230, 70, 15, 2); // Turquesa
          s.fill("#e67e22"); s.rect(625, 250, 70, 15, 2); // Naranja
          s.fill("#9b59b6"); s.rect(625, 270, 70, 15, 2); // Púrpura
          
          // Libros en estante pequeño derecho (9 libros)
          s.fill("#2ecc71"); s.rect(545, 160, 50, 12, 2); // Verde
          s.fill("#f1c40f"); s.rect(545, 175, 50, 12, 2); // Amarillo
          s.fill("#3498db"); s.rect(545, 190, 50, 12, 2); // Azul
          s.fill("#e74c3c"); s.rect(545, 205, 50, 12, 2); // Rojo
          s.fill("#1abc9c"); s.rect(545, 220, 50, 12, 2); // Turquesa
          s.fill("#e67e22"); s.rect(545, 235, 50, 12, 2); // Naranja
          s.fill("#9b59b6"); s.rect(545, 250, 50, 12, 2); // Púrpura
          s.fill("#2ecc71"); s.rect(545, 265, 50, 12, 2); // Verde
          s.fill("#f1c40f"); s.rect(545, 280, 50, 12, 2); // Amarillo
          s.pop();
          
          // ÁREA DE COMPUTADORAS - CENTRO INFERIOR
          s.push();
          // Mesa larga de computadoras
          s.fill("#34495e");
          s.rect(100, 350, 600, 150, 10);
          // Separadores entre computadoras
          s.fill("#2c3e50");
          s.rect(120, 370, 150, 110, 5);
          s.rect(290, 370, 150, 110, 5);
          s.rect(460, 370, 150, 110, 5);
          
          // Pantallas de computadoras
          s.fill("#1abc9c");
          s.rect(130, 380, 130, 80, 3);
          s.rect(300, 380, 130, 80, 3);
          s.rect(470, 380, 130, 80, 3);
          
          // Contenido de pantallas (código simulado)
          s.fill("#2c3e50");
          s.textSize(10);
          s.textAlign(s.LEFT, s.TOP);
          s.text("function hello() {\n  return 'World!';\n}", 140, 390);
          s.text("const data = [1, 2, 3];\ndata.map(x => x*2);", 310, 390);
          s.text("class Game {\n  constructor() {\n    this.score = 0;\n  }\n}", 480, 390);
          
          // Teclados
          s.fill("#7f8c8d");
          s.rect(140, 470, 110, 20, 2);
          s.rect(310, 470, 110, 20, 2);
          s.rect(480, 470, 110, 20, 2);
          
          // Teclas del teclado (detalle)
          s.fill("#95a5a6");
          s.rect(145, 475, 8, 5, 1);
          s.rect(155, 475, 8, 5, 1);
          s.rect(165, 475, 8, 5, 1);
          s.pop();
          
          // MESA DE QUIZ - CENTRO SUPERIOR
          s.push();
          s.fill("#16a085");
          s.rect(300, 200, 200, 80, 5);
          s.fill("#1abc9c");
          s.textSize(16);
          s.textAlign(s.CENTER, s.CENTER);
          s.text("📝 Área de Quizzes", 400, 240);
          s.pop();
          
          // PUERTA DE REGRESO - ESQUINA INFERIOR IZQUIERDA
          s.push();
          s.fill("#8B4513");
          s.rect(50, 300, 60, 80, 5);
          // Manija
          s.fill("#654321");
          s.rect(95, 340, 8, 4);
          // Letrero de salida
          s.fill("#fff");
          s.textSize(12);
          s.textAlign(s.CENTER, s.CENTER);
          s.text("Salir", 80, 340);
          s.pop();
          
          // LÁMPARAS/ILUMINACIÓN
          s.push();
          s.fill("#f1c40f");
          s.noStroke();
          // Lámpara central
          s.ellipse(400, 60, 40, 20);
          s.fill("#f39c12");
          s.ellipse(400, 60, 30, 15);
          // Lámparas laterales
          s.fill("#f1c40f");
          s.ellipse(200, 60, 30, 15);
          s.ellipse(600, 60, 30, 15);
          // Rayos de luz
          s.fill("#f1c40f22");
          for (let i = 0; i < 5; i++) {
            s.triangle(
              400, 70,
              350 + i * 25, 120,
              360 + i * 25, 120
            );
          }
          s.pop();
          
          // VENTANAS
          s.push();
          s.fill("#3498db");
          s.rect(250, 100, 80, 40, 3);
          s.rect(470, 100, 80, 40, 3);
          s.fill("#87ceeb");
          s.rect(255, 105, 70, 30, 2);
          s.rect(475, 105, 70, 30, 2);
          // Marcos de ventana
          s.stroke("#2c3e50");
          s.strokeWeight(2);
          s.line(285, 105, 285, 135);
          s.line(255, 120, 325, 120);
          s.line(505, 105, 505, 135);
          s.line(475, 120, 545, 120);
          s.pop();
          
          // CUADROS EN PAREDES
          s.push();
          s.fill("#8b4513");
          s.rect(350, 120, 40, 30, 2);
          s.rect(410, 120, 40, 30, 2);
          s.fill("#f1c40f");
          s.rect(355, 125, 30, 20, 1);
          s.rect(415, 125, 30, 20, 1);
          s.pop();
          
          // ALFOMBRA CENTRAL
          s.push();
          s.fill("#c0392b");
          s.rect(350, 280, 100, 40, 3);
          s.fill("#e74c3c");
          s.rect(355, 285, 90, 30, 2);
          s.pop();

        }
      };
    };

    p5Ref.current = new p5(sketch, document.getElementById("p5-container"));

    return () => {
      if (p5Ref.current) {
        try {
          p5Ref.current.remove();
          p5Ref.current = null;
        } catch (e) {
          console.log('Error removing p5:', e);
        }
      }
    };
  }, [currentMap]);

  return (
    <div
      id="p5-container"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 0,
        width: "800px",
        height: "600px"
      }}
    />
  );
}