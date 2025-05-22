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

Return the schedule as a JSON array where each item has a 24-hour format 'hour' (number) and 'text' (string) with the activity.
Include specific activities suited to the current weather, and make it a well-balanced, productive day.
Cover only waking hours (6am-11pm) with hourly entries. Limit each text to 50 characters max.

Example format:
[
  { "hour": 6, "text": "Morning meditation" },
  { "hour": 7, "text": "Breakfast & planning the day" }
]`;

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response as JSON
    let plan;
    try {
      const content = response.choices[0].message.content.trim();
      const parsedResponse = JSON.parse(content);
      plan = parsedResponse.hasOwnProperty('plan') ? parsedResponse.plan : parsedResponse;
      
      // Ensure it's an array
      if (!Array.isArray(plan)) {
        throw new Error('Invalid plan format');
      }
      
      // Verify and clean up the format
      plan = plan.map(item => ({
        hour: typeof item.hour === 'number' ? item.hour : parseInt(item.hour),
        text: item.text.substring(0, 50) // Ensure text is not too long
      }));
      
      // Sort by hour
      plan.sort((a, b) => a.hour - b.hour);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to parse the schedule data');
    }

    res.status(200).json({ plan });
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