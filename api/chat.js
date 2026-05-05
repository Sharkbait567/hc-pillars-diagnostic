export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query, system } = req.body;
  if (!query) return res.status(400).json({ error: 'query is required' });
  const HC_SYSTEM = system || `You are the Horizon Coalition framework intelligence system. The HC is a secular think tank and institutional incubator — not a coup, not activism, not a revolutionary movement. It is a readiness plan for the post-US-empire transition. The Four Pillars (Builders, Farmers, Healers, Warriors) are the load-bearing functions of civilization. Answer questions about the framework precisely and substantively. Be direct and specific. No filler.`;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: HC_SYSTEM,
        messages: [{ role: 'user', content: query }]
      })
    });
    if (!response.ok) { const err = await response.text(); return res.status(response.status).json({ error: err }); }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
