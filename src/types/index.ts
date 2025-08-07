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

export interface JoinSessionResponse {
  sessionId: string;
  ticketName?: string;
  ticketNumber?: string;
  status: string;
  userId: string;
  participants: ParticipantResponse[];
  isCreator: boolean;
}

export interface ParticipantResponse {
  userId: string;
  displayName: string;
  hasVoted: boolean;
  joinedAt: string;
  vote?: number; // Only included when session is revealed
}

export interface VoteResponse {
  sessionId: string;
  status: string;
  participants: ParticipantResponse[];
  voteRecorded: boolean;
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

export interface RevealResponse {
  sessionId: string;
  ticketName?: string;
  ticketNumber?: string;
  status: string;
  participants: ParticipantResponse[];
  results: SessionResults;
}

export interface SessionResults {
  totalVotes: number;
  totalParticipants: number;
  average: number;
  consensus: number | null;
  voteDistribution: Record<number, number>;
  revealed: boolean;
}

export const FIBONACCI_SCORES = [1, 2, 3, 5, 8, 13, 21] as const;
export type FibonacciScore = typeof FIBONACCI_SCORES[number];