import React, { useState, useEffect } from 'react';
import { MasterQuiz } from './MasterQuiz';
import { getNextQuestions, completeRun } from '../profileStore';

export const QuizChannel: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQuestions(getNextQuestions(2));
  }, []);

  function handleComplete() {
    completeRun();
    setDone(true);
  }

  if (done || questions.length === 0) {
    return (
      <div className="p-4 text-center text-lg">
        All set for today—check out your plan!
      </div>
    );
  }

  return <MasterQuiz questions={questions} onComplete={handleComplete} />;
}; 