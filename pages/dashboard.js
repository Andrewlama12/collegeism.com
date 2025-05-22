import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  getProfile, 
  saveProfile 
} from '../lib/storage';
import EfficientQuestionnaire from '../components/EfficientQuestionnaire';

export default function Dashboard() {
  // State for user data
  const [profile, setProfile] = useState(null);
  
  // Weather state
  const [weather, setWeather] = useState({ city: 'New York', desc: 'Partly Cloudy', temp: 72, icon: '01d' });
  
  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      const userProfile = await getProfile();
      if (userProfile) setProfile(userProfile);
    }
    
    loadUserData();
  }, []);
  
  // Fetch weather data on mount (keeping for use in questionnaire)
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
      .then(weatherData => setWeather(w => ({ ...w, ...weatherData })))
      .catch(err => console.log('Using demo weather data'));
  }, []);
  
  // Handler for saving profile data
  const handleProfileUpdate = async (newProfile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  };
  
  return (
    <div className="min-h-screen bg-sky-100 font-sans flex items-center justify-center p-4">
      <Head>
        <title>AI Life Planner</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden max-w-5xl w-full">
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Let's get to know you</h1>
          </div>
          
          <EfficientQuestionnaire 
            initialProfile={profile}
            onComplete={handleProfileUpdate}
            weather={weather}
          />
        </div>
      </div>
    </div>
  );
} 