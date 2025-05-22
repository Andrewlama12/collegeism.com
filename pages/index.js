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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-[#f3f5f8] flex items-center justify-center font-[Inter] text-black">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          {/* Form Card */}
          <div className="col-span-2 bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">AI Life Planner</h1>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 bg-black text-white rounded-full text-base font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Generating...' : 'Generate Plan'}
                </button>
              </div>
              <div className="space-y-6">
                {/* AGE */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Age Range</label>
                  <select 
                    name="age" 
                    value={form.age} 
                    onChange={handleChange} 
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200"
                  >
                    <option value="">Select your age range</option>
                    <option value="18–22">18–22</option>
                    <option value="23–30">23–30</option>
                    <option value="31–40">31–40</option>
                    <option value="41–55">41–55</option>
                    <option value="56+">56+</option>
                  </select>
                </div>
                {/* TIME SLIDER */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Hours Free per Day</label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      value={form.time}
                      onChange={(e) => handleSliderChange('time', e.target.value)}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="text-sm mt-2 text-gray-600">{form.time} hour{form.time !== 1 ? 's' : ''} daily</div>
                  </div>
                </div>
                {/* STRESSORS */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Top Stressors</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['money', 'school', 'job', 'relationships', 'mental health', 'body'].map((s) => (
                      <label key={s} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          value={s}
                          checked={form.stressors.includes(s)}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm capitalize">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* GOAL */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Main Life Goal</label>
                  <select 
                    name="goal" 
                    value={form.goal} 
                    onChange={handleChange} 
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200"
                  >
                    <option value="">Select your main goal</option>
                    <option value="clarity">Clarity</option>
                    <option value="routine">Routine</option>
                    <option value="productivity">Productivity</option>
                    <option value="confidence">Confidence</option>
                    <option value="peace">Peace</option>
                  </select>
                </div>
                {/* INCOME SLIDER */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Monthly Income</label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={form.income}
                      onChange={(e) => handleSliderChange('income', e.target.value)}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="text-sm mt-2 text-gray-600">${form.income.toLocaleString()}/month</div>
                  </div>
                </div>
                {/* LIVING */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Living Situation</label>
                  <select 
                    name="living" 
                    value={form.living} 
                    onChange={handleChange} 
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200"
                  >
                    <option value="">Select your living situation</option>
                    <option value="alone">Alone</option>
                    <option value="parents">With parents</option>
                    <option value="partner">With partner</option>
                    <option value="roommates">With roommates</option>
                  </select>
                </div>
                {/* LOCATION */}
                <div className="group">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Location Type</label>
                  <select 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange} 
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-200"
                  >
                    <option value="">Select your location type</option>
                    <option value="city">City</option>
                    <option value="suburb">Suburb</option>
                    <option value="rural">Rural</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Stat/Progress Card Example */}
          <div className="bg-orange-500 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-white min-h-[200px]">
            <div className="text-lg font-semibold mb-2">Your Progress</div>
            <div className="w-full flex flex-col items-center">
              <div className="w-full h-3 bg-white/30 rounded-full mb-3">
                <div className="h-3 bg-white rounded-full" style={{ width: `${(form.time / 6) * 100}%` }}></div>
              </div>
              <div className="text-2xl font-bold">{form.time * 10 + 20}%</div>
              <div className="text-xs opacity-80">Estimated completion</div>
            </div>
          </div>

          {/* Response Card */}
          <div className="col-span-3 md:col-span-1 bg-white rounded-3xl shadow-xl p-8 flex flex-col min-h-[200px]">
            <div className="text-lg font-semibold mb-4 text-gray-800">AI Plan Result</div>
            {response ? (
              <div className="prose prose-sm max-w-none text-black">
                {response.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0">{line}</p>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">Your personalized plan will appear here after you generate it.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
