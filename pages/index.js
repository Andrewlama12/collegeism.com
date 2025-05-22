import { useState } from 'react';
import Head from 'next/head';

export default function LifePlannerForm() {
  const [form, setForm] = useState({
    age: '',
    time: 1,
    stressors: [],
    goal: '',
    income: 1000,
    living: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updated = checked
      ? [...form.stressors, value]
      : form.stressors.filter((s) => s !== value);
    setForm({ ...form, stressors: updated });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResponse(data.result || data.error || 'No response received');
    } catch (err) {
      setResponse('Error submitting form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gray-50 px-6 py-12 font-[Montserrat] text-gray-800">
        <div className="max-w-3xl mx-auto text-lg space-y-8">
          <h1 className="text-4xl font-semibold mb-6">AI Life Planner</h1>

          {/* AGE */}
          <div>
            <label className="block mb-2 font-semibold">Your Age Range</label>
            <select name="age" value={form.age} onChange={handleChange} className="w-full p-3 rounded-md border">
              <option value="">Select</option>
              <option value="18–22">18–22</option>
              <option value="23–30">23–30</option>
              <option value="31–40">31–40</option>
              <option value="41–55">41–55</option>
              <option value="56+">56+</option>
            </select>
          </div>

          {/* TIME SLIDER */}
          <div>
            <label className="block mb-2 font-semibold">Hours Free per Day</label>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={form.time}
              onChange={(e) => handleSliderChange('time', e.target.value)}
              className="w-full"
            />
            <div className="text-sm mt-1">~ {form.time} hour(s) daily</div>
          </div>

          {/* STRESSORS */}
          <div>
            <label className="block mb-2 font-semibold">Top Stressors</label>
            <div className="grid grid-cols-2 gap-2">
              {['money', 'school', 'job', 'relationships', 'mental health', 'body'].map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={s}
                    checked={form.stressors.includes(s)}
                    onChange={handleCheckboxChange}
                    className="accent-gray-700"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* GOAL */}
          <div>
            <label className="block mb-2 font-semibold">Main Life Goal</label>
            <select name="goal" value={form.goal} onChange={handleChange} className="w-full p-3 rounded-md border">
              <option value="">Select</option>
              <option value="clarity">Clarity</option>
              <option value="routine">Routine</option>
              <option value="productivity">Productivity</option>
              <option value="confidence">Confidence</option>
              <option value="peace">Peace</option>
            </select>
          </div>

          {/* INCOME SLIDER */}
          <div>
            <label className="block mb-2 font-semibold">Monthly Income</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={form.income}
              onChange={(e) => handleSliderChange('income', e.target.value)}
              className="w-full"
            />
            <div className="text-sm mt-1">~ ${form.income}/mo</div>
          </div>

          {/* LIVING */}
          <div>
            <label className="block mb-2 font-semibold">Living Situation</label>
            <select name="living" value={form.living} onChange={handleChange} className="w-full p-3 rounded-md border">
              <option value="">Select</option>
              <option value="alone">Alone</option>
              <option value="parents">With parents</option>
              <option value="partner">With partner</option>
              <option value="roommates">With roommates</option>
            </select>
          </div>

          {/* LOCATION */}
          <div>
            <label className="block mb-2 font-semibold">Location Type</label>
            <select name="location" value={form.location} onChange={handleChange} className="w-full p-3 rounded-md border">
              <option value="">Select</option>
              <option value="city">City</option>
              <option value="suburb">Suburb</option>
              <option value="rural">Rural</option>
            </select>
          </div>

          {/* SUBMIT */}
          <div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md text-xl hover:bg-gray-800 transition"
            >
              {loading ? 'Generating...' : 'Generate My Plan'}
            </button>
          </div>

          {/* RESPONSE */}
          {response && (
            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
