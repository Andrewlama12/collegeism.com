import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    console.log('❌ No message provided');
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional, calm, and insightful AI life planner that helps users simplify their week into clear tasks related to time, health, and finances.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const result = response.data.choices[0]?.message?.content;

    if (!result) {
      console.log('❌ No content in OpenAI response');
      return res.status(500).json({ error: 'No content returned from OpenAI.' });
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error('❌ OpenAI Error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data?.error?.message || error.message || 'Unknown server error',
    });
  }
}
