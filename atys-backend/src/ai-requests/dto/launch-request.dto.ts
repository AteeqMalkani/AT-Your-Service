import { z } from 'zod';
import { RequestDraftSchema } from '../schemas/request-draft.schema.js';

export const LaunchRequestDtoSchema = z.object({
  draft: RequestDraftSchema,
});

export type LaunchRequestDto = z.infer<typeof LaunchRequestDtoSchema>;
