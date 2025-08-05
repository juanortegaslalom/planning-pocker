'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreateSessionResponse } from '@/types';

export default function CreateSessionPage() {
  const [ticketName, setTicketName] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSession, setCreatedSession] = useState<CreateSessionResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketName: ticketName.trim() || undefined,
          ticketNumber: ticketNumber.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData: CreateSessionResponse = await response.json();
      setCreatedSession(sessionData);
    } catch (err) {
      setError('Failed to create session. Please try again.');
      console.error('Error creating session:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (createdSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Session Created!</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Session ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdSession.sessionId}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(createdSession.sessionId)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdSession.shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(createdSession.shareLink)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            {createdSession.ticketName && (
              <div>
                <label className="block text-sm font-medium mb-1">Ticket Name</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">{createdSession.ticketName}</p>
              </div>
            )}

            {createdSession.ticketNumber && (
              <div>
                <label className="block text-sm font-medium mb-1">Ticket Number</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md text-sm">{createdSession.ticketNumber}</p>
              </div>
            )}

            <a
              href={`/session/${createdSession.sessionId}`}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-center block"
            >
              Join Session
            </a>

            <button
              onClick={() => setCreatedSession(null)}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Create Another Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create Planning Poker Session</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ticketName" className="block text-sm font-medium mb-1">
              Ticket Name (Optional)
            </label>
            <input
              type="text"
              id="ticketName"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              placeholder="e.g., User Authentication Feature"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="ticketNumber" className="block text-sm font-medium mb-1">
              Ticket Number (Optional)
            </label>
            <input
              type="text"
              id="ticketNumber"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="e.g., JIRA-123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Session...' : 'Create Session'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}