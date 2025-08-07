import { NextRequest, NextResponse } from 'next/server';
import { dbSessionStore } from '@/lib/dbSessionStore';
import { VoteRequest, FIBONACCI_SCORES, FibonacciScore } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: VoteRequest = await request.json();
    const { sessionId, userId, score } = body;

    // Validate required fields
    if (!sessionId || !userId || score === undefined) {
      return NextResponse.json(
        { error: 'Session ID, user ID, and score are required' },
        { status: 400 }
      );
    }

    // Validate score is a valid Fibonacci number
    if (!FIBONACCI_SCORES.includes(score as FibonacciScore)) {
      return NextResponse.json(
        { error: 'Invalid score. Must be one of: 1, 2, 3, 5, 8, 13, 21' },
        { status: 400 }
      );
    }

    // Attempt to record the vote
    const success = await dbSessionStore.vote(sessionId.toUpperCase(), userId, score);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to record vote. Session may not exist, be inactive, or user may not be in session' },
        { status: 404 }
      );
    }

    // Get updated session to return current state
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
      // Don't include actual vote value until session is revealed
      vote: session.status === 'revealed' ? participant.vote : undefined,
    }));

    const response = {
      sessionId: session.sessionId,
      status: session.status,
      participants: participantsList,
      voteRecorded: true,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}