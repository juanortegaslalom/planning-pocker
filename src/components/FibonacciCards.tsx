import { FIBONACCI_SCORES, FibonacciScore } from '@/types';

interface FibonacciCardsProps {
  selectedScore?: number;
  onScoreSelect: (score: FibonacciScore) => void;
  disabled?: boolean;
}

export default function FibonacciCards({ selectedScore, onScoreSelect, disabled = false }: FibonacciCardsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Select Your Estimate</h3>
      
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {FIBONACCI_SCORES.map((score) => (
          <button
            key={score}
            onClick={() => !disabled && onScoreSelect(score)}
            disabled={disabled}
            className={`
              relative h-20 w-full rounded-lg border-2 transition-all duration-200
              flex items-center justify-center text-xl font-bold
              ${selectedScore === score
                ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-700'
              }
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-md cursor-pointer'
              }
            `}
          >
            {score}
            {selectedScore === score && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {selectedScore 
            ? `You selected: ${selectedScore} points`
            : 'Click a card to vote'
          }
        </p>
      </div>
    </div>
  );
}