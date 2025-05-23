import React, { useState, useEffect } from 'react';
import { fetchNextBubbles } from '../utils/api';
import { Profile } from '../types/profile';

interface SimpleQuestionnaireProps {
  onComplete: (profile: Profile) => void;
}

const QUESTION_CATEGORIES = [
  {
    category: 'basic',
    prompt: 'Return a single basic demographic question (e.g., age range, location, etc.). Format as a natural, friendly question.'
  },
  {
    category: 'interests',
    prompt: 'Return a single question about hobbies, interests, or activities the person enjoys. Format as a natural, friendly question.'
  },
  {
    category: 'lifestyle',
    prompt: 'Return a single question about daily routine, work-life balance, or lifestyle preferences. Format as a natural, friendly question.'
  },
  {
    category: 'goals',
    prompt: 'Return a single question about future goals, aspirations, or what they want to achieve. Format as a natural, friendly question.'
  },
  {
    category: 'personality',
    prompt: 'Return a single question about personality traits, preferences, or how they handle situations. Format as a natural, friendly question.'
  }
];

export default function SimpleQuestionnaire({ onComplete }: SimpleQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const loadNextQuestion = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const currentCategory = QUESTION_CATEGORIES[currentCategoryIndex];
      const systemPrompt = `You are a digital profiler. ${currentCategory.prompt}`;
      
      const nextQuestion = await fetchNextBubbles(
        systemPrompt,
        { 
          previousAnswers: answers,
          currentCategory: currentCategory.category
        }
      );
      setCurrentQuestion(nextQuestion[0]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNextQuestion();
  }, [currentCategoryIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const newAnswers = {
      ...answers,
      [currentQuestion]: userAnswer.trim()
    };
    setAnswers(newAnswers);
    setUserAnswer('');

    // Move to next category or complete
    if (currentCategoryIndex < QUESTION_CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      // Complete profile with all gathered information
      const profile: Profile = {
        answers: Object.entries(newAnswers).map(([q, a]) => `${q}: ${a}`),
        ageRange: newAnswers['What is your age range?'] || 
                 newAnswers['Which age group do you belong to?'] || 
                 undefined,
        context: newAnswers['What is your current life situation?'] ||
                newAnswers['What best describes your current lifestyle?'] ||
                undefined,
        hobbies: Object.values(newAnswers)
          .join(' ')
          .match(/(?:hobbies?|interests?|activities|enjoy|like).*?([^.!?]+)/i)?.[1]
          ?.split(',')
          .map(h => h.trim()) || undefined
      };
      onComplete(profile);
    }
  };

  if (isLoading && !currentQuestion) {
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
          style={{ width: `${((currentCategoryIndex + 1) / QUESTION_CATEGORIES.length) * 100}%` }}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Error: {error}</p>
          <button
            onClick={loadNextQuestion}
            className="mt-2 px-3 py-1 bg-red-200 rounded hover:bg-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {!error && currentQuestion && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg mb-3">{currentQuestion}</p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your answer here..."
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!userAnswer.trim()}
            className={`
              px-4 py-2 rounded-full text-white
              ${userAnswer.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}
              transition-colors
            `}
          >
            {currentCategoryIndex < QUESTION_CATEGORIES.length - 1 ? 'Next' : 'Complete'}
          </button>
        </form>
      )}
    </div>
  );
} 