import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getProfile } from '../lib/storage';

export default function DailySchedulePage({ profile: initialProfile }) {
  const [weather, setWeather] = useState({ desc: '', temp: 0, icon: '' });
  const [schedule, setSchedule] = useState([]); // [{ hour: 8, text: "..." }, ...]
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  // Load profile from localStorage on client side
  useEffect(() => {
    async function loadProfile() {
      const profileData = await getProfile();
      if (profileData) {
        setProfile(profileData);
      }
    }
    
    if (!profile) {
      loadProfile();
    }
  }, [profile]);

  // 1) Fetch weather on mount
  useEffect(() => {
    fetch('/api/geo')
      .then(r => r.json())
      .then(({ lat, lon }) =>
        fetch(`/api/weather?lat=${lat}&lon=${lon}`)
          .then(r => r.json())
          .then(w => setWeather(w))
      );
  }, []);

  // 2) Build your schedule when user clicks
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

  // Background image mapping by weather icon code
  const bgImage = weather.icon
    ? `url("https://openweathermap.org/img/wn/${weather.icon}@4x.png")`
    : null;

  return (
    <>
      <Head>
        <title>Today's Schedule</title>
      </Head>
      {/* Full-screen weather background */}
      <div className="min-h-screen relative">
        {/* Semi-transparent weather background */}
        {weather.icon && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: bgImage,
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </>
        )}

        {/* Centered card */}
        <div className="relative z-10 flex flex-col items-center text-white p-6">
          <div className="flex w-full justify-between mb-8 max-w-md">
            <Link href="/" className="text-white hover:text-gray-300 transition">
              ← Home
            </Link>
            <Link href="/lifestyle-quiz" className="text-white hover:text-gray-300 transition">
              Update Profile
            </Link>
          </div>
          
          <h1 className="text-4xl font-semibold mb-2">Today</h1>
          {weather.desc && (
            <p className="mb-4 text-lg">{weather.desc}, {Math.round(weather.temp)}°F</p>
          )}

          {/* Profile Summary */}
          {profile && (
            <div className="mb-6 text-center">
              <p className="text-sm opacity-75">
                {profile.ageRange} • {profile.occupation} • 
                {profile.hobbies && profile.hobbies.length > 0 && 
                 ` Interests: ${profile.hobbies.join(', ')}`}
              </p>
            </div>
          )}

          {/* Build Schedule Button */}
          <button
            onClick={buildSchedule}
            disabled={loading}
            className="mb-6 bg-white bg-opacity-20 hover:bg-opacity-30 transition px-6 py-3 rounded-full text-white"
          >
            {loading ? 'Planning…' : 'Plan My Day'}
          </button>

          {/* Hour-by-hour timeline */}
          <div className="w-full max-w-md bg-white bg-opacity-20 rounded-xl p-4 space-y-2">
            {schedule.length
              ? schedule.map(({ hour, text }) => (
                  <div key={hour} className="flex">
                    <div className="w-12 font-mono">{hour}:00</div>
                    <div className="flex-1">{text}</div>
                  </div>
                ))
              : // show placeholder hours
                Array.from({ length: 12 }).map((_, i) => {
                  const hour = i + 7; // Start at 7am
                  return (
                    <div key={hour} className="flex opacity-50">
                      <div className="w-12 font-mono">{hour}:00</div>
                      <div className="flex-1">—</div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </>
  );
}

// Get profile data from client-side storage on initial load
export async function getServerSideProps() {
  // Since we're in a server environment, we'll get null from getProfile
  // We'll load the real profile on the client side
  return {
    props: { 
      profile: null
    }
  };
} 