import { Router } from 'express';
import { raiseSOS } from '../controllers/incident.controller';

const router = Router();

router.post('/sos', raiseSOS);

export default router;