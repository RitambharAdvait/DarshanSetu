import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getIncidentRecommendations, triggerModelRetraining } from '../services/recommendation.service';
import { sendEmergencyAlert } from '../services/notification.service';

const prisma = new PrismaClient();

// In-Memory Store for Lost & Found Child / Elder Reunion Desk
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

// ========================================================
// FEATURE 2: EMERGENCY "GREEN CORRIDOR" CROWD PARTITIONING
// ========================================================
interface CorridorRecord {
  id: string;
  name: string;
  zone: string;
  widthMeters: number;
  isActive: boolean;
  activatedAt?: string;
  activatedReason?: string;
  marshalsAssigned: number;
  targetHospital: string;
}

const templeCorridorsDB: Record<string, CorridorRecord[]> = {
  dwarka: [
    {
      id: 'CORRIDOR_B',
      name: 'Corridor B (West Parikrama Stretcher Lane)',
      zone: 'Sector 2 - West Outer Ring',
      widthMeters: 2.4,
      isActive: false,
      marshalsAssigned: 4,
      targetHospital: 'Dwarka Civil Hospital & Trauma Post 1'
    },
    {
      id: 'CORRIDOR_A',
      name: 'Corridor A (Main Queue Barrier Bypass)',
      zone: 'Sector 1 - North Canopy',
      widthMeters: 2.0,
      isActive: false,
      marshalsAssigned: 3,
      targetHospital: 'On-Site Medical Camp Alpha'
    },
    {
      id: 'CORRIDOR_C',
      name: 'Corridor C (Inner Sanctum Emergency Exit)',
      zone: 'Garbhagriha South Corridor',
      widthMeters: 3.0,
      isActive: false,
      marshalsAssigned: 6,
      targetHospital: 'Emergency Cardiac ICU Mobile Unit'
    }
  ],
  somnath: [
    {
      id: 'CORRIDOR_B',
      name: 'Corridor B (Sea-facing Stretcher Pathway)',
      zone: 'Somnath South Perimeter',
      widthMeters: 2.8,
      isActive: false,
      marshalsAssigned: 4,
      targetHospital: 'Somnath Trust Hospital'
    }
  ],
  ambaji: [
    {
      id: 'CORRIDOR_B',
      name: 'Corridor B (Gabbar Foothill Evacuation Lane)',
      zone: 'North Ramp Area',
      widthMeters: 2.5,
      isActive: false,
      marshalsAssigned: 4,
      targetHospital: 'Ambaji Cottage Hospital'
    }
  ],
  pavagadh: [
    {
      id: 'CORRIDOR_B',
      name: 'Corridor B (Ropeway Base Stretcher Lane)',
      zone: 'Manchi Plateau',
      widthMeters: 2.2,
      isActive: false,
      marshalsAssigned: 4,
      targetHospital: 'Halol Referral Hospital'
    }
  ]
};

// ========================================================
// FEATURE 3: 4-TIER TEMPLE ALERT THREAT DIAL (DEFCON STYLE)
// ========================================================
interface ThreatLevelState {
  siteId: string;
  level: 'LEVEL_1_GREEN' | 'LEVEL_2_YELLOW' | 'LEVEL_3_ORANGE' | 'LEVEL_4_RED';
  title: string;
  description: string;
  gateSpeedRate: number; // Percentage modifier (100%, 80%, 50%, 0%)
  marshalsMobilized: number;
  lastUpdated: string;
  updatedBy: string;
}

const threatLevelsDB: Record<string, ThreatLevelState> = {
  dwarka: {
    siteId: 'dwarka',
    level: 'LEVEL_1_GREEN',
    title: 'LEVEL 1: NORMAL FLOW',
    description: 'Standard crowd throughput. All turnstiles operating at 100% capacity.',
    gateSpeedRate: 100,
    marshalsMobilized: 12,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Control Room Officer'
  },
  somnath: {
    siteId: 'somnath',
    level: 'LEVEL_1_GREEN',
    title: 'LEVEL 1: NORMAL FLOW',
    description: 'Standard crowd throughput. All turnstiles operating at 100% capacity.',
    gateSpeedRate: 100,
    marshalsMobilized: 12,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Control Room Officer'
  },
  ambaji: {
    siteId: 'ambaji',
    level: 'LEVEL_1_GREEN',
    title: 'LEVEL 1: NORMAL FLOW',
    description: 'Standard crowd throughput. All turnstiles operating at 100% capacity.',
    gateSpeedRate: 100,
    marshalsMobilized: 12,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Control Room Officer'
  },
  pavagadh: {
    siteId: 'pavagadh',
    level: 'LEVEL_1_GREEN',
    title: 'LEVEL 1: NORMAL FLOW',
    description: 'Standard crowd throughput. All turnstiles operating at 100% capacity.',
    gateSpeedRate: 100,
    marshalsMobilized: 12,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Control Room Officer'
  }
};

