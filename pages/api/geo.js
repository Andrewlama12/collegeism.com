/**
 * API endpoint to provide geolocation data
 * In a real app, this would use client-side geolocation and just pass through
 * @param {import('next').NextApiRequest} req - The request object
 * @param {import('next').NextApiResponse} res - The response object 
 */
export default async function handler(req, res) {
  // Using a default location (San Francisco) since we can't get real user location from server
  // In a real app, you'd capture this on the client side with navigator.geolocation
  res.status(200).json({ 
    lat: 37.7749, 
    lon: -122.4194,
    city: "San Francisco" 
  });
} 