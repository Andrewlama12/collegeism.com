import { useState } from 'react';
import Onboard from './Onboard';

export default function MainPlannerSection({ profile, archetype, onArchetypeUpdate, onPlanSave }) {
  // Form state for the plan generator
  const [form, setForm] = useState({
    stress: 5,
    caffeine: 'medium',
    alcohol: 'none',
    relationships: 'average',
  });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

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
    
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archetype, ...form }),
    });
    
    const json = await res.json();
    const text = json.result || json.error || 'No response';
    setPlan(text);
    
    if (res.ok) {
      await onPlanSave(text);
    }
    
    setLoading(false);
  };

  // If no archetype yet, show the onboarding flow
  if (!archetype) {
    return <Onboard onDone={onArchetypeUpdate} />;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
  );
} 