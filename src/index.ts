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
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that evaluates nicknames. You must respond with ONLY 'yes' or 'no'. 'yes' means the nickname is acceptable, 'no' means it's inappropriate. A nickname is inappropriate ONLY if it contains: hate speech, racism, terrorism, explicit sexual content, names/references from the Naruto anime/manga series, or terms implying administrative/moderator authority (like 'admin', 'mod', 'game master', 'GM', etc). Common gaming terms like 'sword', 'warrior', 'hunter', 'gun', 'shooter', etc are acceptable even if combined with violence-related words, as long as they don't promote extreme violence or gore. Be consistent in your responses - the same nickname should always get the same response."
      },
      {
        role: "user",
        content: `Is this nickname appropriate: "${nickname}"? Remember that gaming-style nicknames (like Dragon-Slayer, Dark-Knight, etc) are acceptable. Only respond 'no' if it contains hate speech, racism, terrorism, explicit content, Naruto references, or implies administrative/moderator authority. Be consistent - this nickname should always get the same response.`
      }
    ];
    const response = await env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", { messages });

		console.log(response)

    return new Response(JSON.stringify(response));
  },
} satisfies ExportedHandler<Env>;
