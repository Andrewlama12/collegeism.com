import OpenAI from 'openai';

/**
 * API endpoint to generate a personalized daily schedule
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { profile, weather } = req.body;
  
  // Extract profile info if available, otherwise use defaults
  const age = profile?.ageRange || '30-40';
  const occupation = profile?.occupation || 'professional';
  const hobbies = profile?.hobbies?.join(', ') || 'reading, exercise';
  const availability = profile?.availability || [8, 22]; // default 8am-10pm
  
  // Format the time for readability
  const formatHour = (hour) => {
    const h = Math.floor(hour);
    const period = h < 12 ? 'AM' : 'PM';
    return `${h % 12 || 12}${period}`;
  };
  
  const startTime = formatHour(availability[0]);
  const endTime = formatHour(availability[1]);

  let prompt = `Create a hour-by-hour personalized daily schedule for someone with the following profile:
- Age: ${age}
- Occupation: ${occupation}
- Favorite hobbies: ${hobbies}
- Available hours: ${startTime} to ${endTime}

The current weather is: ${weather.desc}, ${Math.round(weather.temp)}°F.

Format each line of the schedule as: 
"[HOUR]:00 – [ACTIVITY]"

For example:
"7:00 – Morning meditation"
"8:00 – Breakfast & planning the day"

Include specific activities suited to the current weather, and make it a well-balanced, productive day.
Cover only waking hours (6am-11pm). Limit each activity description to 50 characters max.`;

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const planText = response.choices[0].message.content.trim();
    
    // Parse the text format into structured data
    const lines = planText.split('\n').filter(Boolean);
    // assume each line prefixed like "8:00 – Do X"
    const schedule = lines.map(line => {
      // Look for various time formats like "8:00 -" or "8:00 –" or "8:00:"
      const match = line.match(/^(\d+)(?::00)?(?:\s*[-–:]\s*)(.*)/);
      if (match) {
        return { 
          hour: parseInt(match[1]), 
          text: match[2].trim().substring(0, 50) // Limit to 50 chars
        };
      }
      return null;
    }).filter(Boolean); // Remove any null entries
    
    // Sort by hour
    schedule.sort((a, b) => a.hour - b.hour);

    res.status(200).json({ plan: schedule });
  } catch (err) {
    console.error('Error generating plan:', err);
    // Provide a fallback schedule for demo purposes
    res.status(200).json({
      plan: [
        { hour: 7, text: "Wake up & morning stretch" },
        { hour: 8, text: "Breakfast & check emails" },
        { hour: 9, text: "Start work/main activity" },
        { hour: 12, text: "Lunch break" },
        { hour: 15, text: "Quick walk outside" },
        { hour: 18, text: "Wrap up work" },
        { hour: 19, text: "Dinner" },
        { hour: 20, text: "Relax with a hobby" },
        { hour: 22, text: "Prepare for bed" }
      ]
    });
  }
} 