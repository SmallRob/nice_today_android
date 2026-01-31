
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG, AIModelConfig } from "./config";

export class AIService {
    private static instance: AIService;
    private currentModelId: string = AI_CONFIG.DEFAULT_MODEL_ID;

    private constructor() {
        const savedModelId = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedAIModelId') : null;
        if (savedModelId) {
            this.currentModelId = savedModelId;
        }
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    public getCurrentModel(): AIModelConfig {
        const modelId = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedAIModelId') : this.currentModelId;
        const allModels = this.getAvailableModels();
        return allModels.find(m => m.id === (modelId || this.currentModelId)) || allModels[0];
    }

    public getCustomModels(): AIModelConfig[] {
        if (typeof localStorage === 'undefined') return [];
        const saved = localStorage.getItem('customAIModels');
        return saved ? JSON.parse(saved) : [];
    }

    public saveCustomModel(model: AIModelConfig) {
        const models = this.getCustomModels();
        const index = models.findIndex(m => m.id === model.id);
        if (index > -1) {
            models[index] = model;
        } else {
            models.push(model);
        }
        localStorage.setItem('customAIModels', JSON.stringify(models));
    }

    public removeCustomModel(id: string) {
        const models = this.getCustomModels();
        const filtered = models.filter(m => m.id !== id);
        localStorage.setItem('customAIModels', JSON.stringify(filtered));
        
        // 如果删除的是当前选中的模型，切换回默认模型
        if (this.currentModelId === id) {
            this.setCurrentModel(AI_CONFIG.DEFAULT_MODEL_ID);
        }
    }

    public getAvailableModels(): AIModelConfig[] {
        return [...AI_CONFIG.MODELS, ...this.getCustomModels()];
    }

    public setCurrentModel(id: string) {
        this.currentModelId = id;
        localStorage.setItem('selectedAIModelId', id);
    }

    public async generateContent(prompt: string): Promise<string> {
        const model = this.getCurrentModel();
        
        if (model.MODEL_NAME) {
            // Gemini model
            try {
                const genAI = new GoogleGenAI({ apiKey: model.API_KEY } as any);
                const result: any = await (genAI as any).models.generateContent({
                    model: model.MODEL_NAME,
                    contents: prompt
                });
                const text = typeof result?.text === 'string'
                    ? result.text
                    : typeof result?.text === 'function'
                        ? result.text()
                        : typeof result?.response?.text === 'function'
                            ? result.response.text()
                            : '';
                return String(text || '');
            } catch (error) {
                console.error("Gemini Error:", error);
                throw error;
            }
        } else if (model.ServiceEndPoint) {
            // OpenAI compatible model (like Qwen)
            try {
                const response = await fetch(model.ServiceEndPoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${model.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model.deploymentName,
                        messages: [{ role: 'user', content: prompt }],
                        stream: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`AI Request failed with status ${response.status}`);
                }

                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error("AI Service Error:", error);
                throw error;
            }
        }
        
        throw new Error("Invalid model configuration");
    }

    public async generateContentStream(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
        const model = this.getCurrentModel();
        let fullText = "";

        if (model.MODEL_NAME) {
            // Gemini model streaming
            try {
                const genAI = new GoogleGenAI({ apiKey: model.API_KEY } as any);
                const generativeModel = (genAI as any).getGenerativeModel({ model: model.MODEL_NAME });
                const result = await generativeModel.generateContentStream(prompt);

                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    fullText += chunkText;
                    onChunk(chunkText);
                }
                return fullText;
            } catch (error) {
                console.error("Gemini Stream Error:", error);
                throw error;
            }
        } else if (model.ServiceEndPoint) {
            // OpenAI compatible model streaming
            try {
                const response = await fetch(model.ServiceEndPoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${model.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model.deploymentName,
                        messages: [{ role: 'user', content: prompt }],
                        stream: true
                    })
                });

                if (!response.ok) {
                    throw new Error(`AI Stream Request failed with status ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("Response body is not readable");

                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') break;
                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices[0]?.delta?.content || "";
                                if (content) {
                                    fullText += content;
                                    onChunk(content);
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk:", e);
                            }
                        }
                    }
                }
                return fullText;
            } catch (error) {
                console.error("AI Service Stream Error:", error);
                throw error;
            }
        }

        throw new Error("Invalid model configuration");
    }

    public async testModel(model: AIModelConfig): Promise<boolean> {
        try {
            if (model.MODEL_NAME) {
                const genAI = new GoogleGenAI({ apiKey: model.API_KEY } as any);
                const result: any = await (genAI as any).models.generateContent({
                    model: model.MODEL_NAME,
                    contents: "test"
                });
                const text = typeof result?.text === 'string'
                    ? result.text
                    : typeof result?.text === 'function'
                        ? result.text()
                        : typeof result?.response?.text === 'function'
                            ? result.response.text()
                            : '';
                return Boolean(text);
            } else if (model.ServiceEndPoint) {
                const response = await fetch(model.ServiceEndPoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${model.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model.deploymentName,
                        messages: [{ role: 'user', content: "hi" }],
                        max_tokens: 5
                    })
                });
                return response.ok;
            }
        } catch (error) {
            console.error("Test Model Error:", error);
            return false;
        }
        return false;
    }
}

export const aiService = AIService.getInstance();
