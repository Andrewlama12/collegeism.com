import React, { useEffect, useState } from 'react';
import { NewsChannel } from './components/NewsChannel';
import { SongChannel } from './components/SongChannel';
import { DailyQuestions } from './components/DailyQuestions';
import MasterQuiz from './components/MasterQuiz';
import { getProfile, saveProfile } from './profileStore';
import type { Profile } from './types/profile';

const App: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const savedProfile = getProfile();
    setProfile(savedProfile);
  }, []);

  const handleQuizComplete = (newProfile: Profile) => {
    const completeProfile = {
      ...newProfile,
      onboardingComplete: true,
      completedQuestions: [],
      categoryQueue: []
    };
    saveProfile(completeProfile);
    setProfile(completeProfile);
  };

  if (!profile?.onboardingComplete) {
    return <MasterQuiz onComplete={handleQuizComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Welcome, {profile.name}</h1>
      </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side - News */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold">News For You</h2>
              </div>
              <NewsChannel />
            </div>
          </div>

          {/* Center content - Daily Questions */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold">Daily Questions</h2>
              </div>
              <DailyQuestions onComplete={() => console.log('Questions completed')} />
            </div>
          </div>

          {/* Right side - Music */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold">Music For You</h2>
              </div>
              <SongChannel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
