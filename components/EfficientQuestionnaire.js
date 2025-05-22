import { useState, useEffect } from 'react';

const QUESTIONS = [
  {
    key: 'ageRange',
    question: 'Your age range?',
    type: 'bubbles',
    options: ['18–22', '23–30', '31–40', '41–55', '56+'],
  },
  {
    key: 'occupation',
    question: 'Occupation?',
    type: 'bubbles',
    options: ['Student', 'Employed', 'Freelancer', 'Self-employed', 'Retired'],
  },
  {
    key: 'stressLevel',
    question: 'Current stress level?',
    type: 'slider',
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 5
  },
  {
    key: 'hobbies',
    question: 'Pick your favorite hobbies (select all that apply):',
    type: 'multi',
    options: ['Reading', 'Cooking', 'Gaming', 'Hiking', 'Art', 'Music', 'Sports', 'Travel', 'Technology'],
  },
  {
    key: 'availability',
    question: 'When are you typically free each day?',
    type: 'timeRange',
    min: 0,
    max: 24,
    step: 0.5,
  },
  {
    key: 'sleepHabit',
    question: 'What\'s your sleep schedule like?',
    type: 'bubbles',
    options: ['Early bird', 'Night owl', 'Regular sleeper', 'Irregular sleeper'],
  },
  {
    key: 'socialEnergy',
    question: 'Social energy level?',
    type: 'slider',
    min: 0, 
    max: 10,
    step: 1,
    defaultValue: 5
  },
  {
    key: 'location',
    question: 'Where do you live?',
    type: 'text',
    placeholder: 'City/Region'
  }
];

