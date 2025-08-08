import { NextRequest, NextResponse } from 'next/server';
import { dbSessionStore } from '@/lib/dbSessionStore';
import { CreateSessionRequest, CreateSessionResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating session - starting process');
    const body: CreateSessionRequest = await request.json();
    console.log('Request body received:', { ticketName: body?.ticketName, ticketNumber: body?.ticketNumber });
    
    const { ticketName, ticketNumber } = body;

    console.log('Calling dbSessionStore.createSession...');
    const session = await dbSessionStore.createSession(ticketName, ticketNumber);
    console.log('Session created successfully:', { sessionId: session.sessionId });
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (request.headers.get('host') ? `https://${request.headers.get('host')}` : 'http://localhost:3000');
    
    const response: CreateSessionResponse = {
      sessionId: session.sessionId,
      ticketName: session.ticketName,
      ticketNumber: session.ticketNumber,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      shareLink: `${baseUrl}/session/${session.sessionId}`,
    };

    console.log('Returning successful response');
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating session - detailed error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('Error name:', error instanceof Error ? error.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}