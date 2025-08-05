import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export function generateSessionId(): string {
  return nanoid();
}

export function generateUserId(): string {
  return nanoid();
}

export function calculateAverage(votes: number[]): number {
  if (votes.length === 0) return 0;
  return votes.reduce((sum, vote) => sum + vote, 0) / votes.length;
}

export function findConsensus(votes: number[]): number | null {
  if (votes.length === 0) return null;
  
  const voteCount: Record<number, number> = {};
  votes.forEach(vote => {
    voteCount[vote] = (voteCount[vote] || 0) + 1;
  });
  
  const maxCount = Math.max(...Object.values(voteCount));
  const consensusVotes = Object.entries(voteCount)
    .filter(([, count]) => count === maxCount)
    .map(([vote]) => parseInt(vote));
  
  return consensusVotes.length === 1 ? consensusVotes[0] : null;
}