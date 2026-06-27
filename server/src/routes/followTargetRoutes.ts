import { Router } from 'express';
import { getFollowTargets } from '../services/firebaseDb.js';
import { defaultFollowTargets } from '../utils/defaultFollowTargets.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const targets = await getFollowTargets();
    return res.json({ targets });
  } catch (error) {
    console.error('Firebase follow target load failed. Returning local defaults.', error);
    return res.json({ targets: defaultFollowTargets });
  }
});

export default router;
