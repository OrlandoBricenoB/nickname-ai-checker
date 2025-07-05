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
          content: "You are a helpful assistant that evaluates nicknames. You must respond with ONLY 'yes' or 'no'. 'yes' means the nickname is acceptable, 'no' means it's inappropriate."
        },
        {
          role: "user",
          content: `Is this nickname appropriate: "${nickname}"? Consider it inappropriate if it contains hate speech, racism, terrorism, extreme violence, explicit content, or names from characters in the Naruto series.`
        }
      ]
    });

		console.log(response)

    return new Response(JSON.stringify(response));
  },
} satisfies ExportedHandler<Env>;
