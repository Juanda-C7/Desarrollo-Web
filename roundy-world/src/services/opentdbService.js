// Servicio para Open Trivia DB API
class OpenTDBService {
  async getQuestions(category = 18, difficulty = 'easy', amount = 5) {
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`
      );

      if (!response.ok) {
        throw new Error(`OpenTrivia API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response_code === 0) {
        return {
          success: true,
          questions: data.results,
          count: data.results.length
        };
      } else {
        throw new Error(`OpenTrivia API error code: ${data.response_code}`);
      }
    } catch (error) {
      console.error('Error fetching questions from OpenTrivia:', error);
      return {
        success: false,
        error: error.message,
        questions: this.getFallbackQuestions()
      };
    }
  }

  getFallbackQuestions() {
    return [
      {
        question: "¿Qué significa HTML?",
        correct_answer: "HyperText Markup Language",
        incorrect_answers: [
          "HighTech Modern Language",
          "HyperTransfer Markup Language", 
          "Home Tool Markup Language"
        ],
        category: "Science: Computers",
        difficulty: "easy",
        type: "multiple"
      },
      {
        question: "¿Qué lenguaje se usa principalmente para estilizar páginas web?",
        correct_answer: "CSS",
        incorrect_answers: ["HTML", "JavaScript", "Python"],
        category: "Science: Computers",
        difficulty: "easy",
        type: "multiple"
      },
      {
        question: "¿Qué es una variable en programación?",
        correct_answer: "Un contenedor para almacenar datos",
        incorrect_answers: [
          "Un tipo de función",
          "Un error en el código",
          "Un lenguaje de programación"
        ],
        category: "Science: Computers",
        difficulty: "easy",
        type: "multiple"
      },
      {
        question: "¿Qué estructura de control repite un bloque de código?",
        correct_answer: "Bucle",
        incorrect_answers: [
          "Condicional",
          "Variable",
          "Función"
        ],
        category: "Science: Computers",
        difficulty: "easy",
        type: "multiple"
      },
      {
        question: "¿Qué método de array crea un nuevo array transformando cada elemento?",
        correct_answer: "map()",
        incorrect_answers: [
          "filter()",
          "forEach()",
          "reduce()"
        ],
        category: "Science: Computers",
        difficulty: "easy",
        type: "multiple"
      }
    ];
  }

  // Método para mezclar respuestas
  shuffleAnswers(question) {
    const allAnswers = [...question.incorrect_answers, question.correct_answer];
    return allAnswers.sort(() => Math.random() - 0.5);
  }

  // Obtener categorías disponibles
  async getCategories() {
    try {
      const response = await fetch('https://opentdb.com/api_category.php');
      const data = await response.json();
      return data.trivia_categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
}

export const openTDBService = new OpenTDBService();