// This endpoint generates personalized activity suggestions
// based on the user's profile data and current weather conditions

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile, weather } = req.body;
    
    if (!profile) {
      return res.status(400).json({ error: 'Profile data is required' });
    }
    
    // Generate personalized suggestions
    const suggestions = generateSuggestions(profile, weather);
    
    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}

function generateSuggestions(profile, weather) {
  const suggestions = [];
  
  // Extract profile attributes
  const {
    ageRange,
    occupation,
    stressLevel,
    hobbies,
    availability,
    sleepHabit,
    socialEnergy,
    location
  } = profile;
  
  // Parse profile characteristics
  const isYoung = ['18–22', '23–30'].includes(ageRange);
  const isOutdoorsy = hobbies?.some(h => ['Hiking', 'Sports', 'Travel'].includes(h)) || false;
  const isCreative = hobbies?.some(h => ['Art', 'Music', 'Cooking'].includes(h)) || false;
  const isTechie = hobbies?.some(h => ['Technology', 'Gaming'].includes(h)) || false;
  const isReader = hobbies?.some(h => ['Reading'].includes(h)) || false;
  const isEarlyBird = sleepHabit === 'Early bird';
  const isNightOwl = sleepHabit === 'Night owl';
  const isHighStress = stressLevel > 7;
  const isLowStress = stressLevel < 3;
  const isHighEnergy = socialEnergy > 7;
  const isLowEnergy = socialEnergy < 3;
  
  // Weather conditions
  const isNiceWeather = weather?.desc?.toLowerCase().includes('clear') || 
                       weather?.desc?.toLowerCase().includes('sunny');
  const isRainyWeather = weather?.desc?.toLowerCase().includes('rain') ||
                        weather?.desc?.toLowerCase().includes('shower');
  const isColdWeather = weather?.temp < 50;
  
  // Add personalized suggestions based on multiple factors
  
  // Weather-specific suggestions
  if (isNiceWeather && isOutdoorsy) {
    suggestions.push("Take advantage of today's good weather with a hike or outdoor activity");
  }
  
  if (isRainyWeather) {
    suggestions.push("It's rainy today - perfect for a cozy indoor reading session");
    
    if (isCreative) {
      suggestions.push("Use the rainy weather as inspiration for a creative project");
    }
  }
  
  if (isColdWeather && isOutdoorsy) {
    suggestions.push("Bundle up for a brisk walk to enjoy the crisp air");
  }
  
  // Stress management suggestions
  if (isHighStress) {
    suggestions.push("Try a 10-minute meditation session to reduce stress");
    suggestions.push("Take short breaks throughout your day to breathe deeply");
    
    if (isOutdoorsy) {
      suggestions.push("Go for a nature walk to clear your mind");
    }
  }
  
  // Energy level suggestions
  if (isHighEnergy && isYoung) {
    suggestions.push("Join a local sports league or fitness class to meet new people");
  }
  
  if (isLowEnergy) {
    suggestions.push("Set small, achievable goals for today to build momentum");
  }
  
  // Sleep habit suggestions
  if (isEarlyBird) {
    suggestions.push("Use your morning energy for your most important tasks");
    suggestions.push("Prepare for tomorrow by setting out clothes and items the night before");
  }
  
  if (isNightOwl) {
    suggestions.push("Schedule creative or complex work for your evening energy peak");
  }
  
  // Occupation-specific suggestions
  if (occupation === 'Student') {
    suggestions.push("Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break");
  }
  
  if (occupation === 'Employed' || occupation === 'Freelancer') {
    suggestions.push("Block off focused work time on your calendar to avoid interruptions");
  }
  
  if (occupation === 'Retired') {
    suggestions.push("Schedule regular social activities to maintain connections");
  }
  
  // Hobbies-specific suggestions
  if (isCreative) {
    suggestions.push("Set aside 30 minutes for a creative hobby you enjoy");
  }
  
  if (isReader) {
    suggestions.push("Read a short story or a chapter from your current book");
  }
  
  if (isTechie) {
    suggestions.push("Learn one new keyboard shortcut or tech trick today");
  }
  
  // Generic good suggestions for everyone
  suggestions.push("Call a friend for a quick chat to connect");
  suggestions.push("Take a relaxing evening walk");
  suggestions.push("Reflect on three things you're grateful for today");
  suggestions.push("Drink a glass of water and stretch for 2 minutes");
  
  // Randomize and limit to reasonable number
  const shuffled = suggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6); // Return 6 random suggestions
} 