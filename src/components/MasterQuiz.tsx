import React, { useState } from 'react';

interface UserProfile {
  name: string;
  dateOfBirth: string;
  location: string;
  musicService: 'spotify' | 'appleMusic';
}

interface MasterQuizProps {
  onComplete: (profile: UserProfile) => void;
}

const MasterQuiz: React.FC<MasterQuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    dateOfBirth: '',
    location: '',
    musicService: 'spotify'
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.name.length >= 2;
      case 2:
        return profile.dateOfBirth !== '';
      case 3:
        return profile.location.length >= 2;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full ${
                  num <= step ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-semibold mb-4">Welcome to Your Life Planner</h2>
          
          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700">What's your name?</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  placeholder="Enter your name"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700">When were you born?</span>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700">Where are you located?</span>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  placeholder="Enter your city"
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <span className="text-gray-700 block mb-2">Which music service do you use?</span>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={profile.musicService === 'spotify'}
                    onChange={() => setProfile({ ...profile, musicService: 'spotify' })}
                    className="text-black focus:ring-black"
                  />
                  <span>Spotify</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={profile.musicService === 'appleMusic'}
                    onChange={() => setProfile({ ...profile, musicService: 'appleMusic' })}
                    className="text-black focus:ring-black"
                  />
                  <span>Apple Music</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`w-full py-2 px-4 rounded-md ${
            isStepValid()
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 4 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default MasterQuiz; 