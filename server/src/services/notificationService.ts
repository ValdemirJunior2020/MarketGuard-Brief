import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { env } from '../utils/env.js';

const expo = new Expo(env.expoAccessToken ? { accessToken: env.expoAccessToken } : undefined);

export async function sendPushNotifications(messages: ExpoPushMessage[]) {
  const validMessages = messages.filter((message) => Expo.isExpoPushToken(message.to));
  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return tickets;
}
