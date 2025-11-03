import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useGame } from '../../contexts/GameContext';
import { audioService } from '../../services/audio/audioService';

export default function PhaserGame() {
  const phaserRef = useRef(null);
  const rafRef = useRef(null);
  const { state, dispatch } = useGame();
  const { sandwichDone, currentMap, color } = state;

  // RAF loop para actualizar posición del jugador
  useEffect(() => {
    const updateSvgPosition = () => {
      try {
        const playerObj = window.phaserPlayer;
        const svgEl = document.getElementById('svg-player');
        if (playerObj && svgEl) {
          const x = playerObj.x;
          const y = playerObj.y;
          svgEl.style.left = `${x}px`;
          svgEl.style.top = `${y}px`;

          // Dispatch eventos de proximidad
          const nearTable = !!window.nearTable;
          const nearLibrary = !!window.nearLibraryDoor;
          const nearExit = !!window.nearExitDoor;
          
          window.dispatchEvent(new CustomEvent("nearTableUpdate", { detail: { near: nearTable } }));
          window.dispatchEvent(new CustomEvent("nearLibraryUpdate", { detail: { near: nearLibrary } }));
          window.dispatchEvent(new CustomEvent("nearExitUpdate", { detail: { near: nearExit } }));
        }
      } catch (err) {
        // Silently catch errors during position update
      }
      rafRef.current = requestAnimationFrame(updateSvgPosition);
    };

    if (state.step === "world") {
      rafRef.current = requestAnimationFrame(updateSvgPosition);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state.step]);

  useEffect(() => {
    // Destruir Phaser anterior si existe
    if (phaserRef.current) {
      if (phaserRef.currentCleanup) phaserRef.currentCleanup();
      phaserRef.current.destroy(true);
      phaserRef.current = null;
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "game-stage",
      transparent: true,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: { 
        preload, 
        create, 
        update 
      },
    };

    let player;
    let cursors;
    let keyA, keyE;
    let obstacles = []; // Array para almacenar todos los obstáculos

    function preload() {
      // No necesitamos cargar assets para este ejemplo
    }

    function create() {
      const floor = this.add.rectangle(400, 300, 800, 600, 0xffffff, 0);
      this.physics.add.existing(floor, true);

      // Limpiar array de obstáculos
      obstacles = [];

      // Paredes - agregar al array de obstáculos
      const walls = [
        this.add.rectangle(400, 5, 800, 10, 0x000000, 0),
        this.add.rectangle(400, 595, 800, 10, 0x000000, 0),
        this.add.rectangle(5, 300, 10, 600, 0x000000, 0),
        this.add.rectangle(795, 300, 10, 600, 0x000000, 0),
      ];
      
      walls.forEach((w) => {
        this.physics.add.existing(w, true);
        obstacles.push(w);
      });

      if (currentMap === "kitchen") {
        // OBSTÁCULOS COCINA
        const table = this.add.rectangle(400, 300, 240, 100, 0x000000, 0);
        this.physics.add.existing(table, true);
        obstacles.push(table);

        const chair1 = this.add.rectangle(330, 350, 35, 35, 0x000000, 0);
        const chair2 = this.add.rectangle(470, 350, 35, 35, 0x000000, 0);
        this.physics.add.existing(chair1, true);
        this.physics.add.existing(chair2, true);
        obstacles.push(chair1, chair2);

        const stove = this.add.rectangle(90, 280, 150, 130, 0x000000, 0);
        this.physics.add.existing(stove, true);
        obstacles.push(stove);

        const libraryDoor = this.add.rectangle(700, 200, 70, 90, 0x000000, 0);
        this.physics.add.existing(libraryDoor, true);
        obstacles.push(libraryDoor);

        // Señales visuales COCINA
        const exclamation = this.add
          .text(400, 230, "!", {
            font: "48px Arial",
            fill: "#ff0000",
            fontStyle: "bold",
            stroke: "#ffffff",
            strokeThickness: 4
          })
          .setOrigin(0.5, 0.5)
          .setDepth(1000);
        
        window.tableExclamation = exclamation;

        const librarySign = this.add
          .text(700, 130, "📚", {
            font: "32px Arial",
            stroke: "#000000",
            strokeThickness: 3
          })
          .setOrigin(0.5, 0.5)
          .setDepth(1000);
        
        window.librarySign = librarySign;

      } else if (currentMap === "library") {
        // OBSTÁCULOS BIBLIOTECA
        
        // Estantes izquierdos
        const leftShelf1 = this.add.rectangle(140, 205, 100, 270, 0x000000, 0);
        const leftShelf2 = this.add.rectangle(230, 240, 80, 210, 0x000000, 0);
        this.physics.add.existing(leftShelf1, true);
        this.physics.add.existing(leftShelf2, true);
        obstacles.push(leftShelf1, leftShelf2);

        // Estantes derechos
        const rightShelf1 = this.add.rectangle(660, 205, 100, 270, 0x000000, 0);
        const rightShelf2 = this.add.rectangle(570, 240, 80, 210, 0x000000, 0);
        this.physics.add.existing(rightShelf1, true);
        this.physics.add.existing(rightShelf2, true);
        obstacles.push(rightShelf1, rightShelf2);

        // Área de computadoras
        const computerArea = this.add.rectangle(400, 425, 620, 170, 0x000000, 0);
        this.physics.add.existing(computerArea, true);
        obstacles.push(computerArea);

        // Mesa de quiz
        const quizTable = this.add.rectangle(400, 240, 220, 100, 0x000000, 0);
        this.physics.add.existing(quizTable, true);
        obstacles.push(quizTable);

        // Puerta de salida
        const exitDoor = this.add.rectangle(80, 340, 70, 90, 0x000000, 0);
        this.physics.add.existing(exitDoor, true);
        obstacles.push(exitDoor);

        // Señal de salida
        const exitSign = this.add
          .text(80, 280, "🚪", {
            font: "24px Arial",
            stroke: "#000000",
            strokeThickness: 3
          })
          .setOrigin(0.5, 0.5)
          .setDepth(1000);
        
        window.exitSign = exitSign;
      }

      // Jugador - posición inicial según el mapa
      let startX, startY;
      if (currentMap === "kitchen") {
        startX = 50;
        startY = 300;
      } else {
        startX = 700; // Posición cerca de la puerta en biblioteca
        startY = 300;
      }

      player = this.add.circle(startX, startY, 16, 0xffffff, 0);
      this.physics.add.existing(player);
      player.body.setCollideWorldBounds(true, 1, 1, true);
      player.body.setCircle(16);
      player.body.setOffset(-16, -16);
      
      player.body.setBounce(0.1, 0.1);
      player.body.setDrag(800, 800);
      player.body.setMaxVelocity(200, 200);

      // Colisiones con todos los obstáculos
      obstacles.forEach((obs) => {
        this.physics.add.collider(player, obs, null, null, this);
      });

      cursors = this.input.keyboard.createCursorKeys();
      keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

      window.phaserScene = this;
      window.phaserPlayer = player;

      this.cameras.main.centerOn(400, 300);
    }

    function update() {
      if (!player || !cursors) return;

      const speed = 180;
      player.body.setVelocity(0);
      
      if (cursors.left.isDown) player.body.setVelocityX(-speed);
      if (cursors.right.isDown) player.body.setVelocityX(speed);
      if (cursors.up.isDown) player.body.setVelocityY(-speed);
      if (cursors.down.isDown) player.body.setVelocityY(speed);

      if (currentMap === "kitchen") {
        // INTERACCIONES COCINA
        const distToTable = Phaser.Math.Distance.Between(
          player.x, player.y, 400, 300
        );
        if (distToTable < 90) {
          window.nearTable = true;
          if (Phaser.Input.Keyboard.JustDown(keyA) && !sandwichDone) {
            window.dispatchEvent(new CustomEvent("openSandwich"));
          }
        } else {
          window.nearTable = false;
        }

        const distToLibrary = Phaser.Math.Distance.Between(
          player.x, player.y, 700, 200
        );
        if (distToLibrary < 60) {
          window.nearLibraryDoor = true;
          if (Phaser.Input.Keyboard.JustDown(keyE)) {
            window.dispatchEvent(new CustomEvent("enterLibrary"));
          }
        } else {
          window.nearLibraryDoor = false;
        }

        // Control de visibilidad del signo de exclamación
        if (window.tableExclamation) {
          const shouldShow = !sandwichDone;
          window.tableExclamation.setVisible(shouldShow);
          
          if (shouldShow && window.nearTable) {
            window.tableExclamation.setScale(1 + Math.sin(this.time.now / 200) * 0.2);
          } else {
            window.tableExclamation.setScale(1);
          }
        }

        // Control de visibilidad del signo de biblioteca
        if (window.librarySign) {
          window.librarySign.setVisible(true);
        }

      } else if (currentMap === "library") {
        // INTERACCIONES BIBLIOTECA
        const distToExit = Phaser.Math.Distance.Between(
          player.x, player.y, 80, 340
        );
        if (distToExit < 60) {
          window.nearExitDoor = true;
          if (Phaser.Input.Keyboard.JustDown(keyE)) {
            window.dispatchEvent(new CustomEvent("exitLibrary"));
          }
        } else {
          window.nearExitDoor = false;
        }

        // Control de visibilidad del signo de salida
        if (window.exitSign) {
          window.exitSign.setVisible(true);
        }
      }
    }

    phaserRef.current = new Phaser.Game(config);

    // Event listeners
    const openListener = () => {
      if (!sandwichDone) {
        dispatch({ type: 'SHOW_SANDWICH_MINIGAME', payload: true });
        dispatch({ type: 'SHOW_PRESS_A_HINT', payload: false });
        dispatch({ type: 'RESET_SANDWICH' });
      }
    };
    
    const nearTableListener = (e) => {
      dispatch({ type: 'SHOW_PRESS_A_HINT', payload: e.detail.near && !sandwichDone && currentMap === "kitchen" });
    };
    
    const nearLibraryListener = (e) => {
      dispatch({ type: 'SHOW_PRESS_E_HINT', payload: e.detail.near && currentMap === "kitchen" });
    };
    
    const nearExitListener = (e) => {
      // Podemos usar esto para mostrar hints en la biblioteca si es necesario
    };
    
    const enterLibraryListener = () => {
      dispatch({ type: 'SET_CURRENT_MAP', payload: "library" });
      audioService.playSuccessSound();
    };
    
    const exitLibraryListener = () => {
      dispatch({ type: 'SET_CURRENT_MAP', payload: "kitchen" });
      audioService.playSuccessSound();
    };

    window.addEventListener("openSandwich", openListener);
    window.addEventListener("nearTableUpdate", nearTableListener);
    window.addEventListener("nearLibraryUpdate", nearLibraryListener);
    window.addEventListener("nearExitUpdate", nearExitListener);
    window.addEventListener("enterLibrary", enterLibraryListener);
    window.addEventListener("exitLibrary", exitLibraryListener);

    const cleanup = () => {
      window.removeEventListener("openSandwich", openListener);
      window.removeEventListener("nearTableUpdate", nearTableListener);
      window.removeEventListener("nearLibraryUpdate", nearLibraryListener);
      window.removeEventListener("nearExitUpdate", nearExitListener);
      window.removeEventListener("enterLibrary", enterLibraryListener);
      window.removeEventListener("exitLibrary", exitLibraryListener);
    };
    phaserRef.currentCleanup = cleanup;

    return () => {
      if (phaserRef.current) {
        if (phaserRef.currentCleanup) phaserRef.currentCleanup();
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [dispatch, sandwichDone, currentMap]);

  return null;
}