'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SessionHistory {
  sessionId: string;
  ticketName?: string;
  ticketNumber?: string;
  status: string;
  createdAt: string;
  participants: {
    displayName: string;
    vote?: number;
    hasVoted: boolean;
  }[];
  stats: {
    average: number;
    min: number;
    max: number;
    participantCount: number;
    votedCount: number;
  };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/sessions/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Voting History</h1>
          <p className="text-gray-600 mt-2">View past planning poker sessions and their results</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No voting history available yet. Complete some sessions to see them here!
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((session) => (
              <div key={session.sessionId} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpanded(session.sessionId)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.ticketNumber && session.ticketName ? (
                            <>
                              <span className="text-blue-600">{session.ticketNumber}</span>
                              {' - '}
                              {session.ticketName}
                            </>
                          ) : session.ticketName ? (
                            session.ticketName
                          ) : (
                            `Session ${session.sessionId}`
                          )}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'ended' 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(session.createdAt)}
                      </p>
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-gray-600">
                          <strong>{session.stats.participantCount}</strong> participants
                        </span>
                        <span className="text-gray-600">
                          <strong>{session.stats.votedCount}</strong> voted
                        </span>
                        {session.stats.votedCount > 0 && (
                          <>
                            <span className="text-gray-600">
                              Average: <strong>{session.stats.average.toFixed(1)}</strong>
                            </span>
                            <span className="text-gray-600">
                              Range: <strong>{session.stats.min} - {session.stats.max}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedSessions.has(session.sessionId) ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedSessions.has(session.sessionId) && (
                  <div className="border-t px-6 py-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Voting Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {session.participants.map((participant, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg ${
                            participant.hasVoted 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {participant.displayName}
                          </div>
                          <div className="text-2xl font-bold mt-1">
                            {participant.hasVoted ? (
                              participant.vote !== undefined ? (
                                <span className="text-blue-600">{participant.vote}</span>
                              ) : (
                                <span className="text-gray-400">?</span>
                              )
                            ) : (
                              <span className="text-gray-400 text-sm">Not voted</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}