export default function EfficientQuestionnaire({ initialProfile, onComplete, weather }) {
  const [answers, setAnswers] = useState({
    ageRange: '',
    occupation: '',
    stressLevel: 5,
    hobbies: [],
    availability: [17, 21], // 5pm to 9pm default
    sleepHabit: '',
    socialEnergy: 5,
    location: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Load initial profile if available
  useEffect(() => {
    if (initialProfile) {
      setAnswers(prev => ({
        ...prev,
        ...initialProfile
      }));
    }
  }, [initialProfile]);
  
  const currentQuestion = QUESTIONS[currentStep];
  
  const handleBubbleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  
  const handleMultiSelect = (value) => {
    setAnswers(prev => {
      const hobbies = [...prev.hobbies];
      const index = hobbies.indexOf(value);
      if (index >= 0) {
        hobbies.splice(index, 1);
      } else {
        hobbies.push(value);
      }
      return { ...prev, hobbies };
    });
  };
  
  const handleSlider = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: parseInt(value) }));
  };
  
  const handleTimeRange = (index, value) => {
    setAnswers(prev => {
      const availability = [...prev.availability];
      availability[index] = parseFloat(value);
      return { ...prev, availability };
    });
  };
  
  const handleTextInput = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  
  const canContinue = () => {
    const value = answers[currentQuestion.key];
    
    if (currentQuestion.type === 'multi') {
      return value.length > 0;
    }
    
    if (currentQuestion.type === 'text') {
      return value.trim() !== '';
    }
    
    return value !== undefined && value !== '';
  };
  
  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeQuestionnaire();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const completeQuestionnaire = async () => {
    setIsGenerating(true);
    
    if (onComplete) {
      await onComplete(answers);
    }
    
    try {
      // Generate personalized suggestions based on answers and weather
      const res = await fetch('/api/generate-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: answers,
          weather: weather
        }),
      });
      
      const data = await res.json();
      
      // If we don't have an API endpoint yet, use demo suggestions
      if (data && data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        const demoSuggestions = generateDemoSuggestions(answers);
        setSuggestions(demoSuggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to demo suggestions
      const demoSuggestions = generateDemoSuggestions(answers);
      setSuggestions(demoSuggestions);
    }
    
    setCompleted(true);
    setIsGenerating(false);
  };
  
  // Generate demo personalized suggestions based on user profile
  const generateDemoSuggestions = (profile) => {
    const suggestions = [];
    
    const isYoung = ['18–22', '23–30'].includes(profile.ageRange);
    const isOutdoorsy = profile.hobbies.some(h => ['Hiking', 'Sports', 'Travel'].includes(h));
    const isCreative = profile.hobbies.some(h => ['Art', 'Music', 'Cooking'].includes(h));
    const isEarlyBird = profile.sleepHabit === 'Early bird';
    const isHighEnergy = profile.socialEnergy > 7;
    const isNiceWeather = weather?.desc?.toLowerCase().includes('clear') || weather?.desc?.toLowerCase().includes('sunny');
    
    // Add personalized suggestions
    if (isYoung && isHighEnergy) {
      suggestions.push("Join a local sports league or fitness class to meet new people");
    }
    
    if (isOutdoorsy && isNiceWeather) {
      suggestions.push("Take advantage of today's good weather with a hike or outdoor activity");
    }
    
    if (profile.stressLevel > 7) {
      suggestions.push("Try a 10-minute meditation session to reduce stress");
    }
    
    if (isCreative) {
      suggestions.push("Set aside 30 minutes for a creative hobby you enjoy");
    }
    
    if (isEarlyBird) {
      suggestions.push("Use your morning energy for your most important tasks");
    } else {
      suggestions.push("Schedule complex tasks for when you have the most energy");
    }
    
    // Add some generic good suggestions
    suggestions.push("Read a short story to relax and get inspired");
    suggestions.push("Call a friend for a quick chat to connect");
    suggestions.push("Take a relaxing evening walk");
    
    return suggestions;
  };
  
  if (completed) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Your Personalized Plan</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Your Profile Summary</h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <p><strong>Age:</strong> {answers.ageRange}</p>
              <p><strong>Occupation:</strong> {answers.occupation}</p>
              <p><strong>Interests:</strong> {answers.hobbies.join(', ')}</p>
              <p><strong>Stress Level:</strong> {answers.stressLevel}/10</p>
              <p><strong>Social Energy:</strong> {answers.socialEnergy}/10</p>
              <p><strong>Sleep Type:</strong> {answers.sleepHabit}</p>
            </div>
            
            <button 
              onClick={() => setCompleted(false)}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Edit Profile
            </button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Your Daily Boost</h3>
            <div className="space-y-1">
              {suggestions.map((suggestion, i) => (
                <div 
                  key={i}
                  className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Question */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>
          <div className="text-sm text-gray-500">
            Question {currentStep + 1} of {QUESTIONS.length}
          </div>
        </div>
        
        {/* Bubble selection */}
        {currentQuestion.type === 'bubbles' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleBubbleSelect(currentQuestion.key, option)}
                className={`px-4 py-2 rounded-full border ${
                  answers[currentQuestion.key] === option
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300'
                } transition`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {/* Multi-select */}
        {currentQuestion.type === 'multi' && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleMultiSelect(option)}
                className={`px-4 py-2 rounded-lg text-left border flex items-center ${
                  answers.hobbies.includes(option)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300'
                } transition`}
              >
                <span className="mr-2">
                  {answers.hobbies.includes(option) ? '✓' : ''}
                </span>
                {option}
              </button>
            ))}
          </div>
        )}
        
        {/* Slider */}
        {currentQuestion.type === 'slider' && (
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              value={answers[currentQuestion.key]}
              onChange={(e) => handleSlider(currentQuestion.key, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2 font-medium">
              {answers[currentQuestion.key]}
            </div>
          </div>
        )}
        
        {/* Time Range */}
        {currentQuestion.type === 'timeRange' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Start: {answers.availability[0] % 1 === 0
                  ? `${answers.availability[0]}:00`
                  : `${Math.floor(answers.availability[0])}:30`
                }
              </span>
              <span>
                End: {answers.availability[1] % 1 === 0
                  ? `${answers.availability[1]}:00`
                  : `${Math.floor(answers.availability[1])}:30`
                }
              </span>
            </div>
            <div className="relative h-12">
              <div className="h-1 bg-gray-200 rounded-full absolute top-6 w-full" />
              <div
                className="h-1 bg-black rounded-full absolute top-6"
                style={{
                  left: `${(answers.availability[0] / 24) * 100}%`,
                  right: `${100 - (answers.availability[1] / 24) * 100}%`,
                }}
              />
              <input
                type="range"
                min={currentQuestion.min}
                max={currentQuestion.max}
                step={currentQuestion.step}
                value={answers.availability[0]}
                onChange={(e) => handleTimeRange(0, e.target.value)}
                className="absolute inset-0 w-full opacity-0 z-10 cursor-pointer"
              />
              <input
                type="range"
                min={currentQuestion.min}
                max={currentQuestion.max}
                step={currentQuestion.step}
                value={answers.availability[1]}
                onChange={(e) => handleTimeRange(1, e.target.value)}
                className="absolute inset-0 w-full opacity-0 z-20 cursor-pointer"
              />
              <div
                className="w-4 h-4 bg-black rounded-full absolute top-4 z-30"
                style={{ left: `calc(${(answers.availability[0] / 24) * 100}% - 8px)` }}
              />
              <div
                className="w-4 h-4 bg-black rounded-full absolute top-4 z-30"
                style={{ left: `calc(${(answers.availability[1] / 24) * 100}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </div>
          </div>
        )}
        
        {/* Text input */}
        {currentQuestion.type === 'text' && (
          <div className="mb-4">
            <input
              type="text"
              value={answers[currentQuestion.key]}
              onChange={(e) => handleTextInput(currentQuestion.key, e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-black hover:bg-gray-100'
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className="px-6 py-2 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 