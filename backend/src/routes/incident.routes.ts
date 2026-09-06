import { Router } from 'express';
import { 
  raiseSOS, 
  getRecommendation, 
  submitFeedback,
  reportLostPerson,
  getLostPersons,
  markPersonReunited,
  toggleGreenCorridor,
  getGreenCorridorStatus,
  setThreatLevel,
  getThreatLevel,
  dispatchIntercomAgency,
  getIntercomDirectory,
  generateMagisterialReport
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

// Feature 3: 4-Tier Temple Alert Threat Dial Routes
router.post('/threat-level', setThreatLevel);
router.get('/threat-level/:siteId', getThreatLevel);

// Feature 4: 1-Click Multi-Agency Rapid Intercom Routes
router.post('/intercom/dispatch', dispatchIntercomAgency);
router.get('/intercom/directory/:siteId', getIntercomDirectory);

// Feature 8: Magisterial Incident Audit & Legal Report Generator Route
router.post('/magisterial-report', generateMagisterialReport);

export default router;