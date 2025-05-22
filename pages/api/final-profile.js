import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { qa } = req.body;

  let prompt = `You are an AI psychologist. Given this full Q&A, summarize this person's core stressors, hidden patterns, and personalized top 5 action steps (least to most extreme):\n\n`;
  qa.forEach(({ question, answer }, i) => {
    prompt += `Q${i+1}: ${question}\nA${i+1}: ${answer}\n`;
  });

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 350,
    });

    const profile = response.choices[0].message.content.trim();
    res.status(200).json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ profile: "Sorry, I couldn't generate your profile right now." });
  }
} 