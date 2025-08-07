import { db } from './db';
import { sessions, participants } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { generateSessionId, generateUserId } from './utils';
import { Session, Participant } from '@/types';

class DatabaseSessionStore {
  async createSession(ticketName?: string, ticketNumber?: string): Promise<Session> {
    const sessionId = generateSessionId();
    const createdBy = generateUserId();

    await db.insert(sessions).values({
      sessionId,
      ticketName,
      ticketNumber,
      status: 'active',
      createdAt: Date.now(),
      createdBy,
    });

    return {
      sessionId,
      ticketName,
      ticketNumber,
      status: 'active',
      createdAt: new Date(),
      createdBy,
      participants: new Map(),
    };
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId.toUpperCase()));

    if (!session) return null;

    const sessionParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.sessionId, sessionId.toUpperCase()));

    const participantsMap = new Map<string, Participant>();
    sessionParticipants.forEach(p => {
      participantsMap.set(p.userId, {
        userId: p.userId,
        displayName: p.displayName,
        vote: p.vote || undefined,
        hasVoted: p.hasVoted,
        joinedAt: new Date(p.joinedAt),
      });
    });

    return {
      sessionId: session.sessionId,
      ticketName: session.ticketName || undefined,
      ticketNumber: session.ticketNumber || undefined,
      status: session.status as 'active' | 'revealed' | 'ended',
      createdAt: new Date(session.createdAt),
      createdBy: session.createdBy,
      participants: participantsMap,
    };
  }

  async joinSession(sessionId: string, displayName: string): Promise<{ session: Session; userId: string } | null> {
    const session = await this.getSession(sessionId.toUpperCase());
    if (!session || session.status === 'ended') {
      return null;
    }

    const userId = generateUserId();

    // If this is the first participant, make them the creator
    if (session.participants.size === 0) {
      await db
        .update(sessions)
        .set({ createdBy: userId })
        .where(eq(sessions.sessionId, sessionId.toUpperCase()));
      session.createdBy = userId;
    }

    await db.insert(participants).values({
      sessionId: sessionId.toUpperCase(),
      userId,
      displayName,
      hasVoted: false,
      joinedAt: Date.now(),
    });

    const participant: Participant = {
      userId,
      displayName,
      hasVoted: false,
      joinedAt: new Date(),
    };

    session.participants.set(userId, participant);
    return { session, userId };
  }

  async vote(sessionId: string, userId: string, score: number): Promise<boolean> {
    const session = await this.getSession(sessionId.toUpperCase());
    if (!session || session.status !== 'active') {
      return false;
    }

    if (!session.participants.has(userId)) {
      return false;
    }

    await db
      .update(participants)
      .set({ vote: score, hasVoted: true })
      .where(and(
        eq(participants.sessionId, sessionId.toUpperCase()),
        eq(participants.userId, userId)
      ));

    return true;
  }

  async revealVotes(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.getSession(sessionId.toUpperCase());
    if (!session || session.createdBy !== userId) {
      return false;
    }

    await db
      .update(sessions)
      .set({ status: 'revealed' })
      .where(eq(sessions.sessionId, sessionId.toUpperCase()));

    return true;
  }

  async endSession(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.getSession(sessionId.toUpperCase());
    if (!session || session.createdBy !== userId) {
      return false;
    }

    await db
      .update(sessions)
      .set({ status: 'ended' })
      .where(eq(sessions.sessionId, sessionId.toUpperCase()));

    return true;
  }


  async getAllSessions(): Promise<Session[]> {
    const allSessions = await db.select().from(sessions);
    const result: Session[] = [];

    for (const session of allSessions) {
      const fullSession = await this.getSession(session.sessionId);
      if (fullSession) {
        result.push(fullSession);
      }
    }

    return result;
  }

  async getActiveSessions(): Promise<Session[]> {
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.status, 'active'));

    const result: Session[] = [];
    for (const session of activeSessions) {
      const fullSession = await this.getSession(session.sessionId);
      if (fullSession) {
        result.push(fullSession);
      }
    }

    return result;
  }

  async getEndedSessions(): Promise<Session[]> {
    const endedSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.status, 'ended'));

    const result: Session[] = [];
    for (const session of endedSessions) {
      const fullSession = await this.getSession(session.sessionId);
      if (fullSession) {
        result.push(fullSession);
      }
    }

    return result;
  }
}

export const dbSessionStore = new DatabaseSessionStore();