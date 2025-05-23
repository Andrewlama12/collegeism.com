import React, { useEffect, useState } from 'react';
import { getProfile } from '../profileStore';
import type { Profile } from '../profileStore';

interface PlanItem {
  time: string;
  activity: string;
  category: 'work' | 'break' | 'personal';
}

const PlanChannel: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyPlan, setDailyPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userProfile = getProfile();
    setProfile(userProfile);
    
    // Generate a daily plan based on profile data
    const generatePlan = () => {
      const plans: PlanItem[] = [];
      
      // Morning routine
      const coffeePreference = userProfile['coffeePreference'];
      if (coffeePreference && coffeePreference !== "I don't drink") {
        plans.push({
          time: '8:00 AM',
          activity: `Morning ${coffeePreference} coffee`,
          category: 'personal'
        });
      }

      // Work/Study schedule based on context
      const todayContext = userProfile['todayContext'];
      const workType = userProfile['workType'];
      if (todayContext === 'Work' || todayContext === 'Busy') {
        plans.push(
          {
            time: '9:00 AM',
            activity: `Start ${workType || 'work'} session`,
            category: 'work'
          },
          {
            time: '11:00 AM',
            activity: 'Quick break - stretch and hydrate',
            category: 'break'
          },
          {
            time: '11:15 AM',
            activity: 'Continue work session',
            category: 'work'
          }
        );
      } else {
        plans.push({
          time: '9:00 AM',
          activity: 'Free time for personal activities',
          category: 'personal'
        });
      }

      // Afternoon activities
      plans.push(
        {
          time: '12:30 PM',
          activity: 'Lunch break',
          category: 'break'
        },
        {
          time: '1:30 PM',
          activity: todayContext === 'Lazy' ? 'Relaxation time' : 'Afternoon tasks',
          category: todayContext === 'Lazy' ? 'break' : 'work'
        }
      );

      setDailyPlan(plans);
      setLoading(false);
    };

    generatePlan();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Daily Plan</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : !profile?.onboardingComplete ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Please complete the onboarding quiz to get your personalized plan!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dailyPlan.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow ${
                item.category === 'work'
                  ? 'bg-blue-50'
                  : item.category === 'break'
                  ? 'bg-green-50'
                  : 'bg-purple-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{item.time}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  item.category === 'work'
                    ? 'bg-blue-100 text-blue-800'
                    : item.category === 'break'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{item.activity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanChannel; 