import { NextRequest, NextResponse } from 'next/server';
import { dbSessionStore } from '@/lib/dbSessionStore';
import { RevealRequest } from '@/types';
import { calculateAverage, findConsensus } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body: RevealRequest = await request.json();
    const { sessionId, userId } = body;

    // Validate required fields
    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and user ID are required' },
        { status: 400 }
      );
    }

    // Attempt to reveal the session votes
    const success = await dbSessionStore.revealVotes(sessionId.toUpperCase(), userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reveal votes. You must be the session creator.' },
        { status: 403 }
      );
    }

    // Get the updated session with revealed votes
    const session = await dbSessionStore.getSession(sessionId.toUpperCase());
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Convert participants to response format with revealed votes
    const participantsList = Array.from(session.participants.values()).map(participant => ({
      userId: participant.userId,
      displayName: participant.displayName,
      hasVoted: participant.hasVoted,
      joinedAt: participant.joinedAt.toISOString(),
      vote: participant.vote, // Now include the actual vote
    }));

    // Calculate results
    const votes = participantsList
      .filter(p => p.hasVoted && p.vote !== undefined)
      .map(p => p.vote!);
    
    const average = votes.length > 0 ? calculateAverage(votes) : 0;
    const consensus = votes.length > 0 ? findConsensus(votes) : null;
    
    // Count votes by value
    const voteDistribution: Record<number, number> = {};
    votes.forEach(vote => {
      voteDistribution[vote] = (voteDistribution[vote] || 0) + 1;
    });

    const response = {
      sessionId: session.sessionId,
      ticketName: session.ticketName,
      ticketNumber: session.ticketNumber,
      status: session.status,
      participants: participantsList,
      results: {
        totalVotes: votes.length,
        totalParticipants: participantsList.length,
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        consensus,
        voteDistribution,
        revealed: true,
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error revealing votes:', error);
    return NextResponse.json(
      { error: 'Failed to reveal votes' },
      { status: 500 }
    );
  }
}