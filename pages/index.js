import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Onboard from '../components/Onboard';
import {
  getArchetype,
  setArchetype,
  getPlans,
  addPlan,
  getStreak,
  getPlanCountThisMonth
} from '../lib/storage';

export default function Home() {
  const [archetype, setArchState] = useState(null);
  const [form, setForm] = useState({
    stress: 5,
    caffeine: 'medium',
    alcohol: 'none',
    relationships: 'average',
  });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getArchetype().then(a => {
      if (a) {
        setArchState(a);
        getStreak().then(setStreak);
      }
    });
  }, []);

  const handleOnboard = async (a) => {
    await setArchetype(a);
    setArchState(a);
    setStreak(await getStreak());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSlider = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const generate = async () => {
    setLoading(true);
    setPlan('');
    const count = await getPlanCountThisMonth();
    if (count >= 3) {
      alert('Free limit of 3 plans/month reached. Come back next month!');
      setLoading(false);
      return;
    }
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archetype, ...form }),
    });
    const json = await res.json();
    const text = json.result || json.error || 'No response';
    setPlan(text);
    if (res.ok) {
      await addPlan(text);
      setStreak(await getStreak());
    }
    setLoading(false);
  };

  if (!archetype) {
    return <Onboard onDone={handleOnboard} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8 font-sans">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Stress-Aware Planner</h1>
            <div className="text-gray-600">
              Archetype: <span className="font-medium">{archetype}</span> — Streak: <span className="font-medium">{streak}</span> days
            </div>
          </div>
          <Link href="/quiz" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition">
            Take Deep Quiz
          </Link>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* Inputs */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div>
              <label className="block font-medium mb-1">Stress Level</label>
              <input
                type="range"
                min="0"
                max="10"
                value={form.stress}
                onChange={e => handleSlider('stress', e.target.value)}
                className="w-full"
              />
              <div className="mt-1 text-sm">Level: {form.stress}</div>
            </div>
            <div>
              <label className="block font-medium mb-1">Caffeine</label>
              <select
                name="caffeine"
                value={form.caffeine}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>none</option>
                <option>low</option>
                <option>medium</option>
                <option>high</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Alcohol/Drugs</label>
              <select
                name="alcohol"
                value={form.alcohol}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>none</option>
                <option>occasional</option>
                <option>regular</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Relationships</label>
              <select
                name="relationships"
                value={form.relationships}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option>weak</option>
                <option>average</option>
                <option>strong</option>
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg text-lg hover:bg-gray-800 transition"
          >
            {loading ? 'Generating…' : 'Generate Steps'}
          </button>

          {plan && (
            <div className="bg-white p-6 rounded-2xl border shadow-sm prose">
              <h2 className="text-2xl font-semibold mb-4">Your Steps</h2>
              <ol className="list-decimal list-inside space-y-2">
                {plan.split('\n').map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
