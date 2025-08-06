import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/sessionStore';
import { JoinSessionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: JoinSessionRequest = await request.json();
    const { sessionId, displayName } = body;

    // Validate required fields
    if (!sessionId || !displayName?.trim()) {
      return NextResponse.json(
        { error: 'Session ID and display name are required' },
        { status: 400 }
      );
    }

    // Attempt to join the session
    const result = sessionStore.joinSession(sessionId.toUpperCase(), displayName.trim());
    
    if (!result) {
      return NextResponse.json(
        { error: 'Session not found or has ended' },
        { status: 404 }
      );
    }

    const { session, userId } = result;
    
    // Convert participants Map to Array for JSON serialization
    const participantsList = Array.from(session.participants.values()).map(participant => ({
      userId: participant.userId,
      displayName: participant.displayName,
      hasVoted: participant.hasVoted,
      joinedAt: participant.joinedAt.toISOString(),
    }));

    const response = {
      sessionId: session.sessionId,
      ticketName: session.ticketName,
      ticketNumber: session.ticketNumber,
      status: session.status,
      userId,
      participants: participantsList,
      isCreator: session.createdBy === userId,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}