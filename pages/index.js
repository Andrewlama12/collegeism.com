import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Could not parse JSON from backend:\n${text}`);
      }

      if (res.ok) {
        setResponse(data.result);
      } else {
        setResponse(`❌ API Error:\n${data.error || 'Unknown error from backend'}`);
      }
    } catch (err) {
      console.error('Frontend crash:', err);
      setResponse(`❌ Frontend Exception:\n${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: 'auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>AI Life Planner</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder="What do you want help with this week?"
        style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1rem' }}
      />

      <button
        onClick={generatePlan}
        disabled={loading || !input}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#111',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Generating...' : 'Generate Plan'}
      </button>

      {response && (
        <div
          style={{
            marginTop: '2rem',
            whiteSpace: 'pre-wrap',
            background: '#f6f6f6',
            padding: '1rem',
            borderRadius: '8px',
          }}
        >
          {response}
        </div>
      )}
    </main>
  );
}
