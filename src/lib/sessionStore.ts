import { Session, Participant } from '@/types';
import { generateSessionId, generateUserId } from './utils';

class SessionStore {
  private sessions = new Map<string, Session>();

  createSession(ticketName?: string, ticketNumber?: string, createdBy?: string): Session {
    const sessionId = generateSessionId();
    const userId = createdBy || generateUserId();
    
    const session: Session = {
      sessionId,
      ticketName,
      ticketNumber,
      status: 'active',
      createdAt: new Date(),
      createdBy: userId,
      participants: new Map<string, Participant>(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  joinSession(sessionId: string, displayName: string): { session: Session; userId: string } | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'ended') {
      return null;
    }

    const userId = generateUserId();
    const participant: Participant = {
      userId,
      displayName,
      hasVoted: false,
      joinedAt: new Date(),
    };

    session.participants.set(userId, participant);
    return { session, userId };
  }

  vote(sessionId: string, userId: string, score: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    const participant = session.participants.get(userId);
    if (!participant) {
      return false;
    }

    participant.vote = score;
    participant.hasVoted = true;
    return true;
  }

  revealVotes(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.createdBy !== userId) {
      return false;
    }

    session.status = 'revealed';
    return true;
  }

  endSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.createdBy !== userId) {
      return false;
    }

    session.status = 'ended';
    return true;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  getEndedSessions(): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'ended');
  }
}

export const sessionStore = new SessionStore();