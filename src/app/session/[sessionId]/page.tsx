'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JoinSessionResponse, VoteResponse, FibonacciScore, RevealResponse, ParticipantResponse } from '@/types';
import FibonacciCards from '@/components/FibonacciCards';
import Button from '@/components/Button';
import SessionResults from '@/components/SessionResults';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState<JoinSessionResponse | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | undefined>();
  const [isVoting, setIsVoting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedResults, setRevealedResults] = useState<RevealResponse | null>(null);

  // Ensure we're on the client side before using localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchSessionState = useCallback(async (currentUserId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      
      if (response.ok) {
        const sessionData = await response.json();
        
        // Check if user is still in the session
        const userInSession = sessionData.participants.find(
          (p: ParticipantResponse) => p.userId === currentUserId
        );
        
        if (userInSession) {
          // Determine if current user is the creator by checking if they're the first participant
          const sortedParticipants = sessionData.participants.sort(
            (a: ParticipantResponse, b: ParticipantResponse) => 
              new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          );
          const isCreator = sortedParticipants.length > 0 && sortedParticipants[0].userId === currentUserId;
          
          setSessionData({
            ...sessionData,
            userId: currentUserId,
            isCreator: isCreator
          });
          
          // If session is revealed, we need to also set up the results
          if (sessionData.status === 'revealed') {
            // Calculate results for revealed session
            const votes = sessionData.participants
              .filter((p: ParticipantResponse) => p.hasVoted && p.vote !== undefined)
              .map((p: ParticipantResponse) => p.vote!);
              
            const average = votes.length > 0 ? votes.reduce((a: number, b: number) => a + b, 0) / votes.length : 0;
            const consensus = votes.length > 0 && votes.every((v: number) => v === votes[0]) ? votes[0] : null;
            
            setRevealedResults({
              sessionId: sessionData.sessionId,
              ticketName: sessionData.ticketName,
              ticketNumber: sessionData.ticketNumber,
              status: sessionData.status,
              participants: sessionData.participants,
              results: {
                totalVotes: votes.length,
                totalParticipants: sessionData.participants.length,
                average: Math.round(average * 10) / 10,
                consensus,
                revealed: true
              }
            });
            
            // Set user's vote if they voted
            if (userInSession.vote !== undefined) {
              setSelectedScore(userInSession.vote);
            }
          }
        } else {
          // User is no longer in session, clear localStorage
          localStorage.removeItem(`session_${sessionId}_userId`);
          localStorage.removeItem(`session_${sessionId}_displayName`);
          setUserId(null);
          setDisplayName('');
        }
      }
    } catch (error) {
      console.error('Error fetching session state:', error);
    }
  }, [sessionId]);

  // Check if user is already in this session (from localStorage)
  useEffect(() => {
    if (!isClient) return;
    
    const storedUserId = localStorage.getItem(`session_${sessionId}_userId`);
    const storedDisplayName = localStorage.getItem(`session_${sessionId}_displayName`);
    
    if (storedUserId && storedDisplayName) {
      setUserId(storedUserId);
      setDisplayName(storedDisplayName);
      
      // Fetch current session state
      fetchSessionState(storedUserId);
    }
  }, [sessionId, isClient, fetchSessionState]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.toUpperCase(),
          displayName: displayName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join session');
      }

      const data: JoinSessionResponse = await response.json();
      
      // Store user data in localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`session_${sessionId}_userId`, data.userId);
        localStorage.setItem(`session_${sessionId}_displayName`, displayName.trim());
      }
      
      setSessionData(data);
      setUserId(data.userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (score: FibonacciScore) => {
    if (!userId || !sessionData) return;

    setSelectedScore(score);
    setIsVoting(true);

    try {
      const response = await fetch('/api/sessions/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          userId: userId,
          score: score,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record vote');
      }

      const voteData: VoteResponse = await response.json();
      
      // Update session data with new participant states
      setSessionData(prev => prev ? {
        ...prev,
        participants: voteData.participants,
        status: voteData.status
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
      setSelectedScore(undefined);
    } finally {
      setIsVoting(false);
    }
  };

  const clearVote = async () => {
    if (!userId || !sessionData || selectedScore === undefined) return;

    setIsVoting(true);
    try {
      // Send a vote of 0 to clear (we'll handle this as "no vote" in the backend)
      const response = await fetch('/api/sessions/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          userId: userId,
          score: 1, // We'll change vote by selecting a different score
        }),
      });

      if (response.ok) {
        const voteData: VoteResponse = await response.json();
        setSessionData(prev => prev ? {
          ...prev,
          participants: voteData.participants,
          status: voteData.status
        } : null);
      }
    } catch (err) {
      console.error('Error clearing vote:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReveal = async () => {
    if (!userId || !sessionData) return;

    setIsRevealing(true);
    setError('');

    try {
      const response = await fetch('/api/sessions/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reveal votes');
      }

      const revealData: RevealResponse = await response.json();
      
      // Update session data and show results
      setRevealedResults(revealData);
      setSessionData(prev => prev ? {
        ...prev,
        participants: revealData.participants,
        status: revealData.status
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reveal votes');
    } finally {
      setIsRevealing(false);
    }
  };


  // Show loading during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user hasn't joined yet, show join form
  if (!sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Join Planning Session</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Session ID: <span className="font-mono font-bold">{sessionId}</span>
            </p>
          </div>
          
          <form onSubmit={handleJoinSession} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !displayName.trim()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining Session...' : 'Join Session'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show session room after joining
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Session Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">Planning Session</h1>
              <p className="text-gray-600 dark:text-gray-400">
                ID: <span className="font-mono">{sessionData.sessionId}</span>
                {sessionData.isCreator && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Creator
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm ${
                sessionData.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {sessionData.status.charAt(0).toUpperCase() + sessionData.status.slice(1)}
              </div>
            </div>
          </div>
          
          {(sessionData.ticketName || sessionData.ticketNumber) && (
            <div className="border-t pt-4">
              {sessionData.ticketName && (
                <p className="font-medium">{sessionData.ticketName}</p>
              )}
              {sessionData.ticketNumber && (
                <p className="text-gray-600 dark:text-gray-400">{sessionData.ticketNumber}</p>
              )}
            </div>
          )}
        </div>

        {/* Participants List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Participants ({(sessionData.status === 'revealed' && revealedResults 
              ? revealedResults.participants.length 
              : sessionData.participants.length)})
          </h2>
          
          <div className="space-y-2">
            {(sessionData.status === 'revealed' && revealedResults 
              ? revealedResults.participants 
              : sessionData.participants
            ).map((participant) => (
              <div 
                key={participant.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  participant.userId === userId 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {participant.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {participant.displayName}
                    {participant.userId === userId && (
                      <span className="text-blue-600 text-sm ml-1">(You)</span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    participant.hasVoted ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {sessionData.status === 'revealed' && participant.vote !== undefined
                      ? `Voted: ${participant.vote}`
                      : participant.hasVoted 
                        ? 'Voted' 
                        : 'Waiting'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voting Interface */}
        {sessionData.status === 'active' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
            <FibonacciCards
              selectedScore={selectedScore}
              onScoreSelect={handleVote}
              disabled={isVoting}
            />
            
            {error && (
              <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
            )}
            
            <div className="mt-4 flex justify-center space-x-3">
              {selectedScore !== undefined && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearVote}
                  disabled={isVoting}
                >
                  Change Vote
                </Button>
              )}
              
              {sessionData.isCreator && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReveal}
                  disabled={isRevealing}
                  loading={isRevealing}
                >
                  Reveal Votes
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Results Display */}
        {sessionData.status === 'revealed' && revealedResults && (
          <div className="mt-6">
            <SessionResults 
              results={revealedResults.results} 
              participants={revealedResults.participants}
            />
          </div>
        )}
        

        {sessionData.status === 'ended' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Session Ended</h3>
            <p className="text-gray-700">This session has been closed by the creator.</p>
          </div>
        )}
      </div>
    </div>
  );
}