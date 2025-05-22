import { useState, useEffect } from 'react';

export default function DailyScheduleSection({ profile, weather }) {
  const [schedule, setSchedule] = useState([]); // [{ hour: 8, text: "..." }, ...]
  const [loading, setLoading] = useState(false);

  // Build your schedule when user clicks
  const buildSchedule = async () => {
    setLoading(true);
    const res = await fetch('/api/daily-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, weather }),
    });
    const { plan } = await res.json();
    // assume plan is an array of { hour, text }
    setSchedule(plan);
    setLoading(false);
  };

  // Clear schedule
  const clearSchedule = () => {
    setSchedule([]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Weather Summary */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex justify-between items-center"
        >
          <div>
            <h2 className="text-2xl font-semibold">Today's Schedule</h2>
            {weather.desc && (
              <p className="text-sm opacity-90">
                {weather.desc}, {Math.round(weather.temp)}°F
              </p>
            )}
          </div>
          
          {weather.icon && (
            <div 
              className="w-16 h-16 bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("https://openweathermap.org/img/wn/${weather.icon}@4x.png")`,
              }}
            />
          )}
        </div>
        
        {/* Profile Summary */}
        {profile && (
          <div className="px-4 py-3 border-b text-sm text-gray-600">
            <span className="font-medium">Profile:</span> {profile.ageRange} • {profile.occupation}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <> • Interests: {profile.hobbies.join(', ')}</>
            )}
          </div>
        )}
        
        {/* Schedule Actions */}
        <div className="p-4 flex space-x-2">
          <button
            onClick={buildSchedule}
            disabled={loading || !profile}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex-1 disabled:opacity-50"
          >
            {loading ? 'Planning…' : 'Generate Schedule'}
          </button>
          
          {schedule.length > 0 && (
            <button
              onClick={clearSchedule}
              className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Hour-by-hour timeline */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="font-medium">Daily Timeline</h3>
        </div>
        
        <div className="divide-y">
          {schedule.length
            ? schedule.map(({ hour, text }) => (
                <div key={hour} className="flex p-3 hover:bg-gray-50">
                  <div className="w-16 font-mono text-orange-600 font-medium">{hour}:00</div>
                  <div className="flex-1">{text}</div>
                </div>
              ))
            : // show placeholder hours
              Array.from({ length: 10 }).map((_, i) => {
                const hour = i + 8; // Start at 8am
                return (
                  <div key={hour} className="flex p-3 text-gray-400">
                    <div className="w-16 font-mono">{hour}:00</div>
                    <div className="flex-1 italic">No activities scheduled</div>
                  </div>
                );
              })}
        </div>
      </div>
      
      {/* Help text if no profile */}
      {!profile && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <p>Please complete the Lifestyle Quiz first to generate a personalized schedule.</p>
        </div>
      )}
    </div>
  );
} 