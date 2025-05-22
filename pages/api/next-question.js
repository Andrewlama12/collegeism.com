import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { qa } = req.body;

  let prompt = `You are a compassionate guide helping someone explore their stress.  
So far they said:\n`;
  qa.forEach(({ question, answer }, i) => {
    prompt += `Q${i+1}: ${question}\nA${i+1}: ${answer}\n`;
  });
  prompt += `
Now ask your next question that:
• Digs deeper into their personal routines, hobbies, or music tastes  
• References something to connect emotionally  
• Helps uncover hidden stress patterns  
Keep it conversational and supportive.`;

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 70,
    });
    res.status(200).json({ question: resp.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      question:
        "Oops, I'm stuck! Can you share a hobby or song that always makes you feel calm?"
    });
  }
} 