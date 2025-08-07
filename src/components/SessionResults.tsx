import { SessionResults as SessionResultsType, ParticipantResponse } from '@/types';

interface SessionResultsProps {
  results: SessionResultsType;
  participants: ParticipantResponse[];
}

export default function SessionResults({ results, participants }: SessionResultsProps) {
  const votedParticipants = participants.filter(p => p.hasVoted && p.vote !== undefined);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-green-600 mb-2">🎉 Votes Revealed!</h3>
        <p className="text-gray-600 dark:text-gray-400">Here are the results from your planning session</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{results.totalVotes}</div>
          <div className="text-sm text-blue-600">Total Votes</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{results.average}</div>
          <div className="text-sm text-green-600">Average</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {results.consensus || 'No'}
          </div>
          <div className="text-sm text-purple-600">Consensus</div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((results.totalVotes / results.totalParticipants) * 100)}%
          </div>
          <div className="text-sm text-orange-600">Participation</div>
        </div>
      </div>

      {/* Individual Votes */}
      <div>
        <h4 className="font-semibold mb-3">Individual Votes</h4>
        <div className="space-y-2">
          {votedParticipants.map((participant) => (
            <div 
              key={participant.userId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {participant.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{participant.displayName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">{participant.vote}</span>
                <span className="text-sm text-gray-500">points</span>
              </div>
            </div>
          ))}
          
          {participants.filter(p => !p.hasVoted).map((participant) => (
            <div 
              key={participant.userId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {participant.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{participant.displayName}</span>
              </div>
              
              <span className="text-sm text-gray-500 italic">Did not vote</span>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}