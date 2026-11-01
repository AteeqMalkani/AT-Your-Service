import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AiProvider } from './ai-provider.interface.js';

@Injectable()
export class GeminiProvider implements AiProvider {
  private client: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  async generateStructuredResponse(prompt: string): Promise<any> {
    if (!this.client) {
      throw new InternalServerErrorException('Gemini API Key is missing');
    }

    try {
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const response = await this.client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: 'application/json'
        }
      });
      
      return JSON.parse(response.text());
    } catch (error) {
      throw new InternalServerErrorException(`Gemini Provider Error: ${(error as any).message}`);
    }
  }
}
