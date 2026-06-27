import { Router } from 'express';
import { z } from 'zod';
import { upsertDevice, upsertPreference, deleteDeviceAndPreferences } from '../services/firebaseDb.js';

const router = Router();

const registerDeviceSchema = z.object({
  deviceId: z.string().min(6),
  email: z.string().email().nullable().optional(),
  pushToken: z.string().nullable().optional(),
  platform: z.string().optional(),
  timezone: z.string().default('UTC'),
  alertTime: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
  notificationsEnabled: z.boolean().default(false)
});

router.post('/register', async (req, res) => {
  const payload = registerDeviceSchema.parse(req.body);
  const device = await upsertDevice({
    deviceId: payload.deviceId,
    pushToken: payload.pushToken || null,
    email: payload.email || null,
    platform: payload.platform,
    timezone: payload.timezone
  });

  const preference = await upsertPreference({
    deviceId: payload.deviceId,
    alertTime: payload.alertTime,
    timezone: payload.timezone,
    notificationsEnabled: payload.notificationsEnabled
  });

  return res.json({ device, preference });
});

router.delete('/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  await deleteDeviceAndPreferences(deviceId);
  return res.json({ ok: true });
});

export default router;
