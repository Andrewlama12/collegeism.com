import OpenAI from 'openai';

/** @typedef {import('../../lib/types').Profile} Profile */

/**
 * API endpoint to generate personalized lifestyle plans
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  /** @type {Profile} */
  const profile = req.body;
  
  // Extract availability as readable time format
  const startTime = formatTime(profile.availability[0]);
  const endTime = formatTime(profile.availability[1]);
  
  let prompt = `Create a personalized daily routine for someone with the following profile:
- Age: ${profile.ageRange}
- Occupation: ${profile.occupation}
- Favorite hobbies: ${profile.hobbies.join(', ')}
- Available time: ${startTime} to ${endTime}
- Dinner preference: ${profile.dinnerPrefs}
- Evening activity preference: ${profile.evening}

Please provide:
1. A balanced daily schedule that incorporates their interests
2. Three specific activity suggestions based on their hobbies
3. A dinner recommendation aligned with their preferences
4. An evening wind-down routine that helps build relationships
5. One suggestion for a new hobby or activity they might enjoy trying

Make the recommendations specific, actionable, and tailored to their profile.`;

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const plan = response.choices[0].message.content.trim();
    res.status(200).json({ plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      plan: "We couldn't generate your personalized plan at this time. Please try again later."
    });
  }
}

/**
 * Format hours as AM/PM time
 * @param {number} hours - Hours in 24-hour format
 * @returns {string} Time in AM/PM format
 */
function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
} 