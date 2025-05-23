interface ApiKeys {
  openai: string;
  weather: string;
  lastfm: string;
  polygon: string;
  news: string;
}

export const apiKeys: ApiKeys = {
  openai: import.meta.env.VITE_OPENAI_API_KEY,
  weather: import.meta.env.VITE_WEATHER_API_KEY,
  lastfm: import.meta.env.VITE_LASTFM_API_KEY,
  polygon: import.meta.env.VITE_POLYGON_API_KEY,
  news: import.meta.env.VITE_NEWS_API_KEY,
};

export function validateApiKeys(): string[] {
  const missingKeys: string[] = [];
  
  Object.entries(apiKeys).forEach(([key, value]) => {
    if (!value || value === 'YOUR_API_KEY_HERE') {
      missingKeys.push(key);
    }
  });
  
  return missingKeys;
}

export function getApiKey(key: keyof ApiKeys): string {
  const value = apiKeys[key];
  if (!value || value === 'YOUR_API_KEY_HERE') {
    throw new Error(`Missing or invalid API key: ${key}`);
  }
  return value;
} 