export interface ContentPreference {
  id: string;
  type: 'news' | 'music';
  liked: boolean;
  timestamp: string;
}

export interface UserPreferences {
  likedNews: string[];
  dislikedNews: string[];
  likedMusic: string[];
  dislikedMusic: string[];
}

export const getPreferences = (): UserPreferences => {
  const stored = localStorage.getItem('user_preferences');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    likedNews: [],
    dislikedNews: [],
    likedMusic: [],
    dislikedMusic: []
  };
};

export const savePreference = (content: ContentPreference) => {
  const prefs = getPreferences();
  const key = content.liked ? 'liked' : 'disliked';
  const type = `${content.type}` as 'News' | 'Music';
  
  // Remove from opposite list if it exists
  const oppositeKey = content.liked ? 'disliked' : 'liked';
  prefs[`${oppositeKey}${type}` as keyof UserPreferences] = 
    prefs[`${oppositeKey}${type}` as keyof UserPreferences].filter(id => id !== content.id);
  
  // Add to appropriate list if not already there
  if (!prefs[`${key}${type}` as keyof UserPreferences].includes(content.id)) {
    prefs[`${key}${type}` as keyof UserPreferences].push(content.id);
  }
  
  localStorage.setItem('user_preferences', JSON.stringify(prefs));
  return prefs;
}; 