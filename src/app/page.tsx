'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [sessionId, setSessionId] = useState('');

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      window.location.href = `/session/${sessionId.trim().toUpperCase()}`;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2">Planning Poker</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Estimate task complexity with your team using Fibonacci scoring
        </p>
        
        <div className="space-y-4">
          <Link
            href="/create-session"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors block font-medium"
          >
            Create New Session
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            or
          </div>
          
          <form onSubmit={handleJoinSession} className="space-y-2">
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter Session ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={8}
            />
            <button 
              type="submit"
              disabled={!sessionId.trim()}
              className="w-full bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Session
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          <p>Anonymous sessions • No signup required</p>
          <p>Fibonacci scale: 1, 2, 3, 5, 8, 13</p>
        </div>
      </div>
    </div>
  );
}
