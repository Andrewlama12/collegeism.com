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
    // Get API key from environment variable
    const apiKey = process.env.OPENWEATHER_API_KEY || 'YOUR_DEMO_API_KEY'; // replace with your API key in .env.local
    
    // Fetch weather data from OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the response with just what we need
    res.status(200).json({
      desc: data.weather[0].description,
      temp: data.main.temp,
      icon: data.weather[0].icon,
      conditions: {
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        clouds: data.clouds.all
      }
    });
  } catch (error) {
    console.error('Weather API error:', error);
    // Provide fallback weather data for demo purposes
    res.status(200).json({
      desc: 'Sunny with scattered clouds',
      temp: 72,
      icon: '02d',
      conditions: {
        humidity: 65,
        windSpeed: 5.2,
        clouds: 40
      }
    });
  }
} 