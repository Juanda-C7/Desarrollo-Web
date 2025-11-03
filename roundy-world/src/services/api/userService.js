const MONGODB_API = "http://localhost:4001";

export const userService = {
  async login(username, password) {
    try {
      const res = await fetch(`${MONGODB_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        return { 
          success: true, 
          user: data.user 
        };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      return { success: false, error: "Error de conexión con el servidor" };
    }
  },

  async register(username, password) {
    try {
      const res = await fetch(`${MONGODB_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        return { 
          success: true, 
          user: data.user 
        };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("❌ Error en registro:", err);
      return { success: false, error: "Error de conexión con el servidor" };
    }
  },

  async saveUserData(userData) {
    const token = localStorage.getItem('token');
    if (!token) return { success: false };

    try {
      await fetch(`${MONGODB_API}/user`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Error guardando datos:", error);
      return { success: false };
    }
  },

  async syncAchievements(trofeos) {
    const token = localStorage.getItem('token');
    if (!token) return { success: false };

    try {
      await fetch(`${MONGODB_API}/sync-achievements`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ trofeos }),
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Error sincronizando logros:", error);
      return { success: false };
    }
  },

  // Método para cargar datos desde localStorage (ahora manejado por el contexto)
  loadUserDataFromStorage() {
    const color = localStorage.getItem('userColor');
    const money = localStorage.getItem('userMoney');
    const sandwichDone = localStorage.getItem('userSandwichDone');
    const educationalPoints = localStorage.getItem('userEducationalPoints');
    const trofeosStr = localStorage.getItem('userTrofeos');
    
    return {
      color: color ? parseInt(color) : null,
      money: money ? parseInt(money) : 0,
      sandwichDone: sandwichDone === 'true',
      educationalPoints: educationalPoints ? parseInt(educationalPoints) : 0,
      trofeos: trofeosStr ? JSON.parse(trofeosStr) : { bronce: 0, plata: 0, oro: 0, total: 0 }
    };
  }
};