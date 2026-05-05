const NOTION_VERSION = '2022-06-28';
const PILLAR_PAGE_IDS = {
  builders: '357cb1ba6eb08188a36bf5b187eeb6ac',
  farmers: '357cb1ba6eb081928848fda70198f416',
  healers: '357cb1ba6eb0815aabffe6bb9797c543',
  warriors: '357cb1ba6eb081658f6fc4f5987ad942',
  command_center: '357cb1ba6eb081d19ff1f90b63caece4',
  policy_hub: '356cb1ba6eb081628b64c95e939f5011'
};
async function notionFetch(path) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  return res.json();
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.NOTION_API_KEY) {
    return res.status(200).json({ status: 'ok', message: 'Notion integration not configured', configured: false });
  }
  try {
    const pages = await Promise.allSettled(
      Object.entries(PILLAR_PAGE_IDS).map(async ([name, id]) => {
        const page = await notionFetch(`/pages/${id}`);
        return { name, id, title: page.properties?.title?.title?.[0]?.plain_text || name };
      })
    );
    res.status(200).json({ pillars: pages.map((p,i) => ({ name: Object.keys(PILLAR_PAGE_IDS)[i], status: p.status, data: p.status === 'fulfilled' ? p.value : { error: p.reason?.message } })), configured: true });
  } catch (error) {
    res.status(500).json({ error: error.message, configured: false });
  }
                }
