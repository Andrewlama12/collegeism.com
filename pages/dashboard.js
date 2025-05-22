import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  getArchetype, 
  getStreak, 
  getProfile, 
  saveProfile, 
  addPlan 
} from '../lib/storage';

// Import necessary components
import StressQuizSection from '../components/StressQuizSection';
import LifestyleQuizSection from '../components/LifestyleQuizSection';
import DailyScheduleSection from '../components/DailyScheduleSection';
import MainPlannerSection from '../components/MainPlannerSection';

export default function Dashboard() {
  // State for user data
  const [archetype, setArchetype] = useState(null);
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(0);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('planner');
  
  // Weather state
  const [weather, setWeather] = useState({ desc: '', temp: 0, icon: '' });
  
  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      const userArchetype = await getArchetype();
      const userProfile = await getProfile();
      const userStreak = await getStreak();
      
      if (userArchetype) setArchetype(userArchetype);
      if (userProfile) setProfile(userProfile);
      setStreak(userStreak);
    }
    
    loadUserData();
  }, []);
  
  // Fetch weather data on mount
  useEffect(() => {
    fetch('/api/geo')
      .then(r => r.json())
      .then(({ lat, lon, city }) => {
        // Store city info
        setWeather(w => ({ ...w, city }));
        
        // Fetch actual weather data
        return fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      })
      .then(r => r.json())
      .then(weatherData => setWeather(w => ({ ...w, ...weatherData })));
  }, []);
  
  // Handler for saving profile data
  const handleProfileUpdate = async (newProfile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  };
  
  // Handler for saving archetype
  const handleArchetypeUpdate = async (newArchetype) => {
    await setArchetype(newArchetype);
    setArchetype(newArchetype);
  };
  
  // Handler for adding a plan
  const handlePlanSave = async (planText) => {
    await addPlan(planText);
    setStreak(await getStreak());
  };
  
  return (
    <>
      <Head>
        <title>AI Life Planner Dashboard</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Background image based on weather */}
        {weather.icon && (
          <div 
            className="fixed inset-0 bg-cover bg-center opacity-5"
            style={{
              backgroundImage: `url("https://openweathermap.org/img/wn/${weather.icon}@4x.png")`,
              backgroundSize: '200px',
              backgroundRepeat: 'repeat'
            }}
          />
        )}
        
        {/* Header with weather and stats */}
        <header className="bg-gradient-to-r from-gray-800 to-black text-white p-4 shadow-md relative z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">AI Life Planner</h1>
              <div className="text-sm opacity-75">
                {archetype && <span>Archetype: {archetype} • </span>}
                <span>Streak: {streak} days</span>
              </div>
            </div>
            
            {weather.desc && (
              <div className="text-right">
                <div className="text-lg">{weather.city || 'Your Location'}</div>
                <div className="text-sm opacity-75">
                  {weather.desc}, {Math.round(weather.temp)}°F
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Tab Navigation */}
        <nav className="bg-white border-b shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex space-x-1">
            <button 
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'planner' 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Daily Planner
            </button>
            <button 
              onClick={() => setActiveTab('stress')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'stress' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Stress Assessment
            </button>
            <button 
              onClick={() => setActiveTab('lifestyle')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'lifestyle' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Lifestyle Quiz
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'schedule' 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Today's Schedule
            </button>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto p-4 md:p-6 relative z-10">
          {/* Stress Quiz Section */}
          {activeTab === 'stress' && (
            <StressQuizSection 
              onComplete={(results) => {
                // Handle stress quiz results
                console.log('Stress results:', results);
              }}
            />
          )}
          
          {/* Lifestyle Quiz Section */}
          {activeTab === 'lifestyle' && (
            <LifestyleQuizSection 
              initialProfile={profile}
              onComplete={handleProfileUpdate}
            />
          )}
          
          {/* Daily Schedule Section */}
          {activeTab === 'schedule' && (
            <DailyScheduleSection 
              profile={profile}
              weather={weather}
            />
          )}
          
          {/* Main Planner Section */}
          {activeTab === 'planner' && (
            <MainPlannerSection 
              profile={profile}
              archetype={archetype} 
              onArchetypeUpdate={handleArchetypeUpdate}
              onPlanSave={handlePlanSave}
            />
          )}
        </main>
      </div>
    </>
  );
} 