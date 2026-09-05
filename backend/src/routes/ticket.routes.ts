import { Router } from 'express';
import { 
  bookTicket, 
  getMyTickets, 
  verifyGeofence, 
  getQueueStatus, 
  scanGateEntry 
} from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/book', authenticate, bookTicket);
router.get('/my', authenticate, getMyTickets);

// Real-Life Pivot Endpoints
router.post('/verify-geofence', verifyGeofence);
router.get('/queue-status/:siteId', getQueueStatus);
router.post('/scan', scanGateEntry);

export default router;
