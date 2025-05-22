import { useState, useEffect } from 'react';

// Steps in the questionnaire flow
const STEPS = {
  BIRTHDAY: 0,
  LIFE_CONTEXT: 1,
  HOBBIES: 2,
  PACE: 3,
  EVENING_RITUALS: 4,
  PLAN: 5,
  WEATHER: 6
};

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
  // Main questionnaire state
  const [currentStep, setCurrentStep] = useState(STEPS.BIRTHDAY);
  const [loading, setLoading] = useState(false);
  
  // User data state
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(null);
  const [ageRange, setAgeRange] = useState(null);
  const [context, setContext] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [paceLevel, setPaceLevel] = useState(null);
  const [eveningHabits, setEveningHabits] = useState([]);
  const [plan, setPlan] = useState([]);
  const [expandedStep, setExpandedStep] = useState(null);
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  
  // Dynamic options from OpenAI
  const [lifeStageOptions, setLifeStageOptions] = useState([]);
  const [hobbyOptions, setHobbyOptions] = useState([]);
  const [paceLabels, setPaceLabels] = useState([]);
  const [ritualOptions, setRitualOptions] = useState([]);

  // Calculate age and age range from DOB
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAgeRange = (age) => {
    if (age < 18) return "under-18";
    if (age < 25) return "18-24";
    if (age < 35) return "25-34";
    if (age < 45) return "35-44";
    if (age < 55) return "45-54";
    return "55+";
  };

  // Handle birthday selection
  const handleBirthdaySubmit = async () => {
    if (!dob) return;
    
    setLoading(true);
    const calculatedAge = calculateAge(dob);
    setAge(calculatedAge);
    const calculatedAgeRange = getAgeRange(calculatedAge);
    setAgeRange(calculatedAgeRange);
    
    try {
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'life-stages',
          data: { ageRange: calculatedAgeRange }
        })
      });
      
      const data = await response.json();
      setLifeStageOptions(data.options || []);
      setCurrentStep(STEPS.LIFE_CONTEXT);
    } catch (error) {
      console.error('Error fetching life stages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle life context selection
  const handleContextSelect = async (selectedContext) => {
    setContext(selectedContext);
    setLoading(true);
    
    try {
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'hobby-options',
          data: { ageRange, context: selectedContext }
        })
      });
      
      const data = await response.json();
      setHobbyOptions(data.options || []);
      setCurrentStep(STEPS.HOBBIES);
    } catch (error) {
      console.error('Error fetching hobby options:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle hobby selection
  const handleHobbySelect = (hobby) => {
    setHobbies(prev => {
      // If already selected, remove it
      if (prev.includes(hobby)) {
        return prev.filter(h => h !== hobby);
      }
      
      // If 2 already selected, replace the first one
      if (prev.length >= 2) {
        return [prev[1], hobby];
      }
      
      // Otherwise add it
      return [...prev, hobby];
    });
  };
  
  // Proceed to pace options after hobby selection
  const handleHobbiesSubmit = async () => {
    if (hobbies.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'pace-labels',
          data: { ageRange, context, hobbies }
        })
      });
      
      const data = await response.json();
      setPaceLabels(data.options || []);
      setCurrentStep(STEPS.PACE);
    } catch (error) {
      console.error('Error fetching pace options:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pace selection
  const handlePaceSelect = async (level) => {
    setPaceLevel(level);
    setLoading(true);
    
    try {
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'ritual-options',
          data: { ageRange, context, hobbies, paceLevel: level }
        })
      });
      
      const data = await response.json();
      setRitualOptions(data.options || []);
      setCurrentStep(STEPS.EVENING_RITUALS);
    } catch (error) {
      console.error('Error fetching ritual options:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle evening ritual selection
  const handleRitualSelect = (ritual) => {
    setEveningHabits(prev => {
      if (prev.includes(ritual)) {
        return prev.filter(r => r !== ritual);
      }
      return [...prev, ritual];
    });
  };
  
  // Generate the final plan
  const handleGeneratePlan = async () => {
    if (eveningHabits.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'daily-plan',
          data: { 
            age, 
            ageRange, 
            context, 
            hobbies, 
            paceLevel, 
            eveningHabits 
          }
        })
      });
      
      const data = await response.json();
      setPlan(data.plan || []);
      
      // Save profile if callback provided
      if (onComplete) {
        const profile = {
          dob,
          age,
          ageRange,
          context,
          hobbies,
          paceLevel,
          eveningHabits
        };
        
        await onComplete(profile);
      }
      
      setCurrentStep(STEPS.PLAN);
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle plan step expansion
  const toggleStepExpansion = (index) => {
    if (expandedStep === index) {
      setExpandedStep(null);
    } else {
      setExpandedStep(index);
    }
  };
  
  // Proceed to weather screen after plan
  const handleProceedToWeather = () => {
    setCurrentStep(STEPS.WEATHER);
  };
  
  // Fetch weather data from API
  const fetchWeatherData = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      // First, get coordinates from the location
      const geoResponse = await fetch(`/api/geo?location=${encodeURIComponent(location)}`);
      if (!geoResponse.ok) {
        throw new Error('Failed to geocode location');
      }
      
      const geoData = await geoResponse.json();
      
      // Then fetch weather data using coordinates
      const weatherResponse = await fetch(`/api/weather?lat=${geoData.lat}&lon=${geoData.lon}`);
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await weatherResponse.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Remix the plan
  const handleRemixPlan = async () => {
    setLoading(true);
    try {
      // Add a small randomness parameter to get different results
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'daily-plan',
          data: { 
            age, 
            ageRange, 
            context, 
            hobbies, 
            paceLevel, 
            eveningHabits,
            remix: Math.random() // Add randomness
          }
        })
      });
      
      const data = await response.json();
      setPlan(data.plan || []);
    } catch (error) {
      console.error('Error remixing plan:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-pulse text-center">
              <div className="text-lg font-medium">Thinking...</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 1: Birthday Picker */}
      {currentStep === STEPS.BIRTHDAY && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Your birth date</h2>
          <p className="text-gray-600 mb-6 text-sm">
            This helps us personalize your experience
          </p>
          
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-black focus:outline-none"
          />
          
          <button
            onClick={handleBirthdaySubmit}
            disabled={!dob || loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}
      
      {/* Step 2: Life Context Selection */}
      {currentStep === STEPS.LIFE_CONTEXT && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Which best describes you?</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {lifeStageOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleContextSelect(option)}
                className="p-3 border rounded-lg text-center hover:bg-gray-50 transition"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 3: Hobby Selection */}
      {currentStep === STEPS.HOBBIES && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Your interests</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Select up to 2 that speak to you
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {hobbyOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleHobbySelect(option.label)}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition ${
                  hobbies.includes(option.label) ? 'bg-black text-white border-black' : ''
                }`}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleHobbiesSubmit}
            disabled={hobbies.length === 0 || loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}
      
      {/* Step 4: Pace Selection */}
      {currentStep === STEPS.PACE && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Your ideal pace</h2>
          <p className="text-gray-600 mb-6 text-sm">
            How would you describe your preferred lifestyle?
          </p>
          
          <div className="space-y-3 mb-6">
            {paceLabels.map((option) => (
              <button
                key={option.code}
                onClick={() => handlePaceSelect(option.code)}
                className={`w-full p-4 border rounded-lg text-left ${
                  paceLevel === option.code ? 'bg-black text-white border-black' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 5: Evening Rituals */}
      {currentStep === STEPS.EVENING_RITUALS && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Evening rituals</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Select the habits you typically do before bed
          </p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {ritualOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleRitualSelect(option.label)}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition ${
                  eveningHabits.includes(option.label) ? 'bg-black text-white border-black' : ''
                }`}
              >
                <span className="text-2xl mb-1">{option.icon}</span>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleGeneratePlan}
            disabled={eveningHabits.length === 0 || loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            Get your plan
          </button>
        </div>
      )}
      
      {/* Step 6: Plan Reveal */}
      {currentStep === STEPS.PLAN && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Your Personal Plan</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Three simple steps for today, tap to expand
          </p>
          
          <div className="space-y-3 mb-6">
            {plan.map((step, index) => (
              <div 
                key={index}
                onClick={() => toggleStepExpansion(index)}
                className="border rounded-lg overflow-hidden cursor-pointer"
              >
                <div className="p-4 bg-gray-50 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <div>{step.step}</div>
                </div>
                
                {expandedStep === index && (
                  <div className="p-4 border-t bg-white">
                    <p className="text-gray-600">{step.detail}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Location input for weather */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Where are you located?
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your city"
              className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={handleProceedToWeather}
              disabled={!location}
              className="bg-green-500 text-white p-3 rounded-lg font-medium disabled:opacity-50"
            >
              🥳 Next
            </button>
            <button 
              onClick={handleRemixPlan}
              className="bg-blue-500 text-white p-3 rounded-lg font-medium"
            >
              🔄 Remix plan
            </button>
            <button className="bg-orange-400 text-white p-3 rounded-lg font-medium">
              ⏰ Reminder
            </button>
          </div>
        </div>
      )}
      
      {/* Step 7: Weather Display */}
      {currentStep === STEPS.WEATHER && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Weather in {location}</h2>
          
          {!weatherData ? (
            <>
              <p className="text-gray-600 mb-4">
                Let's check the weather for your area
              </p>
              
              <button
                onClick={fetchWeatherData}
                className="w-full bg-black text-white py-3 rounded-lg font-medium mb-4"
              >
                Check Weather
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-2">
                <img 
                  src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                  alt={weatherData.desc}
                  className="w-24 h-24"
                />
              </div>
              <div className="text-4xl font-bold mb-1">{Math.round(weatherData.temp)}°F</div>
              <div className="text-lg text-gray-700">{weatherData.desc}</div>
              
              <div className="mt-6">
                <p className="text-gray-600 mb-2">
                  Consider this in your daily planning:
                </p>
                <p className="text-sm text-gray-800">
                  {weatherData.temp > 85 ? '☀️ Stay hydrated and avoid outdoor activities during peak sun' : 
                   weatherData.temp < 50 ? '❄️ Dress in layers and stay warm today' :
                   '👌 Perfect weather for your planned activities'}
                </p>
              </div>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-black text-white py-3 rounded-lg font-medium mt-6"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 