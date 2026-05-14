// AI proxy — protects the Anthropic API key on the server side
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return Response.json({
      error: 'ANTHROPIC_API_KEY non configuré. Allez dans Netlify > Site settings > Environment variables.'
    }, { status: 500 });
  }

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-5-20251001',
      max_tokens: body.max_tokens || 1024,
      system: body.system || '',
      messages: body.messages || []
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    return Response.json({ error: `API Anthropic ${res.status}: ${errText.slice(0, 500)}` }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
};

export const config = { path: '/api/chat' };
