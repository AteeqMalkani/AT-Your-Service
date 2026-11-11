import { RequestDraft } from '../types/api';

export const RequestNavigation = {
  /**
   * Safely serialize a RequestDraft for navigation params.
   */
  serializeDraft: (draft: RequestDraft): string => {
    try {
      return JSON.stringify(draft);
    } catch (e) {
      console.error('Failed to serialize RequestDraft:', e);
      throw new Error('Unable to serialize request data for navigation.');
    }
  },

  /**
   * Safely parse a RequestDraft from navigation params.
   * Returns null if parsing fails or data is missing.
   */
  parseDraft: (draftString: string | null): RequestDraft | null => {
    if (!draftString) return null;
    try {
      return JSON.parse(draftString) as RequestDraft;
    } catch (e) {
      console.error('Failed to parse RequestDraft from params:', e);
      return null;
    }
  },

  /**
   * Validates that essential navigation parameters are present.
   */
  validateParams: (params: { requestId?: string; initialDraft?: string | null }): boolean => {
    return !!(params.requestId && params.initialDraft);
  },
};
