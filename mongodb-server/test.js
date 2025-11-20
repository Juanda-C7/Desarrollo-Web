// test-gemini-final.js - Prueba con modelo CORRECTO
import fetch from 'node-fetch';

async function testGemini() {
  console.log("🧪 Probando modelos de Gemini...");
  
  // Probar diferentes modelos
  const modelos = [
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001', 
    'gemini-1.0-pro-001',
    'gemini-1.5-flash-8b'
  ];

  for (const modelo of modelos) {
    try {
      console.log(`\n🔍 Probando modelo: ${modelo}`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=AIzaSyAMmvDicSlwe1YwRHUSZxDSu6Go0s2vQtg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Responde solo con un número del 1 al 5:"
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 10,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const respuesta = data.candidates[0].content.parts[0].text;
        console.log(`✅ ${modelo} FUNCIONA! Respuesta: ${respuesta}`);
      } else {
        const errorData = await response.json();
        console.log(`❌ ${modelo} falló: ${errorData.error?.message}`);
      }
      
    } catch (error) {
      console.log(`❌ ${modelo} error: ${error.message}`);
    }
  }
}

testGemini();