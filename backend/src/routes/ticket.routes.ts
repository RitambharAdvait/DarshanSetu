import { Router } from 'express';
import { 
  bookTicket, 
  getMyTickets, 
  verifyGeofence, 
  getQueueStatus, 
  scanGateEntry,
  preFetchFootwear,
  getLockerStatus
} from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/book', authenticate, bookTicket);
router.get('/my', authenticate, getMyTickets);

// Real-Life Pivot Endpoints
router.post('/verify-geofence', verifyGeofence);
router.get('/queue-status/:siteId', getQueueStatus);
router.post('/scan', scanGateEntry);

// Smart Footwear & Locker QR Tagging Endpoints
router.post('/lockers/pre-fetch', preFetchFootwear);
router.get('/lockers/status/:qrToken', getLockerStatus);

export default router;
