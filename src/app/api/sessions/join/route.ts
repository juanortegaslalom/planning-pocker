import { NextRequest, NextResponse } from 'next/server';
import { dbSessionStore } from '@/lib/dbSessionStore';
import { JoinSessionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('Joining session - starting process');
    const body: JoinSessionRequest = await request.json();
    console.log('Request body received:', { sessionId: body?.sessionId, displayName: body?.displayName ? '[REDACTED]' : undefined });
    
    const { sessionId, displayName } = body;

    // Validate required fields
    if (!sessionId || !displayName?.trim()) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Session ID and display name are required' },
        { status: 400 }
      );
    }

    console.log('Calling dbSessionStore.joinSession...', { sessionId: sessionId.toUpperCase() });
    
    // Attempt to join the session
    const result = await dbSessionStore.joinSession(sessionId.toUpperCase(), displayName.trim());
    
    if (!result) {
      console.log('Join session failed - session not found or ended');
      return NextResponse.json(
        { error: 'Session not found or has ended' },
        { status: 404 }
      );
    }

    const { session, userId } = result;
    console.log('Session joined successfully:', { sessionId: session.sessionId, userId, participantCount: session.participants.size });
    
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

    console.log('Returning successful join response');
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error joining session - detailed error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('Error name:', error instanceof Error ? error.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: 'Failed to join session',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}