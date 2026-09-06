import { Router } from 'express';
import { 
  raiseSOS, 
  getRecommendation, 
  submitFeedback,
  reportLostPerson,
  getLostPersons,
  markPersonReunited
} from '../controllers/incident.controller';

const router = Router();

router.post('/sos', raiseSOS);
router.post('/:id/recommend', getRecommendation);
router.put('/:id/feedback', submitFeedback);

// Feature 1: Lost Child & Elder Reunion Desk Routes
router.post('/lost-person', reportLostPerson);
router.get('/lost-persons/:siteId', getLostPersons);
router.post('/lost-person/reunite/:id', markPersonReunited);

export default router;