const THREAT_LEVEL_METADATA = {
  LEVEL_1_GREEN: {
    title: 'LEVEL 1: NORMAL FLOW (GREEN)',
    description: 'Standard throughput (50 devotees/min). All queue holding corridors open.',
    gateSpeedRate: 100,
    marshalsMobilized: 12
  },
  LEVEL_2_YELLOW: {
    title: 'LEVEL 2: ELEVATED CAUTION (YELLOW)',
    description: 'Queue density > 3.5 p/m². On-duty marshals deployed to key bottlenecks.',
    gateSpeedRate: 80,
    marshalsMobilized: 18
  },
  LEVEL_3_ORANGE: {
    title: 'LEVEL 3: SURGE RISK (ORANGE)',
    description: 'Entry gates throttled by 50% (25 devotees/min). Queue splitters and holding bays active.',
    gateSpeedRate: 50,
    marshalsMobilized: 28
  },
  LEVEL_4_RED: {
    title: 'LEVEL 4: FULL LOCKDOWN / CRUSH EMERGENCY (RED)',
    description: 'Entry gates locked on HOLD. Emergency Escape Corridors opened. District Collector & NDRF alerted.',
    gateSpeedRate: 0,
    marshalsMobilized: 45
  }
};

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
        type,
        severity: severity || 'WARNING',
        description,
        lat,
        lng
      }
    });

    (req as any).io?.emit('new_incident', incident);

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

    const recommendations = await getIncidentRecommendations({
      lat: incident.lat || 12.9716,
      lng: incident.lng || 77.5946,
      type: incident.type,
      severity: incident.severity,
    });

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

    const feedbackCount = await prisma.incident.count({
      where: { actualDuration: { not: null } }
    });

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
  (req as any).io?.emit('lost_person_alert', newRecord);

  res.status(201).json({
    success: true,
    message: `🚨 MISSING PERSON ALERT BROADCASTED: Gate security monitors locked for ${name}`,
    record: newRecord
  });
};

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

// ========================================================
// FEATURE 2: EMERGENCY "GREEN CORRIDOR" CROWD PARTITIONING
// ========================================================

export const toggleGreenCorridor = async (req: Request, res: Response) => {
  const { siteId, corridorId, reason } = req.body;

  const cleanSiteId = (siteId || 'dwarka').toLowerCase();
  const siteCorridors = templeCorridorsDB[cleanSiteId] || templeCorridorsDB.dwarka;
  const targetCorridor = siteCorridors.find(c => c.id === corridorId) || siteCorridors[0];

  targetCorridor.isActive = !targetCorridor.isActive;
  targetCorridor.activatedAt = targetCorridor.isActive ? new Date().toISOString() : undefined;
  targetCorridor.activatedReason = targetCorridor.isActive ? (reason || 'Medical Stretcher Rapid Evacuation') : undefined;

  (req as any).io?.emit('green_corridor_status', {
    siteId: cleanSiteId,
    corridor: targetCorridor
  });

  res.json({
    success: true,
    isActive: targetCorridor.isActive,
    message: targetCorridor.isActive
      ? `🟢 EMERGENCY GREEN CORRIDOR ACTIVATED: ${targetCorridor.name} cleared for Paramedics & Stretcher Team!`
      : `⚪ Green Corridor deactivated. ${targetCorridor.name} restored to standard queue flow.`,
    corridor: targetCorridor
  });
};

export const getGreenCorridorStatus = async (req: Request, res: Response) => {
  const cleanSiteId = (req.params.siteId || 'dwarka').toLowerCase();
  const corridors = templeCorridorsDB[cleanSiteId] || templeCorridorsDB.dwarka;

  res.json({
    siteId: cleanSiteId,
    anyActive: corridors.some(c => c.isActive),
    corridors
  });
};

// ========================================================
// FEATURE 3: 4-TIER TEMPLE ALERT THREAT DIAL (DEFCON STYLE)
// ========================================================

// POST /api/incidents/threat-level
export const setThreatLevel = async (req: Request, res: Response) => {
  const { siteId, level, updatedBy, reason } = req.body;

  if (!level || !THREAT_LEVEL_METADATA[level as keyof typeof THREAT_LEVEL_METADATA]) {
    return res.status(400).json({ error: 'Valid threat level required (LEVEL_1_GREEN, LEVEL_2_YELLOW, LEVEL_3_ORANGE, LEVEL_4_RED)' });
  }

  const cleanSiteId = (siteId || 'dwarka').toLowerCase();
  const meta = THREAT_LEVEL_METADATA[level as keyof typeof THREAT_LEVEL_METADATA];

  const updatedState: ThreatLevelState = {
    siteId: cleanSiteId,
    level,
    title: meta.title,
    description: meta.description,
    gateSpeedRate: meta.gateSpeedRate,
    marshalsMobilized: meta.marshalsMobilized,
    lastUpdated: new Date().toISOString(),
    updatedBy: updatedBy || 'Magisterial Control Room'
  };

  threatLevelsDB[cleanSiteId] = updatedState;

  // Broadcast threat level shift to all connected clients & gate barriers
  (req as any).io?.emit('threat_level_change', updatedState);

  res.json({
    success: true,
    message: `🚨 THREAT LEVEL UPDATED TO ${meta.title}`,
    state: updatedState
  });
};

// GET /api/incidents/threat-level/:siteId
export const getThreatLevel = async (req: Request, res: Response) => {
  const cleanSiteId = (req.params.siteId || 'dwarka').toLowerCase();
  const state = threatLevelsDB[cleanSiteId] || threatLevelsDB.dwarka;
  res.json({ state });
};