export interface AiProvider {
  generateStructuredResponse(prompt: string): Promise<any>;
}
