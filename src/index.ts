export interface Env {
  AI: Ai;
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

		console.log(nickname)

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that evaluates nicknames. You must respond with ONLY 'yes' or 'no'. 'yes' means the nickname is acceptable, 'no' means it's inappropriate. A nickname is inappropriate ONLY if it contains: hate speech, racism, terrorism, explicit sexual content, or names/references from the Naruto anime/manga series. Common gaming terms like 'sword', 'warrior', 'hunter', etc are acceptable even if combined with violence-related words, as long as they don't promote extreme violence or gore."
        },
        {
          role: "user",
          content: `Is this nickname appropriate: "${nickname}"? Remember that gaming-style nicknames (like Dragon-Slayer, Dark-Knight, etc) are acceptable. Only respond 'no' if it contains hate speech, racism, terrorism, explicit content, or Naruto references.`
        }
      ]
    });

		console.log(response)

    return new Response(JSON.stringify(response));
  },
} satisfies ExportedHandler<Env>;
