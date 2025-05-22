import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  console.log('API KEY PRESENT:', Boolean(process.env.OPENAI_API_KEY));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional AI life planner that simplifies life into clear weekly goals for health, money, and time.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    res.status(200).json({ result: response.data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API Error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data?.error?.message || error.message || 'Unknown error',
    });
  }
}
