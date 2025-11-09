import { GoogleAiResponse } from "./types/GoogleAiResponse";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-2.5-flash-lite";

export async function promptGoogleAi(messages: any[], apiKey: string): Promise<GoogleAiResponse> {
  // Convert messages format from OpenAI-style to Google AI format
  const contents: any[] = [];
  let systemInstruction = "";

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = msg.content;
    } else if (msg.role === "user") {
      contents.push({
        role: "user",
        parts: [{ text: msg.content }]
      });
    } else if (msg.role === "assistant") {
      contents.push({
        role: "model",
        parts: [{ text: msg.content }]
      });
    }
  }

  const requestBody: any = {
    contents: contents
  };

  // Add system instruction if present
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  // Add generation config for short responses
  requestBody.generationConfig = {
    maxOutputTokens: 10,
    temperature: 1.0
  };

  const url = `${API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google AI error: ${res.status} ${errorText}`);
  }

  const data: GoogleAiResponse = await res.json();
  return data;
}

