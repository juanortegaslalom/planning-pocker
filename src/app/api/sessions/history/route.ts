import { NextResponse } from 'next/server';
import { dbSessionStore } from '@/lib/dbSessionStore';

export async function GET() {
  try {
    const historySessions = await dbSessionStore.getSessionHistory();
    
    const formattedHistory = historySessions.map(session => {
      const votes = Array.from(session.participants.values())
        .filter(p => p.hasVoted && p.vote !== undefined)
        .map(p => p.vote!);
      
      const stats = votes.length > 0 ? {
        average: votes.reduce((a, b) => a + b, 0) / votes.length,
        min: Math.min(...votes),
        max: Math.max(...votes),
        participantCount: session.participants.size,
        votedCount: votes.length,
      } : {
        average: 0,
        min: 0,
        max: 0,
        participantCount: session.participants.size,
        votedCount: 0,
      };

      return {
        sessionId: session.sessionId,
        ticketName: session.ticketName,
        ticketNumber: session.ticketNumber,
        status: session.status,
        createdAt: session.createdAt,
        participants: Array.from(session.participants.values()).map(p => ({
          displayName: p.displayName,
          vote: session.status === 'revealed' || session.status === 'ended' ? p.vote : undefined,
          hasVoted: p.hasVoted,
        })),
        stats,
      };
    });

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Failed to fetch session history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session history' },
      { status: 500 }
    );
  }
}