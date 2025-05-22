import { useState } from 'react';

const steps = [
  'Age & Time',
  'Stressors & Goal',
  'Income & Living',
  'Location & Notes'
];

export default function LifePlannerForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    age: '',
    time: '',
    stressors: [],
    goal: '',
    income: '',
    living: '',
    location: '',
    notes: ''
  });

  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const updated = checked
      ? [...form.stressors, value]
      : form.stressors.filter((s) => s !== value);
    setForm({ ...form, stressors: updated });
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

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
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg font-sans">
      <h1 className="text-3xl font-semibold mb-6">🧠 AI Life Planner</h1>
      <div className="text-sm text-gray-500 mb-6">Step {step + 1} of {steps.length}: <span className="text-gray-700 font-medium">{steps[step]}</span></div>

      <div className="space-y-6">
        {step === 0 && (
          <div className="grid gap-6">
            <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select name="time" value={form.time} onChange={handleChange} className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Time available per day</option>
              <option value="30 mins">30 mins</option>
              <option value="1 hour">1 hour</option>
              <option value="2+ hours">2+ hours</option>
            </select>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-6">
            <div className="text-sm font-medium text-gray-700">Top stressors:</div>
            <div className="grid grid-cols-2 gap-2">
              {['money', 'school', 'job', 'relationships', 'mental health', 'body'].map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={s}
                    checked={form.stressors.includes(s)}
                    onChange={handleCheckboxChange}
                    className="accent-blue-500"
                  />
                  {s}
                </label>
              ))}
            </div>
            <select name="goal" value={form.goal} onChange={handleChange} className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Main goal</option>
              <option value="clarity">Clarity</option>
              <option value="routine">Routine</option>
              <option value="productivity">Productivity</option>
              <option value="confidence">Confidence</option>
              <option value="peace">Peace</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <select name="income" value={form.income} onChange={handleChange} className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Monthly income</option>
              <option value="<$1k">&lt;$1k</option>
              <option value="$1k–$3k">$1k–$3k</option>
              <option value=">$3k">&gt;$3k</option>
            </select>
            <select name="living" value={form.living} onChange={handleChange} className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Living situation</option>
              <option value="alone">Alone</option>
              <option value="parents">With parents</option>
              <option value="partner">With partner</option>
              <option value="roommates">With roommates</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6">
            <select name="location" value={form.location} onChange={handleChange} className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Location type</option>
              <option value="city">City</option>
              <option value="suburb">Suburb</option>
              <option value="rural">Rural</option>
            </select>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Anything else you're feeling or dealing with"
              className="border border-gray-300 rounded-md p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        {step > 0 && <button onClick={handleBack} className="px-4 py-2 text-sm border border-gray-300 rounded-md">Back</button>}
        {step < steps.length - 1 ? (
          <button onClick={handleNext} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">Next</button>
        ) : (
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        )}
      </div>

      {response && (
        <div className="mt-8 border-t pt-6 text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px] font-light">
          {response}
        </div>
      )}
    </div>
  );
}
