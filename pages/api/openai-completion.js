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
  
  const { ageRange, context, hobbies, paceLevel, eveningHabits, currentHobbies } = data || {};
  
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
      
    case 'similar-hobbies':
      // Generate more niche and unique hobby recommendations based on current selections
      if (!currentHobbies || currentHobbies.length === 0) {
        return { options: [] };
      }
      
      // Map of more specific/niche hobbies related to common hobbies
      const nicheHobbyMap = {
        "Reading": [
          { icon: "📝", label: "Creative Writing" },
          { icon: "🔍", label: "Book Club" },
          { icon: "🎭", label: "Poetry" },
          { icon: "🗣️", label: "Storytelling" }
        ],
        "Fitness": [
          { icon: "🧘", label: "Yoga" },
          { icon: "🏊", label: "Swimming" },
          { icon: "🧗", label: "Rock Climbing" },
          { icon: "🚴", label: "Cycling" }
        ],
        "Gaming": [
          { icon: "🎲", label: "Board Games" },
          { icon: "🎮", label: "Game Development" },
          { icon: "🎯", label: "Esports" },
          { icon: "🎭", label: "Role-Playing Games" }
        ],
        "Music": [
          { icon: "🎸", label: "Guitar" },
          { icon: "🎹", label: "Piano" },
          { icon: "🎧", label: "DJing" },
          { icon: "✍️", label: "Songwriting" }
        ],
        "Cooking": [
          { icon: "🍞", label: "Baking" },
          { icon: "🍷", label: "Wine Tasting" },
          { icon: "🍜", label: "International Cuisine" },
          { icon: "🌱", label: "Vegan Cooking" }
        ],
        "Art": [
          { icon: "🖌️", label: "Painting" },
          { icon: "📷", label: "Photography" },
          { icon: "🧶", label: "Knitting" },
          { icon: "🧵", label: "Embroidery" }
        ],
        "Tech": [
          { icon: "🤖", label: "Robotics" },
          { icon: "🧑‍💻", label: "Web Development" },
          { icon: "📱", label: "App Creation" },
          { icon: "🔌", label: "Electronics" }
        ],
        "Travel": [
          { icon: "🏕️", label: "Camping" },
          { icon: "📝", label: "Travel Blogging" },
          { icon: "🗺️", label: "Backpacking" },
          { icon: "🏞️", label: "National Parks" }
        ],
        "Photography": [
          { icon: "🌃", label: "Night Photography" },
          { icon: "👤", label: "Portrait Photography" },
          { icon: "🐦", label: "Wildlife Photography" },
          { icon: "🏙️", label: "Urban Photography" }
        ],
        "Running": [
          { icon: "🏃", label: "Trail Running" },
          { icon: "🏁", label: "Marathon Training" },
          { icon: "⏱️", label: "Sprint Training" },
          { icon: "👟", label: "Barefoot Running" }
        ],
        "Movies": [
          { icon: "🎬", label: "Film Studies" },
          { icon: "🎭", label: "Screenwriting" },
          { icon: "🎥", label: "Short Film Making" },
          { icon: "🍿", label: "Film Club" }
        ],
        "Social Media": [
          { icon: "📱", label: "Content Creation" },
          { icon: "📹", label: "Vlogging" },
          { icon: "🎙️", label: "Podcasting" },
          { icon: "📊", label: "Digital Marketing" }
        ],
        "Gardening": [
          { icon: "🪴", label: "Houseplants" },
          { icon: "🌿", label: "Herb Garden" },
          { icon: "🌸", label: "Flower Arranging" },
          { icon: "🍅", label: "Vegetable Growing" }
        ],
        "Home Improvement": [
          { icon: "🪚", label: "Woodworking" },
          { icon: "🏠", label: "Interior Design" },
          { icon: "🔨", label: "DIY Projects" },
          { icon: "🧹", label: "Home Organization" }
        ],
        "Entertainment": [
          { icon: "🎭", label: "Theater" },
          { icon: "🎤", label: "Karaoke" },
          { icon: "🎧", label: "Audiobooks" },
          { icon: "🎪", label: "Live Shows" }
        ]
      };
      
      // Collect niche hobby suggestions based on user's current selections
      let suggestedOptions = [];
      
      // Add suggestions based on current hobbies
      currentHobbies.forEach(hobby => {
        if (nicheHobbyMap[hobby]) {
          suggestedOptions = [...suggestedOptions, ...nicheHobbyMap[hobby]];
        }
      });
      
      // Filter out duplicates by label
      const uniqueOptions = suggestedOptions.filter((option, index, self) =>
        index === self.findIndex(t => t.label === option.label)
      );
      
      // Add a few random suggestions based on context
      let contextualSuggestions = [];
      
      if (context === "College student") {
        contextualSuggestions = [
          { icon: "📝", label: "Debate Club" },
          { icon: "🌍", label: "Model UN" },
          { icon: "🧪", label: "Research" },
          { icon: "🎓", label: "Tutoring" }
        ];
      } else if (context === "Working professional") {
        contextualSuggestions = [
          { icon: "🗣️", label: "Toastmasters" },
          { icon: "💼", label: "Networking" },
          { icon: "📊", label: "Investing" },
          { icon: "📚", label: "Professional Development" }
        ];
      } else if (context === "Parent") {
        contextualSuggestions = [
          { icon: "👨‍👩‍👧‍👦", label: "Family Activities" },
          { icon: "🏫", label: "Volunteering" },
          { icon: "🧸", label: "DIY Toys" },
          { icon: "📔", label: "Family Journal" }
        ];
      }
      
      // Add a few contextual suggestions if we have them
      if (contextualSuggestions.length > 0) {
        // Add 2 random contextual suggestions
        const randomContextual = contextualSuggestions.sort(() => 0.5 - Math.random()).slice(0, 2);
        uniqueOptions.push(...randomContextual);
      }
      
      // Return up to 8 suggestions, randomized
      return { 
        options: uniqueOptions
          .sort(() => 0.5 - Math.random())
          .slice(0, 8)
      };
      
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