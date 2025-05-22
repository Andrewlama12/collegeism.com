import { useState } from 'react'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')

  async function generatePlan() {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error('API error:', error)
        setResponse('Error: ' + error)
        return
      }

      const data = await res.json()
      setResponse(data.result)
    } catch (err) {
      console.error('Fetch error:', err)
      setResponse('An unexpected error occurred.')
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>AI Life Planner</h1>
      <textarea
        rows={4}
        style={{ width: '100%' }}
        placeholder="What's your goal this week?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />
      <button onClick={generatePlan}>Generate Plan</button>
      <pre style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>{response}</pre>
    </main>
  )
}
