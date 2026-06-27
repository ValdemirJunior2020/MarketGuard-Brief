import { Router } from 'express';
import { requireAdminSecret } from '../middleware/adminAuth.js';
import { sendDueDailyBriefs } from '../jobs/dailyBriefJob.js';
import { ingestConfiguredNewsFeeds } from '../services/newsIngestionService.js';

const router = Router();

router.use(requireAdminSecret);

router.post('/ingest-news', async (_req, res) => {
  const result = await ingestConfiguredNewsFeeds();
  return res.json(result);
});

router.post('/send-daily-briefs', async (_req, res) => {
  const result = await sendDueDailyBriefs({ force: true });
  return res.json(result);
});

export default router;
