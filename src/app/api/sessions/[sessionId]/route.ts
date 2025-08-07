import { NextRequest, NextResponse } from 'next/server';
import { dbSessionStore } from '@/lib/dbSessionStore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await dbSessionStore.getSession(sessionId.toUpperCase());
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Convert participants to response format
    const participantsList = Array.from(session.participants.values()).map(participant => ({
      userId: participant.userId,
      displayName: participant.displayName,
      hasVoted: participant.hasVoted,
      joinedAt: participant.joinedAt.toISOString(),
      // Include vote value only if session is revealed
      vote: session.status === 'revealed' ? participant.vote : undefined,
    }));

    const response = {
      sessionId: session.sessionId,
      ticketName: session.ticketName,
      ticketNumber: session.ticketNumber,
      status: session.status,
      participants: participantsList,
      createdBy: session.createdBy,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}