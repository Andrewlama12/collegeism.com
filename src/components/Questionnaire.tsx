import React, { useState, useEffect } from 'react';
import { fetchNextBubbles } from '../utils/api';
import { Profile } from '../types/profile';

interface QuestionnaireProps {
  onComplete: (profile: Profile) => void;
}

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [probes, setProbes] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial probes
  const loadInitial = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const list = await fetchNextBubbles(
        'You are a digital profiler. Given no input, return 5 non-leading open-ended question prompts as a JSON array of strings.',
        {}
      );
      setProbes(list);
    } catch (e: any) {
      console.error('Failed to load initial probes:', e);
      setError(e.message || 'Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleTap = async (probe: string) => {
    setError(null);
    const newAnswers = [...answers, probe];
    setAnswers(newAnswers);
    
    if (newAnswers.length >= 8) {
      onComplete({ answers: newAnswers });
      return;
    }

    setIsLoading(true);
    try {
      const next = await fetchNextBubbles(
        `You are a digital profiler. Given answers ${JSON.stringify(
          newAnswers
        )}, return the next 3 open-ended probe prompts as a JSON array.`,
        { answers: newAnswers }
      );
      setProbes(next);
    } catch (e: any) {
      console.error('Failed to load next probes:', e);
      setError(e.message || 'Failed to load next questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && probes.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Tell me about you</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Tell me about you</h2>
      <div className="h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${(answers.length / 8) * 100}%` }}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Error: {error}</p>
          <button
            onClick={loadInitial}
            className="mt-2 px-3 py-1 bg-red-200 rounded hover:bg-red-300 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="flex flex-wrap gap-3 pt-4">
          {probes.map((p) => (
            <button
              key={p}
              onClick={() => handleTap(p)}
              disabled={isLoading}
              className={`
                bg-gray-100 px-4 py-2 rounded-full 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} 
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 