const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

function fallbackAnswer(question: string) {
  const q = question.toLowerCase();
  if (q.includes('taxi') || q.includes('fare') || q.includes('price')) {
    return 'Compare the fare with a ride app, ask for the meter or a clear price before entering, and avoid drivers who pressure you to decide quickly.';
  }
  if (q.includes('emergency') || q.includes('sos') || q.includes('unsafe')) {
    return 'Move to a public place, contact a trusted person, and call Nepal Tourist Police at 1144. Use Yatri SOS to share your latest GPS fix.';
  }
  if (q.includes('scam') || q.includes('guide')) {
    return 'Avoid urgency pressure, unofficial counters, and guides without clear ID. Prefer official ticket desks and report suspicious details with location.';
  }
  return 'I can help with Nepal travel scams, fair prices, SOS steps, offline prep, phrases, and respectful local etiquette. Share the situation and location if you can.';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === 'string' ? body.question.slice(0, 1200) : '';
    const page = typeof body.page === 'string' ? body.page : 'unknown';
    const history = Array.isArray(body.messages) ? body.messages.slice(-8) as ChatMessage[] : [];

    if (!question.trim()) {
      return Response.json({ answer: 'Ask me a Nepal travel safety question and I will help.' }, { headers: corsHeaders });
    }

    const endpoint = Deno.env.get('YATRI_AI_ENDPOINT');
    const apiKey = Deno.env.get('YATRI_AI_API_KEY');
    const model = Deno.env.get('YATRI_AI_MODEL') ?? 'yatri-safety-assistant';

    if (!endpoint) {
      return Response.json({ answer: fallbackAnswer(question), source: 'fallback' }, { headers: corsHeaders });
    }

    const system: ChatMessage = {
      role: 'system',
      content: [
        'You are Yatri AI, a concise Nepal travel safety assistant.',
        'Help tourists avoid scams, travel safely offline, use SOS, understand fair prices, phrases, and respectful etiquette.',
        'Do not claim to be a doctor, lawyer, police officer, or embassy. For emergencies, tell users to call local authorities, Tourist Police 1144, or embassy/trusted contacts.',
        'Keep answers practical, short, and Nepal-specific. If unsure, say what to verify locally.',
        `Current app page: ${page}.`
      ].join(' ')
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model,
        messages: [system, ...history, { role: 'user', content: question }],
        temperature: 0.35,
        max_tokens: 450
      })
    });

    if (!response.ok) throw new Error(`AI endpoint failed with ${response.status}`);
    const result = await response.json();
    const answer = result?.choices?.[0]?.message?.content ?? result?.answer ?? result?.text ?? fallbackAnswer(question);

    return Response.json({ answer, source: 'model' }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ answer: fallbackAnswer(''), source: 'fallback', error: error instanceof Error ? error.message : 'Unknown error' }, { headers: corsHeaders, status: 200 });
  }
});
