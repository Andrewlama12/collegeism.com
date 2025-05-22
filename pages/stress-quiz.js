import { useState } from 'react';
import Head from 'next/head';

export default function StressQuiz() {
  // qa holds objects { question, answer }
  const [qa, setQa] = useState([
    { question: 'What is one thing that usually stresses you out the most?', answer: '' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [profile, setProfile] = useState('');

  const handleNext = async () => {
    if (!input.trim()) return;
    const updated = [...qa];
    updated[updated.length - 1].answer = input;
    setQa(updated);
    setInput('');
    setLoading(true);

    // Decide next step based on how many have been asked
    const count = updated.length;

    // 1–5: deep stress questions
    if (count < 5) {
      const res = await fetch('/api/next-question', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ qa: updated })
      });
      const { question } = await res.json();
      setQa(q => [...q, { question, answer: '' }]);

    // 6: ask for location
    } else if (count === 5) {
      setQa(q => [...q, { question: "Great—what city or region are you in?", answer: '' }]);

    // 7: ask for budget
    } else if (count === 6) {
      setQa(q => [...q, { question: "And what's your usual budget for outings? (free, low, medium, high)", answer: '' }]);

    // 8: final profile
    } else {
      const res = await fetch('/api/final-profile', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ qa: updated })
      });
      const { profile: prof } = await res.json();
      setProfile(prof);
      setFinished(true);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Stress Quiz</title>
      </Head>
      <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
        <div className="max-w-2xl mx-auto space-y-6">
          {!finished ? (
            <>
              <h1 className="text-3xl font-semibold">Stress & Life Deep Dive</h1>
              {qa.map(({ question, answer }, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    i === qa.length - 1 ? 'bg-white shadow' : 'bg-gray-100'
                  }`}
                >
                  <div className="font-medium mb-2">{question}</div>
                  {i < qa.length - 1 ? (
                    <div className="text-gray-600">🗹 {answer}</div>
                  ) : (
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your answer…"
                      className="w-full border rounded p-2"
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      disabled={loading}
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleNext}
                disabled={loading}
                className="mt-4 bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
              >
                {loading ? 'Thinking…' : `Continue (${qa.length}/8)`}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold">Your Personalized Summary</h1>
              <div className="prose bg-white p-6 rounded shadow whitespace-pre-wrap">
                {profile}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
} 