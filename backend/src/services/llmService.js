const { GoogleGenAI } = require('@google/genai');

class LLMService {
    /**
     * Calls Google AI Studio (Gemini) to generate a response.
     * @param {string} systemPrompt The constructed RAG context and instructions.
     * @param {string} userMessage The user's query.
     * @param {string} language The target language (e.g., 'hi', 'en').
     * @returns {Promise<string>} The AI's response text.
     */
    static async generateResponse(systemPrompt, userMessage, language) {

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("No GEMINI_API_KEY provided. Returning mocked response.");
            return `[Mock Response in ${language}]: I am a VyapaarAI assistant. I received your message: "${userMessage}".\n\nContext provided:\n${systemPrompt.substring(0, 200)}...`;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });

            const prompt = `System Instructions: ${systemPrompt}\n\nUser Query: Please answer the following in ${language}:\n${userMessage}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.7
                }
            });

            return response.text;
        } catch (error) {
            console.error("LLM Generation Error:", error.message);
            throw new Error("Failed to generate AI response from Google AI Studio.");
        }
    }
}

module.exports = LLMService;
