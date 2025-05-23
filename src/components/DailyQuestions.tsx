import React, { useState, useEffect } from 'react';
import { Question, QuizConfig, quizConfigs } from '../quizConfigs';
import { getProfile, saveProfile } from '../profileStore';

interface DailyQuestionsProps {
  onComplete: () => void;
}

export const DailyQuestions: React.FC<DailyQuestionsProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const profile = getProfile();
    if (!profile) return;
    
    // Get a random category from master quiz that hasn't been completed today
    const getRandomCategory = () => {
      const today = new Date().toISOString().split('T')[0];
      const completedToday = JSON.parse(localStorage.getItem(`completed_categories_${today}`) || '[]');
      const availableCategories = quizConfigs.filter(config => !completedToday.includes(config.id));
      
      if (availableCategories.length === 0) {
        return null;
      }
      
      return availableCategories[Math.floor(Math.random() * availableCategories.length)];
    };

    const category = getRandomCategory();
    if (category && category.questions.length > 0) {
      setCurrentQuestion(category.questions[0]);
    }
  }, []);

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion!.id]: answer };
    setAnswers(newAnswers);

    // Save answer to profile
    const profile = getProfile();
    if (profile) {
      profile[currentQuestion!.profileKey] = answer;
      saveProfile(profile);

      // Mark category as completed for today
      const today = new Date().toISOString().split('T')[0];
      const completedToday = JSON.parse(localStorage.getItem(`completed_categories_${today}`) || '[]');
      const currentCategory = quizConfigs.find(config => 
        config.questions.some(q => q.id === currentQuestion!.id)
      );
      
      if (currentCategory && !completedToday.includes(currentCategory.id)) {
        completedToday.push(currentCategory.id);
        localStorage.setItem(`completed_categories_${today}`, JSON.stringify(completedToday));
      }
    }

    onComplete();
  };

  if (!currentQuestion) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">All questions completed for today!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xl font-semibold">{currentQuestion.prompt}</h3>
      <div className="grid grid-cols-2 gap-4">
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="p-3 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}; 