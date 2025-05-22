import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { qa } = req.body;

  // Extract location & budget (last two answers)
  const location = qa[5]?.answer;
  const budget = qa[6]?.answer;

  let prompt = `You are a trusted friend and local guide.  
They live in ${location} and prefer ${budget}-cost activities.\n\n`;
  prompt += `They have shared:\n`;
  qa.slice(0,5).forEach(({ question, answer }, i) => {
    prompt += `Q${i+1}: ${question}\nA${i+1}: ${answer}\n`;
  });
  prompt += `\nNow write a warm, conversational summary that:
1. Highlights their core stressors and hidden patterns.
2. Mentions their favorite hobbies, music, and personal rituals.
3. Provides five supportive action steps from smallest (a song break) to more involved (a creative project).
4. Suggests three local happiness boosters in ${location} for ${budget} budgets — one free, one low-cost, one splurge.
Write it like a caring letter from a friend.`;

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 450,
    });
    res.status(200).json({ profile: resp.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      profile:
        "Sorry, I hit a snag creating your summary—please try again shortly."
    });
  }
} 