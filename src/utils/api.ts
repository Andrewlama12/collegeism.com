import axios from 'axios';
import { debounce } from 'lodash';

interface CacheItem<T> {
  timestamp: number;
  data: T;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

function parseContent(raw: string): string[] {
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
  } catch {}
  return raw
    .split(/\r?\n|,\s*/)
    .map((s) => s.trim())
    .filter((s) => s);
}

// The single, robust implementation of fetchNextBubbles
export async function fetchNextBubbles(
  systemPrompt: string,
  profileData: any,
  retries = 2
): Promise<string[]> {
  if (!OPENAI_KEY) throw new Error('OpenAI API Key is missing');
  try {
    console.log('➡️ Prompt:', systemPrompt, profileData);
    const res = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(profileData) },
        ],
        temperature: 0.8,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
      }
    );
    const raw = res.data.choices[0].message.content;
    console.log('✅ Raw response:', raw);
    const items = parseContent(raw);
    if (items.length === 0) throw new Error('Parsed zero items');
    return items;
  } catch (err: any) {
    if (retries > 0) {
      console.warn('⚠️ parse error, retrying...', err.message);
      return fetchNextBubbles(systemPrompt, profileData, retries - 1);
    }
    console.error('❌ Invalid response format from API', err);
    throw new Error('Invalid response format from API');
  }
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MIN_INTERVAL = 1500; // 1.5 seconds in milliseconds
let lastRequestTime = 0;

const api = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  }
});

const getFromCache = <T>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const item: CacheItem<T> = JSON.parse(cached);
  if (Date.now() - item.timestamp > CACHE_TTL) {
    localStorage.removeItem(key);
    return null;
  }

  return item.data;
};

const setCache = <T>(key: string, data: T): void => {
  const item: CacheItem<T> = {
    timestamp: Date.now(),
    data
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
};

const makeOpenAIRequest = async (messages: any[], cacheKey: string) => {
  const cachedResponse = getFromCache<string>(cacheKey);
  if (cachedResponse) {
    console.log('📦 Using cached response for:', cacheKey);
    return JSON.parse(cachedResponse);
  }

  await throttleRequest();

  try {
    // Log the API key (first 4 chars and last 4 chars for security)
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    const maskedKey = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'undefined';
    console.log('🔑 Using OpenAI key:', maskedKey);
    console.log('🔑 API key length:', apiKey.length);

    // Log the complete request payload
    const requestPayload = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0,
      frequency_penalty: 0
    };
    
    console.group('📤 OpenAI Request Details');
    console.log('URL:', 'https://api.openai.com/v1/chat/completions');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${maskedKey}`
    });
    console.log('Payload:', requestPayload);
    console.groupEnd();

    const response = await api.post<OpenAIResponse>('/chat/completions', requestPayload);

    // Log the complete response
    console.group('📥 OpenAI Response Details');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    console.groupEnd();

    // Validate response format
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const result = response.data.choices[0].message.content;
    setCache(cacheKey, result);
    return JSON.parse(result);
  } catch (error: any) {
    console.group('❌ OpenAI API Error Details');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Headers:', error.response?.headers);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
    console.groupEnd();

    // Throw a more detailed error
    throw new Error(
      error.response?.data?.error?.message || 
      error.message || 
      'Failed to generate response. Please try again later.'
    );
  }
};

// Batched quiz tree fetching
export const fetchQuizTree = async (profile: any) => {
  const cacheKey = `quizTree:${JSON.stringify(profile)}`;
  const cachedTree = getFromCache<any>(cacheKey);
  if (cachedTree) return cachedTree;

  const systemPrompt = `Given a user profile, generate a complete quiz tree with the following structure:
  {
    "initial": [{"id": "string", "text": "string"}],
    "context": [{"id": "string", "text": "string"}],
    "hobbies": [{"id": "string", "text": "string"}],
    "deep": [{"id": "string", "text": "string"}]
  }
  
  Each section should have 3-5 relevant questions based on the profile context.
  Initial: General lifestyle questions
  Context: Life stage specific questions
  Hobbies: Interest-based questions
  Deep: Thought-provoking personal growth questions`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(profile) }
  ];

  const result = await makeOpenAIRequest(messages, cacheKey);
  return result;
};

// Optimized fetchDailySong with 24-hour caching
export async function fetchDailySong(profile: any) {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `dailySong:${today}`;
  
  const cached = getFromCache<any>(cacheKey);
  if (cached) return cached;

  // Only send relevant profile data
  const relevantProfile = {
    ageRange: profile.ageRange,
    hobbies: profile.hobbies,
    context: profile.context
  };

  const messages = [
    {
      role: 'system',
      content: 'You are a music curator. Given a user profile, suggest a song that matches their interests and context. Return response in this exact format: {"title": "song title", "artist": "artist name", "reason": "brief explanation"}'
    },
    {
      role: 'user',
      content: JSON.stringify(relevantProfile)
    }
  ];

  try {
    if (!OPENAI_KEY) throw new Error('OpenAI API Key is missing');
    
    const res = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
      }
    );

    const raw = res.data.choices[0].message.content;
    console.log('✅ Raw song response:', raw);
    
    try {
      const songData = JSON.parse(raw);
      if (!songData.title || !songData.artist || !songData.reason) {
        throw new Error('Invalid song data format');
      }
      setCache(cacheKey, songData);
      return songData;
    } catch (parseErr) {
      throw new Error('Failed to parse song recommendation');
    }
  } catch (err: any) {
    console.error('Error fetching daily song:', err);
    throw new Error('Failed to get song recommendation');
  }
} 