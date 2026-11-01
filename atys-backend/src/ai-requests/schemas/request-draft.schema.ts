import { z } from 'zod';

export const RequestFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string().nullable(),
  required: z.boolean(),
  status: z.enum(['complete', 'missing']),
});

export type RequestField = z.infer<typeof RequestFieldSchema>;

export const RequestDraftSchema = z.object({
  requestId: z.string(),
  title: z.string(),
  category: z.string(),
  fields: z.array(RequestFieldSchema),
});

export type RequestDraft = z.infer<typeof RequestDraftSchema>;

export const AIResponseSchema = z.object({
  title: z.string(),
  category: z.string(),
  fields: z.array(RequestFieldSchema),
  nextQuestion: z.string().nullable(),
  status: z.enum(['needs_clarification', 'ready_for_review']),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;
