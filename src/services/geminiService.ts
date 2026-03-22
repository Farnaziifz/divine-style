import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;

export const initializeChat = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Check if API key is present (in a real app, handle this gracefully)
    if (!process.env.API_KEY) {
        console.warn("No API Key found");
        return "System: API Key missing.";
    }

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are 'Divine Style Stylist', a helpful, sophisticated, and vintage-fashion-obsessed AI assistant for the 'Divine Style' online store. 
        Your tone is elegant, warm, and helpful. 
        You are bilingual and can speak English and Farsi (Persian).
        If the user speaks Farsi, please respond in Farsi.
        If the user speaks English, respond in English.
        
        You help users choose outfits based on occasions (weddings, parties, picnics).
        Recommend products from this list if applicable: 
        - Clara (Floral vintage dress)
        - Elise (Polka dot summer dress)
        - Marianne (Velvet evening gown)
        - Josephine (Linen blouse)
        
        Keep responses concise (under 50 words) unless asked for details.`,
      },
    });

    return ""; // Ready
  } catch (error) {
    console.error("Failed to init chat", error);
    return "Error initializing stylist.";
  }
};

export const sendMessageToStylist = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }
  
  if (!chatSession) return "I'm having trouble connecting right now. Please try again later.";

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "I'm speechless! Could you ask that again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I seem to be having a momentary lapse in fashion judgment. Please try again.";
  }
};