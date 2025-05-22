/**
 * API endpoint to fetch weather data based on latitude and longitude
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object
 */
export default async function handler(req, res) {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing latitude or longitude parameters' });
  }

  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      throw new Error('Missing OpenWeather API key');
    }
    
    const w = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${key}`
    ).then(r => r.json());

    res.status(200).json({
      desc: w.weather[0].main,
      temp: w.main.temp,
      icon: w.weather[0].icon
    });
  } catch (error) {
    console.error('Weather API error:', error);
    // Provide fallback weather data
    res.status(200).json({
      desc: 'Sunny',
      temp: 72,
      icon: '01d'
    });
  }
} 