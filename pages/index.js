import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')

  async function generatePlan() {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    })
    const data = await res.json()
    setResponse(data.result)
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>AI Life Planner</h1>
      <textarea
        rows={4}
        style={{ width: '100%' }}
        placeholder="What do you want help with this week?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />
      <button onClick={generatePlan}>Generate Plan</button>
      <pre style={{ marginTop: 20 }}>{response}</pre>
    </main>
  )
}
