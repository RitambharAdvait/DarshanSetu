import { Router } from 'express';
import { 
  raiseSOS, 
  getRecommendation, 
  submitFeedback,
  reportLostPerson,
  getLostPersons,
  markPersonReunited,
  toggleGreenCorridor,
  getGreenCorridorStatus
} from '../controllers/incident.controller';

const router = Router();

router.post('/sos', raiseSOS);
router.post('/:id/recommend', getRecommendation);
router.put('/:id/feedback', submitFeedback);

// Feature 1: Lost Child & Elder Reunion Desk Routes
router.post('/lost-person', reportLostPerson);
router.get('/lost-persons/:siteId', getLostPersons);
router.post('/lost-person/reunite/:id', markPersonReunited);

// Feature 2: Emergency Green Corridor Stretcher Lane Routes
router.post('/green-corridor/toggle', toggleGreenCorridor);
router.get('/green-corridor/status/:siteId', getGreenCorridorStatus);

export default router;