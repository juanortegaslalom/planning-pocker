'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JoinSessionResponse } from '@/types';

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

  // Ensure we're on the client side before using localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is already in this session (from localStorage)
  useEffect(() => {
    if (!isClient) return;
    
    const storedUserId = localStorage.getItem(`session_${sessionId}_userId`);
    if (storedUserId) {
      setUserId(storedUserId);
      // TODO: Fetch current session state with stored userId
    }
  }, [sessionId, isClient]);

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
            Participants ({sessionData.participants.length})
          </h2>
          
          <div className="space-y-2">
            {sessionData.participants.map((participant) => (
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
                    {participant.hasVoted ? 'Voted' : 'Waiting'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon - Voting Interface */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6 text-center">
          <h3 className="font-semibold text-yellow-800 mb-2">Coming Soon</h3>
          <p className="text-yellow-700">Fibonacci voting interface will be available in the next story.</p>
        </div>
      </div>
    </div>
  );
}