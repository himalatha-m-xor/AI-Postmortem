import { NextRequest, NextResponse } from 'next/server';
import { generatePostmortem } from '@/lib/ai/generator';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';

// Store generated postmortems in memory (in production, use a database)
const generatedPostmortems = new Map();

export async function POST(request: NextRequest) {
  try {
    const { incidentId } = await request.json();

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    // Find the incident
    const incident = MOCK_INCIDENTS.find(i => i.id === incidentId);
    
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Set end time to now if not set
    if (!incident.endTime) {
      incident.endTime = new Date().toISOString();
    }

    // Generate postmortem using AI
    const postmortem = await generatePostmortem(incident);

    // Store in memory
    generatedPostmortems.set(postmortem.id, postmortem);

    return NextResponse.json({
      success: true,
      postmortem
    });
  } catch (error) {
    console.error('Error generating postmortem:', error);
    return NextResponse.json(
      { error: 'Failed to generate postmortem', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    // Return all postmortems
    return NextResponse.json({
      postmortems: Array.from(generatedPostmortems.values())
    });
  }

  const postmortem = generatedPostmortems.get(id);
  
  if (!postmortem) {
    return NextResponse.json(
      { error: 'Postmortem not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ postmortem });
}
