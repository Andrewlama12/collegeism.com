import React, { useEffect, useState } from 'react';
import WeatherChannel from './channels/WeatherChannel';
import NewsChannel from './channels/NewsChannel';
import SongChannel from './channels/SongChannel';
import MasterQuiz from './components/MasterQuiz';
import { getProfile, saveProfile, Profile } from './profileStore';

const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const savedProfile = getProfile();
    setProfile(savedProfile);
  }, []);

  const handleQuizComplete = (newProfile: Omit<Profile, 'hasCompletedMasterQuiz'>) => {
    const completeProfile: Profile = {
      ...newProfile,
      hasCompletedMasterQuiz: true
    };
    saveProfile(completeProfile);
    setProfile(completeProfile);
  };

  if (!profile?.hasCompletedMasterQuiz) {
    return <MasterQuiz onComplete={handleQuizComplete} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Welcome, {profile.name}</h1>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side channels */}
          <div className="lg:col-span-3 space-y-6">
            <WeatherChannel userLocation={profile.location} />
            <NewsChannel />
          </div>

          {/* Center content - Quizzes */}
          <div className="lg:col-span-6 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Daily Questions</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">How are you feeling today?</h3>
                <div className="flex gap-2">
                  {['😊', '😐', '😔', '😤'].map((emoji) => (
                    <button
                      key={emoji}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">What's your main focus for today?</h3>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-200 rounded-md focus:border-black focus:ring-black"
                  placeholder="Enter your main goal..."
                />
              </div>
            </div>
          </div>

          {/* Right side channels */}
          <div className="lg:col-span-3 space-y-6">
            <SongChannel userMusicService={profile.musicService} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
