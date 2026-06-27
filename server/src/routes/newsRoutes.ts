import { Router } from 'express';
import { getNewsItem, getPreference, getRecentNewsItems } from '../services/firebaseDb.js';

const router = Router();

router.get('/today', async (req, res) => {
  const deviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId : undefined;
  const preference = deviceId ? await getPreference(deviceId) : null;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const terms = [
    ...(preference?.customKeywords || []),
    ...(preference?.selectedTargetIds || [])
  ].map((term) => term.toLowerCase());

  const items = await getRecentNewsItems({ sinceMs: startOfDay.getTime(), take: 30 });

  const filtered = terms.length
    ? items.filter((item) => {
        const haystack = `${item.title} ${item.snippet} ${item.possibleAffectedAreas.join(' ')}`.toLowerCase();
        return terms.some((term) => haystack.includes(term.replace(/-/g, ' ')) || haystack.includes(term));
      })
    : items;

  const fallbackItems = filtered.length > 0 ? filtered : items;

  return res.json({
    items: fallbackItems.slice(0, 10),
    lastUpdated: new Date().toISOString()
  });
});

router.get('/:id', async (req, res) => {
  const item = await getNewsItem(req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'News item not found.' });
  }

  return res.json({ item });
});

export default router;
