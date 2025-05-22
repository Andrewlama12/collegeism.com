// API endpoint for OpenAI completions that adapts to different prompt types

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { promptType, data } = req.body;
    
    if (!promptType) {
      return res.status(400).json({ error: 'promptType is required' });
    }
    
    // In a production environment, use actual OpenAI API
    // Here we'll use a mock implementation for demo purposes
    const result = await mockOpenAICompletion(promptType, data);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI completion error:', error);
    return res.status(500).json({ error: 'Failed to generate completion' });
  }
}

// Mock OpenAI implementation for demo purposes
// In production, replace with actual OpenAI API calls
async function mockOpenAICompletion(promptType, data) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const { ageRange, context, hobbies, paceLevel, eveningHabits } = data || {};
  
  switch (promptType) {
    case 'life-stages':
      return {
        options: [
          "College student",
          "Recent graduate",
          "Early career",
          "Working professional", 
          "Parent"
        ]
      };
      
    case 'hobby-options':
      // Adapt hobby suggestions based on age range and context
      if (ageRange && ageRange < 25) {
        if (context === "College student") {
          return {
            options: [
              { icon: "📚", label: "Reading" },
              { icon: "🏋️", label: "Fitness" },
              { icon: "🎮", label: "Gaming" },
              { icon: "🎸", label: "Music" },
              { icon: "📱", label: "Social Media" },
              { icon: "🧑‍💻", label: "Coding" },
              { icon: "🍳", label: "Cooking" }
            ]
          };
        } else {
          return {
            options: [
              { icon: "🏃", label: "Running" },
              { icon: "🎮", label: "Gaming" },
              { icon: "🎬", label: "Movies" },
              { icon: "📱", label: "Social Media" },
              { icon: "🧑‍💻", label: "Tech" },
              { icon: "🎨", label: "Art" },
              { icon: "📷", label: "Photography" }
            ]
          };
        }
      } else {
        return {
          options: [
            { icon: "🏋️", label: "Fitness" },
            { icon: "🍳", label: "Cooking" },
            { icon: "🏠", label: "Home Improvement" },
            { icon: "🌱", label: "Gardening" },
            { icon: "📚", label: "Reading" },
            { icon: "✈️", label: "Travel" },
            { icon: "🎨", label: "Art" },
            { icon: "🎭", label: "Entertainment" }
          ]
        };
      }
      
    case 'pace-labels':
      return {
        options: [
          { code: 1, label: "Leisurely" },
          { code: 2, label: "Balanced" },
          { code: 3, label: "Active" },
          { code: 4, label: "Fast-paced" }
        ]
      };
      
    case 'ritual-options':
      return {
        options: [
          { icon: "📱", label: "Social media scroll" },
          { icon: "📚", label: "Reading" },
          { icon: "🍵", label: "Tea ritual" },
          { icon: "🧘", label: "Meditation" },
          { icon: "🎬", label: "TV/streaming" }
        ]
      };
      
    case 'daily-plan':
      // Generate a personalized plan based on all collected data
      let planSteps = [];
      
      // Base steps on various factors
      if (hobbies && hobbies.includes("Fitness")) {
        planSteps.push({
          step: "10-minute morning stretch routine",
          detail: "Simple stretches to boost energy and reduce stress without breaking a sweat."
        });
      } else {
        planSteps.push({
          step: "Take a 5-minute mindfulness break",
          detail: "Focus on your breathing for just 5 minutes to reset your mind and reduce stress."
        });
      }
      
      // Add pace-dependent step
      if (paceLevel >= 3) {
        planSteps.push({
          step: "Use the 1-3-5 method for tasks today",
          detail: "Identify 1 big task, 3 medium tasks, and 5 small tasks to organize your day."
        });
      } else {
        planSteps.push({
          step: "Choose just ONE priority for today",
          detail: "Reduce decision fatigue by selecting your single most important goal for today."
        });
      }
      
      // Add evening routine-related step
      if (eveningHabits && eveningHabits.includes("Meditation")) {
        planSteps.push({
          step: "Schedule a 10-minute evening meditation",
          detail: "Wind down with a brief guided meditation to improve sleep quality."
        });
      } else {
        planSteps.push({
          step: "Set a firm device cutoff time tonight",
          detail: "Decide now when you'll stop using screens tonight to improve sleep quality."
        });
      }
      
      // Ensure we have exactly 3 steps
      while (planSteps.length < 3) {
        planSteps.push({
          step: "Drink a full glass of water right now",
          detail: "Simple hydration can immediately improve focus, energy and mood."
        });
      }
      
      return { plan: planSteps.slice(0, 3) };
      
    default:
      return { error: 'Unknown prompt type' };
  }
} 