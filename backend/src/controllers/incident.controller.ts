import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    res.status(201).json({
      message: 'SOS incident raised successfully',
      incident
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log SOS incident' });
  }
};