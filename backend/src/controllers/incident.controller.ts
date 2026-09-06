import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getIncidentRecommendations, triggerModelRetraining } from '../services/recommendation.service';
import { sendEmergencyAlert } from '../services/notification.service';

const prisma = new PrismaClient();

// In-Memory Store for Lost & Found Child / Elder Reunion Desk (with seed demo records)
interface LostPersonRecord {
  id: string;
  siteId: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  clothingDescription: string;
  language: string;
  lastSeenLocation: string;
  contactPhone: string;
  guardianName: string;
  status: 'ACTIVE_SEARCH' | 'REUNITED';
  reportedAt: string;
  reunitedAt?: string;
  notes?: string;
}

let lostPersonsDB: LostPersonRecord[] = [
  {
    id: 'LP-101',
    siteId: 'dwarka',
    name: 'Aarav Sharma',
    age: 6,
    gender: 'MALE',
    clothingDescription: 'Yellow Kurta, Blue Jeans, Brown Sandals',
    language: 'Hindi / Gujarati',
    lastSeenLocation: 'Main Queue Corridor — Pillar #14',
    contactPhone: '+91 98765 43210',
    guardianName: 'Sunita Sharma (Mother)',
    status: 'ACTIVE_SEARCH',
    reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    notes: 'Perimeter Exit Gates 1, 2, 3, 4 notified on alert'
  },
  {
    id: 'LP-102',
    siteId: 'dwarka',
    name: 'Kashiben Patel',
    age: 74,
    gender: 'FEMALE',
    clothingDescription: 'Green Bandhani Saree, Silver Glasses',
    language: 'Gujarati only',
    lastSeenLocation: 'Footwear & Locker Stand B',
    contactPhone: '+91 98222 11334',
    guardianName: 'Pravin Patel (Son)',
    status: 'ACTIVE_SEARCH',
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    notes: 'Mild hearing impairment; staff dispatched to Annakshetra hall'
  },
  {
    id: 'LP-100',
    siteId: 'dwarka',
    name: 'Rohan Mehra',
    age: 8,
    gender: 'MALE',
    clothingDescription: 'Red T-shirt with cartoon print',
    language: 'Hindi / English',
    lastSeenLocation: 'Prasad Counter Hall',
    contactPhone: '+91 98111 22334',
    guardianName: 'Vikas Mehra (Father)',
    status: 'REUNITED',
    reportedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    reunitedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    notes: 'Reunited safely at East Help Desk Counter 1'
  }
];

// POST /api/incidents/sos
export const raiseSOS = async (req: Request, res: Response) => {
  const { siteId, zoneId, type, severity, description, lat, lng } = req.body;

  if (!siteId || !type || !description) {
    return res.status(400).json({ error: 'siteId, type, and description are required' });
  }

  try {
    const incident = await prisma.incident.create({
      data: {
        siteId,
        zoneId,
        type, // STAMPEDE_PRECURSOR, MEDICAL_FALL, SOS_MANUAL
        severity: severity || 'WARNING',
        description,
        lat,
        lng
      }
    });

    // Broadcast new incident to all active dashboards
    (req as any).io?.emit('new_incident', incident);

    // If incident is CRITICAL, dispatch emergency SMS alerts to guards
    if (incident.severity === 'CRITICAL') {
      sendEmergencyAlert(incident);
    }

    res.status(201).json({
      message: 'SOS incident raised successfully',
      incident
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log SOS incident' });
  }
};

// POST /api/incidents/:id/recommend
export const getRecommendation = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Call Python recommender
    const recommendations = await getIncidentRecommendations({
      lat: incident.lat || 12.9716,
      lng: incident.lng || 77.5946,
      type: incident.type,
      severity: incident.severity,
    });

    // Update database row
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        suggestedDuration: recommendations.predicted_duration,
        suggestedMarshals: recommendations.recommended_marshals,
        suggestedBarricades: recommendations.recommended_barricading,
        suggestedDiversion: recommendations.recommended_diversion,
      },
    });

    res.json({
      message: 'Recommendations generated successfully',
      recommendations,
      incident: updatedIncident,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
};

// PUT /api/incidents/:id/feedback
export const submitFeedback = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { actualDuration, actualMarshals, actualBarricades, actualDiversion } = req.body;

  try {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Determine if operator overrode suggested values
    const overridden = 
      (actualMarshals !== undefined && actualMarshals !== incident.suggestedMarshals) ||
      (actualBarricades !== undefined && actualBarricades !== incident.suggestedBarricades) ||
      (actualDiversion !== undefined && actualDiversion !== incident.suggestedDiversion);

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        actualDuration: parseFloat(actualDuration),
        operatorOverrides: overridden,
      },
    });

    // Check count of resolved incidents with feedback
    const feedbackCount = await prisma.incident.count({
      where: { actualDuration: { not: null } }
    });

    // Trigger retraining loop in background if count is a multiple of 5
    if (feedbackCount > 0 && feedbackCount % 5 === 0) {
      console.log(`🔄 Triggering automated ML retraining (Feedback count: ${feedbackCount})...`);

      (req as any).io?.emit('ml_retraining_status', { status: 'running', count: feedbackCount });
      
      const feedbackList = await prisma.incident.findMany({
        where: { actualDuration: { not: null } }
      });

      triggerModelRetraining(feedbackList)
        .then((output) => {
          console.log('✅ ML Retraining successful:\n', output);
          (req as any).io?.emit('ml_retraining_status', { status: 'success', output });
        })
        .catch((err) => {
          console.error('❌ ML Retraining failed:', err.message);
          (req as any).io?.emit('ml_retraining_status', { status: 'failed', error: err.message });
        });
    }

    res.json({
      message: 'Feedback submitted successfully',
      incident: updatedIncident,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit operator feedback' });
  }
};

