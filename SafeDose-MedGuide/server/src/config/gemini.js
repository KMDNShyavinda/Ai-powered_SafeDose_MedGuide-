const { GoogleGenerativeAI } = require('@google/generative-ai');

let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('WARNING: GEMINI_API_KEY not set. AI Chat feature will be disabled.');
    return null;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    systemInstruction: `You are SafeDose MedGuide AI Assistant, a helpful and knowledgeable medical information chatbot.\n\nIMPORTANT RULES:\n1. You provide GENERAL medical information only. You are NOT a doctor or pharmacist.\n2. ALWAYS recommend users consult a healthcare professional for personal medical advice.\n3. NEVER diagnose conditions or prescribe medications.\n4. Provide accurate information about drug dosages, side effects, interactions, and safety based on general medical knowledge.\n5. If a question is outside your medical knowledge scope, say so clearly.\n6. Always include relevant safety warnings and disclaimers.\n7. Be empathetic, clear, and use simple language patients can understand.\n8. When discussing dosages, always mention that individual dosages may vary and should be confirmed by a doctor.\n9. For emergency situations, advise users to call emergency services immediately.\n10. Format your responses clearly with bullet points and sections when appropriate.`,
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  });
  console.log('Google Gemini AI initialized successfully');
  return model;
};

const getModel = () => model;

module.exports = { initGemini, getModel };
