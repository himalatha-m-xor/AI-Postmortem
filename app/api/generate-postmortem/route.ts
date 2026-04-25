import { NextRequest, NextResponse } from 'next/server';
import { generatePostmortem } from '@/lib/ai/generator';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';
import { logger } from '@/lib/logger';
import { NotFoundError, ValidationError, formatErrorResponse, AIGenerationError } from '@/lib/errors';
import { rateLimiter, getClientIdentifier } from '@/lib/rate-limit';
import { config } from '@/lib/config';

// Store generated postmortems in memory (in production, use a database)
const generatedPostmortems = new Map();

export async function POST(request: NextRequest) {
  try {
    logger.info('📝 Postmortem generation requested');

    // Rate limiting (only if feature is enabled)
    if (config.features.rateLimiting) {
      const clientId = getClientIdentifier(request);
      rateLimiter.checkLimit(clientId);
      logger.debug(`Rate limit check passed for: ${clientId}`);
    }

    const { incidentId } = await request.json();

    if (!incidentId) {
      logger.warn('Missing incident ID in request');
      throw new ValidationError('Incident ID is required');
    }

    // Find the incident
    const incident = MOCK_INCIDENTS.find(i => i.id === incidentId);

    if (!incident) {
      logger.warn(`Incident not found: ${incidentId}`);
      throw new NotFoundError('Incident');
    }

    logger.info(`Generating postmortem for incident: ${incident.title}`);

    // Set end time to now if not set
    if (!incident.endTime) {
      incident.endTime = new Date().toISOString();
    }

    // Generate postmortem using AI
    const postmortem = await generatePostmortem(incident);

    // Store in memory
    generatedPostmortems.set(postmortem.id, postmortem);

    logger.info(`✅ Postmortem generated successfully: ${postmortem.id}`);

    return NextResponse.json({
      success: true,
      postmortem
    });
  } catch (error) {
    logger.apiError('/api/generate-postmortem', error as Error, {
      method: 'POST',
    });

    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      logger.debug('Fetching all postmortems');
      // Return all postmortems
      return NextResponse.json({
        postmortems: Array.from(generatedPostmortems.values())
      });
    }

    logger.debug(`Fetching postmortem: ${id}`);
    const postmortem = generatedPostmortems.get(id);

    if (!postmortem) {
      logger.warn(`Postmortem not found: ${id}`);
      throw new NotFoundError('Postmortem');
    }

    return NextResponse.json({ postmortem });
  } catch (error) {
    logger.apiError('/api/generate-postmortem', error as Error, {
      method: 'GET',
    });

    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
