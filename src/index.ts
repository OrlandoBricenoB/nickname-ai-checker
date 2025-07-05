import { ChatCompletion } from "./types/ChatCompletion";

export interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request, env): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          'Allow': 'GET'
        }
      });
    }

    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');

    if (!nickname) {
      return new Response('Missing nickname parameter', {
        status: 400
      });
    }

    console.log('Nickname: ', nickname)

    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that evaluates nicknames. You must respond with ONLY 'yes' or 'no'. 'yes' means the nickname is acceptable, 'no' means it's inappropriate. A nickname is inappropriate if it contains ANY of the following in ANY language: hate speech, racism, terrorism, explicit sexual content, violence against specific groups, references to rape/assault, names/references from the Naruto anime/manga series, or terms implying administrative/moderator authority (like 'admin', 'mod', 'game master', 'GM', etc). You must check the meaning of the nickname in common languages like English, Spanish, French, etc, including common abbreviations, slang terms, and shortened versions of inappropriate words (like 'viola', 'violar', 'rape', etc). Pay special attention to words that could be shortened forms or slang for sexual assault terms in any language. Common gaming terms like 'sword', 'warrior', 'hunter', 'gun', 'shooter' are acceptable only in gaming contexts and when not combined with references to specific groups or explicit violence."
      },
      {
        role: "user",
        content: `Is this nickname appropriate: "${nickname}"? Check its meaning in common languages like English, Spanish, French, etc, including slang and abbreviated forms. Respond 'no' if it contains hate speech, racism, terrorism, explicit content, violence against specific groups, references to rape/assault (including shortened forms like 'viola', 'violar'), Naruto references, or implies administrative authority in ANY language.`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: messages,
        temperature: 0.7,
        max_tokens: 5
      })
    });

    const data: ChatCompletion = await response.json();
    console.log('Response: ', data);

    return new Response(JSON.stringify({
      result: data.choices[0].message.content,
      usage: {
				prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens
      }
    }));
  },
} satisfies ExportedHandler<Env>;
