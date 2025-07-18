
// Lambda AI Response Types
export interface LambdaAiMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

export interface LambdaAiContentFilterResults {
  hate: { filtered: boolean };
  self_harm: { filtered: boolean };
  sexual: { filtered: boolean };
  violence: { filtered: boolean };
  jailbreak: { filtered: boolean; detected: boolean };
  profanity: { filtered: boolean; detected: boolean };
}

export interface LambdaAiChoice {
  index: number;
  message: LambdaAiMessage;
  finish_reason: string;
  content_filter_results: LambdaAiContentFilterResults;
}

export interface LambdaAiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: any;
  completion_tokens_details: any;
}

export interface LambdaAiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: LambdaAiChoice[];
  usage: LambdaAiUsage;
  system_fingerprint: string;
}