import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';
import { AiProvider } from './ai-provider.interface.js';

@Injectable()
export class GroqProvider implements AiProvider {
  private client: any;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.client = new Groq({ apiKey });
    }
  }

  async generateStructuredResponse(prompt: string): Promise<any> {
    if (!this.client) {
      throw new InternalServerErrorException('Groq API Key is missing');
    }

    try {
      const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
      const response = await this.client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 512, // Reduce requested tokens to fit within OTPM limit
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new InternalServerErrorException(`Groq Provider Error: ${(error as any).message}`);
    }
  }
}
