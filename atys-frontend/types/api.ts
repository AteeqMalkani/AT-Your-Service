export interface RequestField {
  id: string;
  label: string;
  value: string | null;
  required: boolean;
  status: 'complete' | 'missing';
}

export interface RequestDraft {
  requestId: string;
  title: string;
  category: string;
  fields: RequestField[];
}

export interface PrepareRequestResponse {
  requestId: string;
  status: string;
  draft: RequestDraft;
  nextQuestion: string | null;
}

export interface PrepareRequestDto {
  message: string;
  language: string;
  interactionMode: 'text' | 'voice';
}

export interface ContinueRequestDto {
  requestId: string;
  draft: RequestDraft;
  message: string;
}

export interface ContinueRequestResponse {
  status: string;
  draft: RequestDraft;
  nextQuestion: string | null;
}

export interface LaunchRequestDto {
  draft: RequestDraft;
}

export interface LaunchRequestResponse {
  status: string;
  message: string;
}
