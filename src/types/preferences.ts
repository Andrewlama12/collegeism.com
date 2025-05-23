export interface ContentPreference {
  id: string;
  type: 'news' | 'music';
  liked: boolean;
  timestamp: string;
  // Add content metadata for analysis
  categories?: string[];
  mood?: string;
  tempo?: string;
  topics?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface PersonalityTraits {
  // Big Five personality dimensions (OCEAN model)
  openness: number;        // Curiosity and openness to experience
  conscientiousness: number; // Organization and responsibility
  extraversion: number;    // Social engagement and energy
  agreeableness: number;   // Compassion and cooperativeness
  neuroticism: number;     // Emotional sensitivity and stability
  
  // Content preferences
  preferredTopics: string[];
  preferredMoods: string[];
  preferredComplexity: 'simple' | 'moderate' | 'complex';
  
  // Learning patterns
  learningStyle: {
    visual: number;
    auditory: number;
    reading: number;
    kinesthetic: number;
  };
  
  // Time-based preferences
  activeHours: {
    start: number;
    end: number;
  };
  
  // Update frequency
  lastUpdated: string;
}

export interface UserPreferences {
  likedNews: string[];
  dislikedNews: string[];
  likedMusic: string[];
  dislikedMusic: string[];
  personality: PersonalityTraits;
}

const PREFERENCES_KEY = 'user_preferences';

const DEFAULT_PERSONALITY: PersonalityTraits = {
  openness: 0.5,
  conscientiousness: 0.5,
  extraversion: 0.5,
  agreeableness: 0.5,
  neuroticism: 0.5,
  preferredTopics: [],
  preferredMoods: [],
  preferredComplexity: 'moderate',
  learningStyle: {
    visual: 0.25,
    auditory: 0.25,
    reading: 0.25,
    kinesthetic: 0.25
  },
  activeHours: {
    start: 9,
    end: 17
  },
  lastUpdated: new Date().toISOString()
};

const DEFAULT_PREFERENCES: UserPreferences = {
  likedNews: [],
  dislikedNews: [],
  likedMusic: [],
  dislikedMusic: [],
  personality: DEFAULT_PERSONALITY
};

// Helper function to update personality traits based on content interaction
const updatePersonalityTraits = (
  personality: PersonalityTraits,
  content: ContentPreference,
  liked: boolean
): PersonalityTraits => {
  const newPersonality = { ...personality };
  
  // Update based on content interaction
  if (content.categories) {
    // Adjust openness based on content variety
    const varietyScore = liked ? 0.01 : -0.005;
    newPersonality.openness = Math.max(0, Math.min(1, newPersonality.openness + varietyScore));
  }
  
  if (content.complexity) {
    // Update preferred complexity
    newPersonality.preferredComplexity = content.complexity;
  }
  
  if (content.topics) {
    // Update preferred topics
    const newTopics = new Set([...newPersonality.preferredTopics]);
    if (liked) {
      content.topics.forEach(topic => newTopics.add(topic));
    }
    newPersonality.preferredTopics = Array.from(newTopics);
  }
  
  if (content.mood) {
    // Update preferred moods
    const newMoods = new Set([...newPersonality.preferredMoods]);
    if (liked) {
      newMoods.add(content.mood);
    }
    newPersonality.preferredMoods = Array.from(newMoods);
  }
  
  // Update timestamp
  newPersonality.lastUpdated = new Date().toISOString();
  
  return newPersonality;
};

export const getPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    const prefs = JSON.parse(stored);
    // Ensure all properties exist with defaults
    return {
      likedNews: prefs.likedNews || [],
      dislikedNews: prefs.dislikedNews || [],
      likedMusic: prefs.likedMusic || [],
      dislikedMusic: prefs.dislikedMusic || [],
      personality: {
        ...DEFAULT_PERSONALITY,
        ...prefs.personality
      }
    };
  } catch (error) {
    console.error('Error getting preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const savePreference = (content: ContentPreference): UserPreferences => {
  try {
    const prefs = getPreferences();
    
    if (content.liked) {
      // Add to liked list if not already there
      if (content.type === 'news') {
        if (!prefs.likedNews.includes(content.id)) {
          prefs.likedNews.push(content.id);
        }
        prefs.dislikedNews = prefs.dislikedNews.filter(id => id !== content.id);
      } else {
        if (!prefs.likedMusic.includes(content.id)) {
          prefs.likedMusic.push(content.id);
        }
        prefs.dislikedMusic = prefs.dislikedMusic.filter(id => id !== content.id);
      }
    } else {
      // Add to disliked list if not already there
      if (content.type === 'news') {
        if (!prefs.dislikedNews.includes(content.id)) {
          prefs.dislikedNews.push(content.id);
        }
        prefs.likedNews = prefs.likedNews.filter(id => id !== content.id);
      } else {
        if (!prefs.dislikedMusic.includes(content.id)) {
          prefs.dislikedMusic.push(content.id);
        }
        prefs.likedMusic = prefs.likedMusic.filter(id => id !== content.id);
      }
    }
    
    // Update personality traits based on the interaction
    prefs.personality = updatePersonalityTraits(prefs.personality, content, content.liked);
    
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    return prefs;
  } catch (error) {
    console.error('Error saving preference:', error);
    return DEFAULT_PREFERENCES;
  }
}; 