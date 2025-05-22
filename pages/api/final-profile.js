import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { qa } = req.body;

  // Build a comprehensive prompt
  let prompt = `You are an AI that creates insightful personality profiles based on a series of questions and answers.
Based on the following conversation, create a detailed profile that identifies patterns in their lifestyle, 
energy levels, stress triggers, and coping mechanisms. The profile should include:
1. An "Energy Pattern" section about when they're most productive
2. A "Stress Profile" section analyzing their stressors
3. A "Personal Rituals" section about their daily habits
4. A section with personalized tips for improving wellbeing

Format the profile with markdown headers and bullet points for tips.

Here is the conversation:
`;

  qa.forEach(({ question, answer }, i) => {
    prompt += `Q${i+1}: ${question}\nA${i+1}: ${answer}\n\n`;
  });

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 750,
    });

    const profile = response.choices[0].message.content.trim();
    res.status(200).json({ profile });
  } catch (err) {
    console.error(err);
    // Fallback to a generic profile if API call fails
    const genericProfile = `
**Energy Pattern**
Based on your answers, you appear to have a unique energy pattern that fluctuates throughout the day.

**Stress Management**
Your responses suggest you have some effective coping mechanisms for stress.

**Personal Tips**
• Consider tracking your energy levels throughout the day
• Build in short breaks during stressful periods
• Establish clear boundaries between work and personal time
`;
    res.status(200).json({ profile: genericProfile });
  }
} 