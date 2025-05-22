import { Configuration, OpenAIApi } from 'openai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'No message provided' })
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a calm, helpful, and professional AI that builds personalized weekly plans focusing on time, money, and mental clarity. Keep everything simple and actionable.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    res.status(200).json({ result: response.data.choices[0].message.content })
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message)
    res.status(500).json({ error: 'OpenAI request failed.' })
  }
}
