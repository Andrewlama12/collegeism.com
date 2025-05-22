import OpenAI from 'openai';

export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '❌ Missing OpenAI API key. Set OPENAI_API_KEY in your environment variables.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { archetype, stress, caffeine, alcohol, relationships } = req.body;

    // For safety, ensure all required fields are present
    if (!archetype || stress === undefined || !caffeine || !alcohol || !relationships) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate steps based on inputs
    const steps = generateSteps(archetype, {
      stress: Number(stress),
      caffeine,
      alcohol,
      relationships
    });

    return res.status(200).json({ result: steps });
  } catch (error) {
    console.error('Error generating steps:', error);
    return res.status(500).json({ error: 'Failed to generate steps' });
  }
}

// Generate personalized steps based on user inputs
function generateSteps(archetype, formData) {
  const { stress, caffeine, alcohol, relationships } = formData;
  
  // Base steps for different archetypes
  const archetypeSteps = {
    achiever: [
      "Create a detailed to-do list for tomorrow",
      "Set three specific goals for the week ahead",
      "Schedule focused work blocks in your calendar",
      "Identify one task to delegate or eliminate",
      "Review your progress and celebrate achievements"
    ],
    creative: [
      "Take a 20-minute walk without digital devices",
      "Create something without judging the result",
      "Listen to music that inspires you",
      "Rearrange your workspace for fresh perspective",
      "Try a new creative technique or medium"
    ],
    caregiver: [
      "Schedule 30 minutes of self-care today",
      "Reach out to someone who might need support",
      "Practice saying 'no' to one non-essential request",
      "Write down three things you appreciate about yourself",
      "Create clear boundaries between work and personal time"
    ],
    explorer: [
      "Try a new route to work or a familiar destination",
      "Learn something new for 15 minutes",
      "Plan a microadventure for the weekend",
      "Connect with someone outside your usual social circle",
      "Experiment with a new cuisine or recipe"
    ],
    analyzer: [
      "Journal about your current thoughts and feelings",
      "Break down a complex problem into smaller parts",
      "Research one topic that interests you",
      "Schedule time for reflection without distractions",
      "Create a system to track your habits or patterns"
    ]
  };

  // Select base steps from user's archetype
  const baseSteps = archetypeSteps[archetype] || archetypeSteps.achiever;
  
  // Customize additional steps based on stress level and other factors
  const customSteps = [];

  // High stress modifications
  if (stress >= 7) {
    customSteps.push("Practice deep breathing for 5 minutes twice daily");
    customSteps.push("Limit screen time 1 hour before bed");
  }

  // Caffeine modifications
  if (caffeine === 'high') {
    customSteps.push("Reduce caffeine intake by replacing one coffee with herbal tea");
  }

  // Alcohol modifications
  if (alcohol === 'regular') {
    customSteps.push("Plan two alcohol-free days this week");
  }

  // Relationship modifications
  if (relationships === 'weak') {
    customSteps.push("Schedule one meaningful social connection this week");
  }

  // Combine base steps with custom recommendations
  const finalSteps = [...baseSteps];
  
  // Add 1-2 custom steps based on specific factors
  if (customSteps.length > 0) {
    finalSteps.push(customSteps[0]);
    if (customSteps.length > 1 && stress > 5) {
      finalSteps.push(customSteps[1]);
    }
  }

  return finalSteps.join('\n');
}
