/**
 * API endpoint to provide geolocation data based on a location string
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object 
 */
export default async function handler(req, res) {
  const { location } = req.query;
  
  if (!location) {
    // Using a default location (San Francisco) if no location provided
    return res.status(200).json({ 
      lat: 37.7749, 
      lon: -122.4194,
      city: "San Francisco" 
    });
  }

  try {
    // In a production environment, use a geocoding API service
    // For demo purposes, we'll provide mock responses for a few common locations
    const mockGeoData = {
      'new york': { lat: 40.7128, lon: -74.0060, city: "New York" },
      'los angeles': { lat: 34.0522, lon: -118.2437, city: "Los Angeles" },
      'chicago': { lat: 41.8781, lon: -87.6298, city: "Chicago" },
      'san francisco': { lat: 37.7749, lon: -122.4194, city: "San Francisco" },
      'miami': { lat: 25.7617, lon: -80.1918, city: "Miami" },
      'seattle': { lat: 47.6062, lon: -122.3321, city: "Seattle" },
      'austin': { lat: 30.2672, lon: -97.7431, city: "Austin" },
      'boston': { lat: 42.3601, lon: -71.0589, city: "Boston" },
    };
    
    const normalizedLocation = location.toLowerCase().trim();
    const geoData = mockGeoData[normalizedLocation] || 
      // Default location if not found
      { lat: 37.7749, lon: -122.4194, city: location };
    
    return res.status(200).json(geoData);
  } catch (error) {
    console.error('Geo API error:', error);
    return res.status(500).json({ error: 'Failed to geocode location' });
  }
} 