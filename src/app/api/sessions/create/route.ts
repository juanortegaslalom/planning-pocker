import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/sessionStore';
import { CreateSessionRequest, CreateSessionResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    const { ticketName, ticketNumber } = body;

    const session = sessionStore.createSession(ticketName, ticketNumber);
    
    const response: CreateSessionResponse = {
      sessionId: session.sessionId,
      ticketName: session.ticketName,
      ticketNumber: session.ticketNumber,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      shareLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/session/${session.sessionId}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}