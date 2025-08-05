export interface Session {
  sessionId: string;
  ticketName?: string;
  ticketNumber?: string;
  status: 'active' | 'ended' | 'revealed';
  createdAt: Date;
  createdBy: string;
  participants: Map<string, Participant>;
}

export interface Participant {
  userId: string;
  displayName: string;
  vote?: number;
  hasVoted: boolean;
  joinedAt: Date;
}

export interface CreateSessionRequest {
  ticketName?: string;
  ticketNumber?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  ticketName?: string;
  ticketNumber?: string;
  status: string;
  createdAt: string;
  shareLink: string;
}

export interface JoinSessionRequest {
  sessionId: string;
  displayName: string;
}

export interface VoteRequest {
  sessionId: string;
  userId: string;
  score: number;
}

export interface RevealRequest {
  sessionId: string;
  userId: string;
}

export const FIBONACCI_SCORES = [1, 2, 3, 5, 8, 13, 21] as const;
export type FibonacciScore = typeof FIBONACCI_SCORES[number];