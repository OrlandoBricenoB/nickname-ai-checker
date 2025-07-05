export interface TokenDetails {
  cached_tokens: number;
  audio_tokens: number;
}

export interface CompletionTokenDetails {
  reasoning_tokens: number;
  audio_tokens: number;
  accepted_prediction_tokens: number;
  rejected_prediction_tokens: number;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: TokenDetails;
  completion_tokens_details: CompletionTokenDetails;
}

export interface Message {
  annotations: any[];
  role: string;
  content: string;
}

export interface Choice {
  message: Message;
  finish_reason: string;
  index: number;
}

export interface ChatCompletion {
  usage: Usage;
  created: number;
  system_fingerprint: string;
  service_tier: string;
  model: string;
  object: string;
  id: string;
  choices: Choice[];
}
