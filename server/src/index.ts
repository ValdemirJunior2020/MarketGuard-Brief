import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import deviceRoutes from './routes/deviceRoutes.js';
import followTargetRoutes from './routes/followTargetRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { scheduleDailyBriefJob } from './jobs/dailyBriefJob.js';
import { env, isFirebaseConfigured } from './utils/env.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'MarketGuard Brief',
    time: new Date().toISOString(),
    database: 'Firebase Firestore',
    firebaseConfigured: isFirebaseConfigured()
  });
});

app.use('/api/device', deviceRoutes);
app.use('/api/follow-targets', followTargetRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  res.status(400).json({ error: message });
});

app.listen(env.port, '0.0.0.0', () => {
  console.log(`MarketGuard Brief server listening on 0.0.0.0:${env.port}`);
  console.log(`Database: Firebase Firestore (${env.firebase.projectId || 'not configured'})`);

  if (isFirebaseConfigured()) {
    scheduleDailyBriefJob();
    console.log('Daily brief scheduler started.');
  } else {
    console.log('Firebase is not configured yet. Scheduler skipped.');
  }
});
