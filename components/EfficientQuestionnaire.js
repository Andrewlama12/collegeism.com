import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Stagger child animations
const containerVariants = {
  animate: {
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
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
  const [suggestedHobbies, setSuggestedHobbies] = useState([]);
  const [paceLabels, setPaceLabels] = useState([]);
  const [ritualOptions, setRitualOptions] = useState([]);
  
  // Load suggestions when hobbies change
  useEffect(() => {
    // Only fetch if we have at least one hobby and we're on the hobby step
    if (hobbies.length > 0 && currentStep === STEPS.HOBBIES) {
      fetchSimilarHobbies();
    }
  }, [hobbies, currentStep]);

  // Function to fetch similar hobby suggestions
  const fetchSimilarHobbies = async () => {
    try {
      const response = await fetch('/api/openai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: 'similar-hobbies',
          data: { 
            ageRange,
            context, 
            currentHobbies: hobbies 
          }
        })
      });
      
      const data = await response.json();
      if (data.options) {
        setSuggestedHobbies(data.options);
      }
    } catch (error) {
      console.error('Error fetching similar hobbies:', error);
    }
  };

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
  
  // Loading indicator component for inline loading
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Birthday Picker */}
        {currentStep === STEPS.BIRTHDAY && (
          <motion.div
            key="birthday"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
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
              className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50 relative"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </motion.div>
        )}
        
        {/* Step 2: Life Context Selection */}
        {currentStep === STEPS.LIFE_CONTEXT && (
          <motion.div
            key="life-context"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Which best describes you?</h2>
            
            {loading ? (
              <LoadingIndicator />
            ) : (
              <motion.div 
                className="grid grid-cols-2 gap-3 mb-6"
                variants={containerVariants}
              >
                {lifeStageOptions.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleContextSelect(option)}
                    className="p-3 border rounded-lg text-center hover:bg-gray-50 transition"
                    variants={itemVariants}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Step 3: Hobby Selection */}
        {currentStep === STEPS.HOBBIES && (
          <motion.div
            key="hobbies"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-2">Your interests</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Select up to 2 that speak to you
            </p>
            
            {loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <motion.div 
                  className="grid grid-cols-2 gap-3 mb-6"
                  variants={containerVariants}
                >
                  {hobbyOptions.map((option, index) => (
                    <motion.button
                      key={`main-${index}`}
                      onClick={() => handleHobbySelect(option.label)}
                      className={`p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition ${
                        hobbies.includes(option.label) ? 'bg-black text-white border-black' : ''
                      }`}
                      variants={itemVariants}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="text-2xl mb-1">{option.icon}</span>
                      <span>{option.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
                
                {/* Suggested hobbies based on selections */}
                {hobbies.length > 0 && suggestedHobbies.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">You might also like:</h3>
                    <motion.div 
                      className="flex flex-wrap gap-2 mb-6"
                      variants={containerVariants}
                    >
                      {suggestedHobbies.map((option, index) => (
                        <motion.button
                          key={`suggestion-${index}`}
                          onClick={() => handleHobbySelect(option.label)}
                          className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 transition ${
                            hobbies.includes(option.label) ? 'bg-black text-white border-black' : ''
                          }`}
                          variants={itemVariants}
                          transition={{ duration: 0.2 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <span className="mr-1">{option.icon}</span>
                          <span>{option.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                )}
                
                <button
                  onClick={handleHobbiesSubmit}
                  disabled={hobbies.length === 0 || loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  Continue
                </button>
              </>
            )}
          </motion.div>
        )}
        
        {/* Step 4: Pace Selection */}
        {currentStep === STEPS.PACE && (
          <motion.div
            key="pace"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Your ideal pace</h2>
            <p className="text-gray-600 mb-6 text-sm">
              How would you describe your preferred lifestyle?
            </p>
            
            {loading ? (
              <LoadingIndicator />
            ) : (
              <motion.div 
                className="space-y-3 mb-6"
                variants={containerVariants}
              >
                {paceLabels.map((option) => (
                  <motion.button
                    key={option.code}
                    onClick={() => handlePaceSelect(option.code)}
                    className={`w-full p-4 border rounded-lg text-left ${
                      paceLevel === option.code ? 'bg-black text-white border-black' : ''
                    }`}
                    variants={itemVariants}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Step 5: Evening Rituals */}
        {currentStep === STEPS.EVENING_RITUALS && (
          <motion.div
            key="rituals"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-2">Evening rituals</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Select the habits you typically do before bed
            </p>
            
            {loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <motion.div 
                  className="grid grid-cols-3 gap-3 mb-6"
                  variants={containerVariants}
                >
                  {ritualOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleRitualSelect(option.label)}
                      className={`p-4 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition ${
                        eveningHabits.includes(option.label) ? 'bg-black text-white border-black' : ''
                      }`}
                      variants={itemVariants}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="text-2xl mb-1">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
                
                <button
                  onClick={handleGeneratePlan}
                  disabled={eveningHabits.length === 0 || loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center">
                      <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Creating your plan...
                    </span>
                  ) : (
                    'Get your plan'
                  )}
                </button>
              </>
            )}
          </motion.div>
        )}
        
        {/* Step 6: Plan Reveal */}
        {currentStep === STEPS.PLAN && (
          <motion.div
            key="plan"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-2">Your Personal Plan</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Three simple steps for today, tap to expand
            </p>
            
            <motion.div 
              className="space-y-3 mb-6"
              variants={containerVariants}
            >
              {plan.map((step, index) => (
                <motion.div 
                  key={index}
                  onClick={() => toggleStepExpansion(index)}
                  className="border rounded-lg overflow-hidden cursor-pointer"
                  variants={itemVariants}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="p-4 bg-gray-50 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <div>{step.step}</div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedStep === index && (
                      <motion.div 
                        className="p-4 border-t bg-white"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-gray-600">{step.detail}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
            
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
                disabled={!location || loading}
                className="bg-green-500 text-white p-3 rounded-lg font-medium disabled:opacity-50"
              >
                🥳 Next
              </button>
              <button 
                onClick={handleRemixPlan}
                disabled={loading}
                className="bg-blue-500 text-white p-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  </span>
                ) : (
                  '🔄 Remix plan'
                )}
              </button>
              <button className="bg-orange-400 text-white p-3 rounded-lg font-medium">
                ⏰ Reminder
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Step 7: Weather Display */}
        {currentStep === STEPS.WEATHER && (
          <motion.div
            key="weather"
            className="bg-white p-6 rounded-xl shadow"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-2">Weather in {location}</h2>
            
            {!weatherData ? (
              <>
                <p className="text-gray-600 mb-4">
                  Let's check the weather for your area
                </p>
                
                <button
                  onClick={fetchWeatherData}
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium mb-4 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center">
                      <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Fetching weather...
                    </span>
                  ) : (
                    'Check Weather'
                  )}
                </button>
              </>
            ) : (
              <motion.div 
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-center mb-2">
                  <motion.img 
                    src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                    alt={weatherData.desc}
                    className="w-24 h-24"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                </div>
                <motion.div 
                  className="text-4xl font-bold mb-1"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {Math.round(weatherData.temp)}°F
                </motion.div>
                <motion.div 
                  className="text-lg text-gray-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {weatherData.desc}
                </motion.div>
                
                <motion.div 
                  className="mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-600 mb-2">
                    Consider this in your daily planning:
                  </p>
                  <p className="text-sm text-gray-800">
                    {weatherData.temp > 85 ? '☀️ Stay hydrated and avoid outdoor activities during peak sun' : 
                     weatherData.temp < 50 ? '❄️ Dress in layers and stay warm today' :
                     '👌 Perfect weather for your planned activities'}
                  </p>
                </motion.div>
                
                <motion.button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Go to Dashboard
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 