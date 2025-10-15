# Desarrollo-Web

## API Roundy World - Logros y Misiones

API REST para gestionar el sistema de **logros y misiones** del juego **Roundy World**.

---

## 📋 Características

- ✅ Gestión completa de logros (**CRUD**)
- ✅ Sistema de misiones con progreso
- ✅ Estado del jugador en tiempo real
- ✅ Base de datos en memoria
- ✅ CORS habilitado

---

 

## 📊 Endpoints Principales

### 🏆 Logros

- `GET /logros/:jugadorId` → Obtener todos los logros de un jugador  
- `GET /logros/:jugadorId/:logroId` → Obtener un logro específico  
- `POST /logros/:jugadorId` → Crear un nuevo logro  
- `PATCH /logros/:jugadorId/:logroId/completar` → Completar un logro  
- `DELETE /logros/:jugadorId/:logroId` → Eliminar un logro  

### 🎯 Misiones

- `GET /misiones` → Obtener todas las misiones  
- `GET /misiones/:id` → Obtener una misión específica  
- `PATCH /misiones/:jugadorId/:misionId/progreso` → Actualizar el progreso de una misión  

### 📈 Especiales

- `GET /estado/:jugadorId` → Obtener el estado completo del jugador  
- `POST /inicializar-jugador` → Inicializar datos de un jugador

![alt text](image-1.png)