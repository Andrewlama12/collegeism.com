import { useState } from 'react';
import Head from 'next/head';

export default function LifePlannerForm() {
  const [form, setForm] = useState({
    age: '30',
    occupation: 'Engineer',
    stressLevel: 3,
    caffeine: 'High',
    relationship: 'Strong',
  });

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const result = data.result || '';
      
      // Parse the response into steps or use default steps
      const stepsArray = result && result.trim()
        ? result
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => line)
        : ['Take a walk outside', 'Declutter your workspace', 'Set boundaries at work', 'Try a new hobby', 'Talk to a therapist'];
      
      setSteps(stepsArray);
    } catch (err) {
      console.error(err);
      setSteps(['Error generating plan. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 md:border-r border-gray-200">
          <h1 className="text-4xl font-bold mb-8">Stress Reduction</h1>
          
          <div className="space-y-6">
            {/* Age */}
            <div>
              <label className="block text-xl mb-2">Age</label>
              <div className="relative">
                <select 
                  name="age" 
                  value={form.age} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none pr-10 bg-white"
                >
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="60+">60+</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xl mb-2">Occupation</label>
              <div className="relative">
                <select 
                  name="occupation" 
                  value={form.occupation} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none pr-10 bg-white"
                >
                  <option value="Engineer">Engineer</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Business">Business</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <label className="block text-xl mb-2">Stress Level</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.stressLevel}
                  onChange={(e) => handleSliderChange('stressLevel', e.target.value)}
                  className="w-full h-1 bg-gray-200 rounded appearance-none"
                />
                <span className="text-xl font-medium">{form.stressLevel}</span>
              </div>
            </div>

            {/* Caffeine Consumption */}
            <div>
              <label className="block text-xl mb-2">Caffeine Consumption</label>
              <div className="relative">
                <select 
                  name="caffeine" 
                  value={form.caffeine} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none pr-10 bg-white"
                >
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Relationship Strength */}
            <div>
              <label className="block text-xl mb-2">Relationship Strength</label>
              <div className="relative">
                <select 
                  name="relationship" 
                  value={form.relationship} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg appearance-none pr-10 bg-white"
                >
                  <option value="Single">Single</option>
                  <option value="Weak">Weak</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Strong">Strong</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full p-3 mt-4 bg-white border border-gray-300 rounded-lg text-lg font-medium hover:bg-gray-50 transition-all"
            >
              {loading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>

        {/* Right Side - Personalized Steps */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <h1 className="text-4xl font-bold mb-8">Personalized Steps</h1>
          
          <div className="space-y-5">
            {steps.length > 0 ? (
              steps.map((step, index) => (
                <div key={index} className="p-5 bg-white border border-gray-200 rounded-xl">
                  <p className="text-xl">{step}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xl">Generate a plan to see your personalized steps</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
