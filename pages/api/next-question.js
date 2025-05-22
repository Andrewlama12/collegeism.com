import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { qa } = req.body;

  // Build a chain-of-thought prompt
  let prompt = `You are an AI that builds a deep personal profile by asking insightful questions.\n`;
  qa.forEach(({ question, answer }, i) => {
    prompt += `Q${i+1}: ${question}\nA${i+1}: ${answer}\n`;
  });
  prompt += `Now ask the next question that digs deeper into this person's stress patterns or lifestyle.`;

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 60,
    });

    const question = response.choices[0].message.content.trim();
    res.status(200).json({ question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ question: "Sorry, something went wrong—can you tell me more about your day?" });
  }
} 