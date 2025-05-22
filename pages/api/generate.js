import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  console.log('🔍 REQUEST METHOD:', req.method);
  console.log('🔐 API KEY:', process.env.OPENAI_API_KEY ? 'PRESENT ✅' : 'MISSING ❌');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    console.log('⚠️ No message provided');
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI life planner...',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    console.log('✅ OpenAI response received:', response.data);

    const output = response.data.choices?.[0]?.message?.content;

    if (!output) {
      throw new Error('No output returned from OpenAI');
    }

    res.status(200).json({ result: output });
  } catch (error) {
    console.error('🔥 FULL ERROR:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({ error: 'Internal Server Error: ' + (error.message || 'Unknown') });
  }
}
