import { promptLambdaAi } from './promptLambdaAi';

export interface Env {
  AI: Ai;
  LAMBDA_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Allow': 'GET',
          'Content-Type': 'application/json'
        }
      });
    }

    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');
    const debug = url.searchParams.has('debug');

    if (!nickname) {
      return new Response(JSON.stringify({
        error: 'Missing nickname parameter'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // * Prompt 1: Naruto exact match
    const narutoMessages = [
      {
        role: "system",
        content: `Check if the nickname is exactly the name of a character from the Naruto anime/manga series (not a reference, but an exact match to a character's name, in any language or spelling). Reply only "yes" or "no".`
      },
      {
        role: "user",
        content: `Is the nickname "${nickname}" exactly the name of a Naruto character?`
      }
    ];

    // * Prompt 2: Hate, racism, terrorism, gay, violence, sexual references, etc.
    const violenceMessages = [
      {
        role: "system",
        content: `You are reviewing a nickname for a video game. Reject any nickname that contains or implies hate, racism, terrorism, the word "gay" (in any context), violence, or any sexual reference, in any language or with any creative spelling or word combinations.
However, be careful NOT to reject nicknames that are valid names for video game or fantasy characters, such as "warrior", "demon_slayer", "assassin", "hunter", "gun", "shooter", etc., even if they imply combat or fantasy.
If the nickname contains or implies hate, racism, terrorism, the word "gay", realistic violence, or any sexual reference (explicit or implicit), reply "yes". If it is a valid name for a fantasy or action video game character, reply "no". Reply only "yes" or "no".`
      },
      {
        role: "user",
        content: `Does the nickname "${nickname}" contain or imply hate, racism, terrorism, the word "gay", realistic violence, or any sexual reference (explicit or implicit)?`
      }
    ];

    // * Prompt 3: Admin/moderator authority
    const adminMessages = [
      {
        role: "system",
        content: `Check if the nickname suggests admin or moderator authority (any language). Reply only "yes" or "no".`
      },
      {
        role: "user",
        content: `Does the nickname "${nickname}" suggest admin or moderator authority?`
      }
    ];

    const [narutoResp, violenceResp, adminResp] = await Promise.all([
      promptLambdaAi(narutoMessages, env.LAMBDA_API_KEY),
      promptLambdaAi(violenceMessages, env.LAMBDA_API_KEY),
      promptLambdaAi(adminMessages, env.LAMBDA_API_KEY)
    ]);

    const results = [
      narutoResp.choices?.[0]?.message?.content,
      violenceResp.choices?.[0]?.message?.content,
      adminResp.choices?.[0]?.message?.content
    ].map(r => (typeof r === "string" ? r.trim().toLowerCase() : ""));

    const isAppropriate = results.every(r => r === "no");

    const responseBody: any = {
      result: isAppropriate ? "yes" : "no"
    };

    if (debug) {
      let details: any = {
        naruto: results[0],
        naruto_tokens: narutoResp?.usage ?? null,
        violence: results[1],
        violence_tokens: violenceResp?.usage ?? null,
        admin: results[2],
        admin_tokens: adminResp?.usage ?? null
      };
      responseBody.details = details;
    }

    return new Response(JSON.stringify(responseBody), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
} satisfies ExportedHandler<Env>;
