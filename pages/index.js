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
