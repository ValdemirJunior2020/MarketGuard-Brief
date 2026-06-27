import cron from 'node-cron';
import { DateTime } from 'luxon';
import { createAlertLog, getNotificationPreferences, getRecentNewsItems } from '../services/firebaseDb.js';
import { sendPushNotifications } from '../services/notificationService.js';

type SendOptions = {
  force?: boolean;
  referenceDate?: Date;
};

export async function sendDueDailyBriefs(options: SendOptions = {}) {
  const referenceDate = options.referenceDate || new Date();
  const preferences = await getNotificationPreferences();

  let evaluated = 0;
  let sent = 0;

  for (const preference of preferences) {
    evaluated += 1;
    if (!preference.device?.pushToken) continue;

    const localNow = DateTime.fromJSDate(referenceDate).setZone(preference.timezone || 'UTC');
    const localTime = localNow.toFormat('HH:mm');

    if (!options.force && localTime !== preference.alertTime) continue;

    const localStart = localNow.startOf('day').toUTC().toMillis();
    const items = await getRecentNewsItems({ sinceMs: localStart, take: 3 });

    if (items.length === 0) continue;

    const title = 'MarketGuard Brief: Morning update';
    const body = `${items.length} public statements may affect market sentiment today. Open to review sources.`;

    try {
      await sendPushNotifications([
        {
          to: preference.device.pushToken,
          title,
          body,
          sound: preference.alertTone === 'silent' ? undefined : 'default',
          data: {
            type: 'daily-brief',
            itemIds: items.map((item) => item.id)
          }
        }
      ]);

      for (const item of items) {
        await createAlertLog({
          deviceId: preference.deviceId,
          newsItemId: item.id,
          type: 'daily',
          title,
          body,
          status: 'sent'
        });
      }

      sent += 1;
    } catch (error) {
      await createAlertLog({
        deviceId: preference.deviceId,
        type: 'daily',
        title,
        body,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown notification error'
      });
    }
  }

  return { evaluated, sent };
}

export function scheduleDailyBriefJob() {
  cron.schedule('* * * * *', () => {
    sendDueDailyBriefs().catch((error) => console.error('Daily brief job failed', error));
  });
}
