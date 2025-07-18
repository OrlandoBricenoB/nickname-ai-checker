import { LambdaAiResponse } from "./types/LambdaAiResponse";

const API_BASE = "https://api.lambda.ai/v1";
const MODEL = "llama3.1-8b-instruct";

export async function promptLambdaAi(messages: any[], apiKey: string): Promise<LambdaAiResponse> {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1,
      temperature: 1.0
    })
  });
  if (!res.ok) {
    throw new Error(`Lambda AI error: ${res.status} ${await res.text()}`);
  }
  const data: LambdaAiResponse = await res.json();
  return data;
}
