import { Router } from 'express';
import { z } from 'zod';
import { getPreference, upsertDevice, upsertPreference } from '../services/firebaseDb.js';

const router = Router();

const preferenceSchema = z.object({
  deviceId: z.string().min(6),
  selectedTargetIds: z.array(z.string()).default([]),
  customKeywords: z.array(z.string()).default([]),
  alertTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().default('UTC'),
  urgentAlerts: z.boolean().default(false),
  quietHoursStart: z.string().nullable().optional(),
  quietHoursEnd: z.string().nullable().optional(),
  alertTone: z.string().default('default'),
  pauseAllAlerts: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(false)
});

router.post('/', async (req, res) => {
  const payload = preferenceSchema.parse(req.body);

  await upsertDevice({ deviceId: payload.deviceId, timezone: payload.timezone });
  const preference = await upsertPreference(payload);

  return res.json({ preference });
});

router.get('/:deviceId', async (req, res) => {
  const preference = await getPreference(req.params.deviceId);
  return res.json({ preference });
});

export default router;
