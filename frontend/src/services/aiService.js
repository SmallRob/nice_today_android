import { AI_CONFIG } from './globalUserConfig';

/**
 * AI Service for handling LLM interactions
 * Supports multiple providers (Aliyun Qwen, etc.)
 */
class AIService {
  constructor() {
    this.defaultModelId = AI_CONFIG.DEFAULT_MODEL_ID;
  }

  /**
   * Get the current AI configuration
   */
  getConfig() {
    // In a real app, this might merge with user settings from localStorage
    const savedModelId = localStorage.getItem('selectedAIModelId');
    const modelId = savedModelId || this.defaultModelId;
    const modelConfig = AI_CONFIG.MODELS.find(m => m.id === modelId) || AI_CONFIG.MODELS[0];
    
    return modelConfig;
  }

  /**
   * Generate completion from AI
   * @param {string} prompt The system prompt or user query
   * @param {Object} context User context data
   * @returns {Promise<string>} The AI response
   */
  async generateCompletion(prompt, context = {}) {
    const config = this.getConfig();
    
    // Construct the full prompt with context
    const contextStr = JSON.stringify(context, null, 2);
    const fullPrompt = `
Context Information:
${contextStr}

Task:
${prompt}
`;

    try {
      const response = await fetch(config.ServiceEndPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.API_KEY}`
        },
        body: JSON.stringify({
          model: config.deploymentName || config.id, // Some APIs use deploymentName
          messages: [
            { role: 'system', content: 'You are a helpful assistant for the "Nice Today" app.' },
            { role: 'user', content: fullPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different API response formats (standard OpenAI format)
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from AI provider');
      }
    } catch (error) {
      console.error('AI Service Call Failed:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
