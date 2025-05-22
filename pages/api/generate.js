import OpenAI from 'openai';

export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '❌ Missing OpenAI API key. Set OPENAI_API_KEY in your environment variables.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Method not allowed' });
  }

  const { age, time, stressors, goal, income, living, location, notes } = req.body;

  if (!age || !time || !goal) {
    return res.status(400).json({ error: '❌ Missing required fields: age, time, or goal.' });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const userPrompt = `
You are an AI life planner focused on reducing stress and helping users simplify their lives.

The user is ${age} years old and has about ${time} available per day.

Top sources of stress: ${stressors && stressors.length ? stressors.join(', ') : 'Not specified'}.

Their main goal is: ${goal}.
Income: ${income || 'Not specified'}
Living situation: ${living || 'Not specified'}
Location type: ${location || 'Not specified'}
Additional context: ${notes || 'None'}

Create a week-long plan that reduces stress and fits their lifestyle. Be realistic, actionable, and empathetic.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a supportive and strategic AI life planner.' },
        { role: 'user', content: userPrompt },
      ],
    });

    const result = response.choices?.[0]?.message?.content;
    if (!result) {
      return res.status(500).json({ error: '❌ No response from OpenAI.' });
    }

    return res.status(200).json({ result });
  } catch (err) {
    console.error('❌ Error calling OpenAI:', err);
    return res.status(500).json({
      error: err?.response?.data?.error?.message || err.message || '❌ Unexpected server error',
    });
  }
}
