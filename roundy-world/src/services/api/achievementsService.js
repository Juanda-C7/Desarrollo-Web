const ACHIEVEMENTS_API = "http://localhost:2001";

export const achievementsService = {
  async loadAchievementsData(username) {
    try {
      const response = await fetch(`${ACHIEVEMENTS_API}/estado/${username}`);
      const estado = await response.json();
      return estado;
    } catch (error) {
      console.error("Error cargando logros y misiones:", error);
      return null;
    }
  },

  async inicializarJugador(username) {
    try {
      await fetch(`${ACHIEVEMENTS_API}/inicializar-jugador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugadorId: username }),
      });
      return true;
    } catch (error) {
      console.error("Error inicializando jugador:", error);
      return false;
    }
  },

  async updateMisionProgreso(username, misionId, incremento) {
    try {
      const response = await fetch(`${ACHIEVEMENTS_API}/misiones/${username}/${misionId}/progreso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremento }),
      });
      
      const resultado = await response.json();
      return resultado;
    } catch (error) {
      console.error("Error actualizando misión:", error);
      return null;
    }
  },

  async completarLogro(username, logroId) {
    try {
      const response = await fetch(`${ACHIEVEMENTS_API}/logros/${username}/${logroId}/completar`, {
        method: 'PATCH',
      });
      
      const resultado = await response.json();
      return resultado;
    } catch (error) {
      console.error("Error completando logro:", error);
      return null;
    }
  }
};