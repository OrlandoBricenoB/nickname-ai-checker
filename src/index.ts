export interface Env {
  AI: Ai;
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

    // Prompt 1: Naruto references
    const narutoMessages = [
      {
        role: "system",
        content: "Check if the nickname is exactly the name of a character from the Naruto anime/manga series (not a reference, but an exact match to a character's name, in any language or spelling). Reply only 'yes' or 'no'."
      },
      {
        role: "user",
        content: `Is the nickname "${nickname}" exactly the name of a Naruto character?`
      }
    ];

    // Prompt 2: Hate, racism, terrorism, gay, violence, sexual references, etc.
    const violenceMessages = [
      {
        role: "system",
        content: `You are reviewing a nickname for a video game. Reject any nickname that contains or implies hate, racism, terrorism, the word "gay" (in any context), violence, or any sexual reference, in any language or with any creative spelling or word combinations.
However, be careful NOT to reject nicknames that are valid names for video game or fantasy characters, such as "warrior", "demon_slayer", "assassin", "hunter", "gun", "shooter", etc., even if they imply combat or fantasy.
If the nickname contains or implies hate, racism, terrorism, the word "gay", realistic violence, or any sexual reference (explicit or implicit), reply 'yes'. If it is a valid name for a fantasy or action video game character, reply 'no'. Reply only 'yes' or 'no'.`
      },
      {
        role: "user",
        content: `Does the nickname "${nickname}" contain or imply hate, racism, terrorism, the word "gay", realistic violence, or any sexual reference (explicit or implicit)?`
      }
    ];

    // Prompt 3: Admin/moderator authority
    const adminMessages = [
      {
        role: "system",
        content: "Check if the nickname suggests admin or moderator authority (any language). Reply only 'yes' or 'no'."
      },
      {
        role: "user",
        content: `Does the nickname "${nickname}" suggest admin or moderator authority?`
      }
    ];

    // Run all three checks in parallel
    const [narutoResp, violenceResp, adminResp] = await Promise.all([
      env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: narutoMessages, temperature: 1.0 }),
      env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: violenceMessages, temperature: 1.0 }),
      env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: adminMessages, temperature: 1.0 }),
    ]);

    // If any check returns 'yes', the nickname is inappropriate
    const results = [
      narutoResp.response,
      violenceResp.response,
      adminResp.response
    ].map(r => (typeof r === "string" ? r.trim().toLowerCase() : ""));

    const isAppropriate = results.every(r => r === "no");

    function extractTokens(resp: any) {
      return resp.tokens ?? resp.usage ?? resp.token_usage ?? null;
    }

    let details: any = {
      naruto: results[0],
      naruto_tokens: extractTokens(narutoResp),
      violence: results[1],
      violence_tokens: extractTokens(violenceResp),
      admin: results[2],
      admin_tokens: extractTokens(adminResp)
    };

    const responseBody: any = {
      result: isAppropriate ? "yes" : "no"
    };

    if (debug) {
      responseBody.details = details;
    }

    return new Response(JSON.stringify(responseBody), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
} satisfies ExportedHandler<Env>;