// ==========================================
// FEATURE 1: LOST CHILD & ELDER REUNION DESK
// ==========================================

// POST /api/incidents/lost-person
export const reportLostPerson = async (req: Request, res: Response) => {
  const { 
    siteId, 
    name, 
    age, 
    gender, 
    clothingDescription, 
    language, 
    lastSeenLocation, 
    contactPhone, 
    guardianName,
    notes 
  } = req.body;

  if (!siteId || !name || !clothingDescription || !lastSeenLocation) {
    return res.status(400).json({ error: 'siteId, name, clothingDescription, and lastSeenLocation are required' });
  }

  const newRecord: LostPersonRecord = {
    id: `LP-${Math.floor(100 + Math.random() * 900)}`,
    siteId: siteId.toLowerCase(),
    name,
    age: parseInt(age) || 8,
    gender: gender || 'MALE',
    clothingDescription,
    language: language || 'Hindi / Gujarati',
    lastSeenLocation,
    contactPhone: contactPhone || 'Not Provided',
    guardianName: guardianName || 'Guardian',
    status: 'ACTIVE_SEARCH',
    reportedAt: new Date().toISOString(),
    notes: notes || 'Perimeter Gate Exit monitors notified.'
  };

  lostPersonsDB.unshift(newRecord);

  // Broadcast real-time alert to all connected Gate Monitors & Dashboard
  (req as any).io?.emit('lost_person_alert', newRecord);

  res.status(201).json({
    success: true,
    message: `🚨 MISSING PERSON ALERT BROADCASTED: Gate security monitors locked for ${name}`,
    record: newRecord
  });
};

// GET /api/incidents/lost-persons/:siteId
export const getLostPersons = async (req: Request, res: Response) => {
  const siteId = (req.params.siteId || 'dwarka').toLowerCase();
  const records = lostPersonsDB.filter(p => p.siteId === siteId || siteId === 'all');
  res.json({
    siteId,
    totalActiveSearch: records.filter(p => p.status === 'ACTIVE_SEARCH').length,
    totalReunited: records.filter(p => p.status === 'REUNITED').length,
    records
  });
};

// POST /api/incidents/lost-person/reunite/:id
export const markPersonReunited = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;

  const record = lostPersonsDB.find(p => p.id === id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }

  record.status = 'REUNITED';
  record.reunitedAt = new Date().toISOString();
  if (resolutionNotes) {
    record.notes = resolutionNotes;
  }

  (req as any).io?.emit('lost_person_reunited', record);

  res.json({
    success: true,
    message: `🟢 REUNION CONFIRMED: ${record.name} has been safely reunited!`,
    record
  });
};