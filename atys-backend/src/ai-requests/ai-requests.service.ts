import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { SYSTEM_PROMPT } from './prompts/system.prompt.js';
import { AIResponse, AIResponseSchema, RequestDraft, RequestField } from './schemas/request-draft.schema.js';
import { PrepareRequestDto } from './dto/prepare-request.dto.js';
import { ContinueRequestDto } from './dto/continue-request.dto.js';
import { v4 as uuidv4 } from 'uuid';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import { AiProvider } from './providers/ai-provider.interface.js';

@Injectable()
export class AiRequestsService {
  private readonly logger = new Logger(AiRequestsService.name);
  private provider: AiProvider;

  // In-memory store for current demonstration
  private requestsStore = new Map<string, RequestDraft>();

  constructor() {
    const providerType = process.env.AI_PROVIDER || 'groq';
    this.logger.log(`Initializing AI service with provider: ${providerType}`);

    if (providerType === 'gemini') {
      this.provider = new GeminiProvider();
    } else if (providerType === 'groq') {
      this.provider = new GroqProvider();
    } else {
      this.logger.error(`Unsupported AI provider: ${providerType}`);
      throw new Error(`Unsupported AI provider: ${providerType}`);
    }
  }

  async prepareRequest(dto: PrepareRequestDto): Promise<{ requestId: string, status: string, draft: RequestDraft, nextQuestion: string | null }> {
    const prompt = `
      System: ${SYSTEM_PROMPT}
      Current Date: ${new Date().toISOString()}
      User Request: "${dto.message}"
      Language: ${dto.language}
    `;

    const aiResponse = await this.callAi(prompt);
    
    const requestId = uuidv4();
    const draft: RequestDraft = {
      requestId,
      title: aiResponse.title,
      category: aiResponse.category,
      fields: aiResponse.fields,
    };

    this.requestsStore.set(requestId, draft);

    return {
      requestId,
      status: aiResponse.status,
      draft,
      nextQuestion: aiResponse.nextQuestion,
    };
  }

  async continueRequest(dto: ContinueRequestDto): Promise<{ status: string, draft: RequestDraft, nextQuestion: string | null }> {
    const prompt = `
      System: ${SYSTEM_PROMPT}
      Current Date: ${new Date().toISOString()}
      Existing Draft: ${JSON.stringify(dto.draft)}
      User Answer: "${dto.message}"
      
      Instructions: Update the draft based on the user's answer. Preserve existing information unless the user is correcting it. Determine if the request is now complete.
    `;

    const aiResponse = await this.callAi(prompt);

    const updatedDraft: RequestDraft = {
      ...dto.draft,
      title: aiResponse.title,
      category: aiResponse.category,
      fields: aiResponse.fields,
    };

    this.requestsStore.set(updatedDraft.requestId, updatedDraft);

    return {
      status: aiResponse.status,
      draft: updatedDraft,
      nextQuestion: aiResponse.nextQuestion,
    };
  }

  async launchRequest(dto: any): Promise<{ status: string, message: string }> {
    if (!dto.draft || !dto.draft.fields) {
      throw new BadRequestException('Invalid request draft provided');
    }

    const missingRequired = dto.draft.fields.filter((f: any) => f.required && f.status === 'missing');
    
    if (missingRequired.length > 0) {
      throw new BadRequestException(`Request is incomplete. Missing fields: ${missingRequired.map((f: any) => f.label).join(', ')}`);
    }

    this.requestsStore.delete(dto.draft.requestId);

    return {
      status: 'launched',
      message: 'Request successfully launched. Finding providers...',
    };
  }

  private async callAi(prompt: string): Promise<AIResponse> {
    try {
      const rawResponse = await this.provider.generateStructuredResponse(prompt);
      const validated = AIResponseSchema.parse(rawResponse);
      return validated;
    } catch (error) {
      this.logger.error('AI provider error or validation failed', error);
      throw new InternalServerErrorException(`AI request processing failed: ${(error as any).message}`);
    }
  }
}
