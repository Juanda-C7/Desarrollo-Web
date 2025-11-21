# Desarrollo-Web



---

##  Sobre Roundy World

**Roundy World** es un juego online con un enfoque educativo.  
El objetivo del proyecto es hacer más interesante el aprendizaje de temas complejos mediante dinámicas divertidas y gamificadas.

Además, se busca fomentar la sociabilidad entre los usuarios, creando un espacio **seguro**, **interactivo** y **amistoso**, donde puedan convivir con otros jugadores interesados tanto en jugar como en aprender.

---

##  Pasos para jugar

1. Ingresa a la página de **Roundy World**
2. Crea tu cuenta
3. Rellena los datos solicitados
4. ¡Estás listo para empezar a jugar! 

---

##  Objetivos del proyecto

- Crear un espacio online seguro y divertido para niños y adolescentes  
- Brindar herramientas que desarrollen la creatividad  
- Fomentar la educación gamificada, incentivando desde temprana edad la curiosidad por temas profesionales y más complejos  

---

##  Elementos del juego

### 1. Personajes
- Personita personalizable (**Tú**)
- Otros usuarios

### 2. Ubicaciones
- Tu casa personalizable  
- Lugares de trabajo (minijuegos)  
- Biblioteca (aprendizaje por juegos)  
- Tiendas (coleccionables, mascotas, etc.)  
- ¡Y más!

### 3. Educación
- Minijuegos de preguntas  
- Potencial de distintas carreras (ingeniería, medicina, economía, etc.)  
- Gamificación para mayor diversión  
- Distintos temas y cursos  

---

## API Roundy World - Logros y Misiones

API REST para gestionar el sistema de **logros y misiones** del juego **Roundy World**.

##  Características de la API

- ✅ Gestión completa de logros (**CRUD**)
- ✅ Sistema de misiones con progreso
- ✅ Estado del jugador en tiempo real
- ✅ Base de datos en memoria
- ✅ CORS habilitado

---

##  Endpoints Principales

###  Logros

- `GET /logros/:jugadorId` → Obtener todos los logros de un jugador  
- `GET /logros/:jugadorId/:logroId` → Obtener un logro específico  
- `POST /logros/:jugadorId` → Crear un nuevo logro  
- `PATCH /logros/:jugadorId/:logroId/completar` → Completar un logro  
- `DELETE /logros/:jugadorId/:logroId` → Eliminar un logro  

---

###  Misiones

- `GET /misiones` → Obtener todas las misiones  
- `GET /misiones/:id` → Obtener una misión específica  
- `PATCH /misiones/:jugadorId/:misionId/progreso` → Actualizar el progreso de una misión  

---

###  Especiales

- `GET /estado/:jugadorId` → Obtener el estado completo del jugador  
- `POST /inicializar-jugador` → Inicializar datos de un jugador  

---

![alt text](image-1.png)
