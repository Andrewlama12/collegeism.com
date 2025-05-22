export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { qa } = req.body;
    
    if (!qa || !Array.isArray(qa)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Generate a personalized profile based on all Q&A
    const profile = generateProfile(qa);
    
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Error generating profile:', error);
    return res.status(500).json({ error: 'Failed to generate profile' });
  }
}

function generateProfile(qa) {
  // Extract insights from the answers
  let ritualMentioned = '';
  let energyTime = '';
  let stressors = [];
  let relaxationMethod = '';
  let lifeBalance = '';
  let hasTimeConstraints = false;
  
  // Very simple parsing based on expected questions
  qa.forEach(item => {
    const q = item.question.toLowerCase();
    const a = item.answer.toLowerCase();
    
    if (q.includes('ritual')) {
      ritualMentioned = item.answer;
    }
    if (q.includes('energetic')) {
      energyTime = a.includes('morning') ? 'morning' : 
                   a.includes('afternoon') ? 'afternoon' : 
                   a.includes('evening') ? 'evening' : 'variable';
    }
    if (q.includes('stress')) {
      if (a.includes('work')) stressors.push('work');
      if (a.includes('family')) stressors.push('family');
      if (a.includes('time')) {
        stressors.push('time management');
        hasTimeConstraints = true;
      }
    }
    if (q.includes('relax')) {
      relaxationMethod = item.answer;
    }
    if (q.includes('balance')) {
      lifeBalance = item.answer;
    }
  });
  
  // Determine energy type
  const energyType = energyTime === 'morning' ? 'Early Bird' : 
                    energyTime === 'evening' ? 'Night Owl' : 
                    'Flexible Energy Pattern';
  
  // Determine stress profile
  const stressProfile = stressors.length > 2 ? 'High Stress Environment' :
                      stressors.length > 0 ? 'Moderate Stress' :
                      'Low External Stress';
  
  // Generate profile sections
  const sections = [];
  
  // Energy Pattern
  sections.push(`**Energy Pattern: ${energyType}**\n${getEnergyDescription(energyTime)}`);
  
  // Stress Management
  sections.push(`**Stress Profile: ${stressProfile}**\n${getStressDescription(stressors, hasTimeConstraints)}`);
  
  // Ritual Insight
  if (ritualMentioned) {
    sections.push(`**Personal Rituals**\nYour mention of "${ritualMentioned}" shows you value personal rituals. These structured moments provide stability and predictability in your day.`);
  }
  
  // Relaxation Strategy
  if (relaxationMethod) {
    sections.push(`**Relaxation Strategy**\nYour preferred way to recharge appears to be: ${relaxationMethod}. This suggests you benefit from intentional downtime.`);
  }
  
  // Tips section
  sections.push(`**Personalized Tips**\n${getPersonalizedTips(energyTime, stressors, hasTimeConstraints)}`);
  
  return sections.join('\n\n');
}

function getEnergyDescription(timeOfDay) {
  switch(timeOfDay) {
    case 'morning':
      return 'You tend to have your highest energy in the morning. Consider scheduling demanding tasks early in the day when your focus is naturally stronger.';
    case 'afternoon':
      return 'Your energy peaks in the afternoon. Consider using mornings for preparation and afternoons for execution of important tasks.';
    case 'evening':
      return 'You seem to have more energy later in the day. If possible, shift important work to align with your natural energy cycle.';
    default:
      return 'Your energy patterns appear to fluctuate. Pay attention to when you naturally feel most focused and try to protect those hours for important work.';
  }
}

function getStressDescription(stressors, timeConstraints) {
  if (stressors.length === 0) {
    return 'You appear to manage stress effectively or have created environments with minimal external pressure.';
  }
  
  const stressorsList = stressors.join(', ');
  let description = `Your primary sources of stress appear to be related to ${stressorsList}.`;
  
  if (timeConstraints) {
    description += ' Time pressure seems particularly significant for you.';
  }
  
  return description;
}

function getPersonalizedTips(energyTime, stressors, hasTimeConstraints) {
  const tips = [];
  
  // Energy-based tips
  if (energyTime === 'morning') {
    tips.push('Schedule creative or difficult work before noon');
    tips.push('Consider a morning routine that prepares you for peak performance');
  } else if (energyTime === 'evening') {
    tips.push('If possible, shift important meetings to afternoon slots');
    tips.push('Use mornings for planning and organization rather than intensive work');
  }
  
  // Stress-based tips
  if (stressors.includes('work')) {
    tips.push('Set clearer boundaries between work and personal time');
    tips.push('Schedule short breaks throughout your workday to reset mentally');
  }
  
  if (hasTimeConstraints) {
    tips.push('Practice saying "no" to non-essential commitments');
    tips.push('Consider time-blocking your calendar to protect focused work time');
  }
  
  // General wellbeing tips
  tips.push('Schedule daily moments of complete disconnection from technology');
  tips.push('Integrate a brief mindfulness practice into your existing routine');
  
  return tips.map(tip => `• ${tip}`).join('\n');
} 