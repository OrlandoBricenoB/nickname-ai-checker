// Google AI Response Types
export interface GoogleAiPart {
  text: string;
}

export interface GoogleAiContent {
  role: "user" | "model";
  parts: GoogleAiPart[];
}

export interface GoogleAiCandidate {
  content: GoogleAiContent;
  finishReason: string;
  index: number;
  safetyRatings?: any[];
}

export interface GoogleAiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface GoogleAiResponse {
  candidates: GoogleAiCandidate[];
  usageMetadata?: GoogleAiUsageMetadata;
  modelVersion?: string;
}

