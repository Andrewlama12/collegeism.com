import { useState } from 'react';
import Head from 'next/head';

export default function LifePlannerForm() {
  const [form, setForm] = useState({
    age: '30',
    occupation: 'Engineer',
    stressLevel: 3,
    caffeine: 'High',
    relationship: 'Strong',
    stressors: [],
  });

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSteps([]);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const result = data.result || '';
      
      // Parse the response into steps
      const stepsArray = result
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line);
      
      setSteps(stepsArray.length > 0 ? stepsArray : ['Take a walk outside', 'Declutter your workspace', 'Set boundaries at work', 'Try a new hobby', 'Talk to a therapist']);
    } catch (err) {
      setSteps(['Error generating plan. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Stress Reduction Planner</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-white font-[Inter] text-black">
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
          {/* Left Side - Form */}
          <div className="p-8 md:p-12 border-r border-gray-200">
            <h1 className="text-4xl font-bold mb-12">Stress Reduction</h1>
            
            <div className="space-y-8">
              {/* Age */}
              <div>
                <label className="block text-xl mb-2">Age</label>
                <div className="relative">
                  <select 
                    name="age" 
                    value={form.age} 
                    onChange={handleChange}
                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-gray-400 appearance-none pr-10"
                  >
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="60+">60+</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-gray-400 appearance-none pr-10"
                  >
                    <option value="Engineer">Engineer</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Business">Business</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    onChange={(e) => handleSliderChange('stressLevel', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xl font-medium w-6">{form.stressLevel}</span>
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
                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-gray-400 appearance-none pr-10"
                  >
                    <option value="None">None</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    className="w-full p-4 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:border-gray-400 appearance-none pr-10"
                  >
                    <option value="Single">Single</option>
                    <option value="Weak">Weak</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Strong">Strong</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full p-4 bg-white border border-gray-300 rounded-lg text-xl font-medium hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </div>

          {/* Right Side - Personalized Steps */}
          <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-12">Personalized Steps</h1>
            
            <div className="space-y-6">
              {steps.length > 0 ? (
                steps.map((step, index) => (
                  <div key={index} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
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
    </>
  );
}
