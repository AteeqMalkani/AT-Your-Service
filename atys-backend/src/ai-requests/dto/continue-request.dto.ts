import { z } from 'zod';
import { RequestDraftSchema } from '../schemas/request-draft.schema.js';

export const ContinueRequestDtoSchema = z.object({
  requestId: z.string(),
  draft: RequestDraftSchema,
  message: z.string(),
});

export type ContinueRequestDto = z.infer<typeof ContinueRequestDtoSchema>;
