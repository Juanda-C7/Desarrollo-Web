// Servicio para Hugging Face API
const HF_TOKEN = 'Api de Huggin (se elimino por seguridad)';

class HuggingService {
  async analyzeCode(code, challengeDescription, exampleCode) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-hf',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Como tutor de programación, analiza este código JavaScript y proporciona feedback educativo. Sé constructivo y claro. Responde en español.

DESAFÍO: ${challengeDescription}

CÓDIGO DEL ESTUDIANTE:
${code}

EJEMPLO DE SOLUCIÓN:
${exampleCode}

ANÁLISIS EDUCATIVO:`
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data[0] && data[0].generated_text) {
        const generatedText = data[0].generated_text;
        
        // Extraer solo la parte del análisis educativo
        const feedbackText = generatedText.split('ANÁLISIS EDUCATIVO:')[1]?.trim() || 
                           generatedText.split('Feedback:')[1]?.trim() ||
                           generatedText;
        
        return {
          success: true,
          feedback: feedbackText,
          rawResponse: data
        };
      } else {
        throw new Error('No se pudo generar feedback desde la API');
      }
      
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      return {
        success: false,
        error: error.message,
        feedback: this.getFallbackFeedback(code, challengeDescription)
      };
    }
  }

  getFallbackFeedback(code, challengeDescription) {
    // Análisis básico local como fallback
    if (code.includes('function') && code.includes('return')) {
      return "✅ ¡Buen trabajo! Tu código muestra una estructura básica correcta. Sigue practicando para mejorar la implementación.";
    } else if (code.length < 10) {
      return "❌ El código es muy corto. Asegúrate de implementar completamente la solución al desafío.";
    } else {
      return "🤔 Tu código necesita mejoras. Revisa la sintaxis y asegúrate de resolver el problema planteado. ¡Sigue intentándolo!";
    }
  }

  // Método para evaluar si el código es correcto
  evaluateCodeCorrectness(code, challengeType) {
    const cleanCode = code.toLowerCase().replace(/\s/g, '');
    
    const evaluators = {
      'suma': (code) => code.includes('function') && code.includes('return') && (code.includes('a+b') || code.includes('a+b')),
      'bucle': (code) => code.includes('for(') && code.includes('console.log'),
      'condicional': (code) => code.includes('function') && code.includes('if(') && code.includes('%2'),
      'array': (code) => code.includes('.map(') && code.includes('=>')
    };

    const evaluator = evaluators[challengeType] || (() => code.length > 15);
    return evaluator(cleanCode);
  }
}

export const huggingService = new HuggingService();