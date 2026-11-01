import { z } from 'zod';

export const PrepareRequestDtoSchema = z.object({
  message: z.string(),
  language: z.string().optional().default('en'),
  interactionMode: z.enum(['text', 'voice']).optional().default('text'),
});

export type PrepareRequestDto = z.infer<typeof PrepareRequestDtoSchema>;
