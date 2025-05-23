import axios from 'axios';

interface Profile {
  name?: string;
  goals?: string[];
  preferences?: Record<string, any>;
  dob?: string;
  ageRange?: string;
  context?: string;
  hobbies?: string[];
  deepInsights?: string[];
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface WeatherResponse {
  current: any; // You can type this more specifically based on the API response
}

interface MusicResponse {
  tracks: {
    track: any[]; // You can type this more specifically based on the API response
  };
}

interface NewsResponse {
  results: any[]; // You can type this more specifically based on the API response
}

export async function fetchDailySong(profileData: Profile): Promise<string> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `You are a music curator who specializes in recommending songs based on a person's life context and interests. 
    Consider the following profile:
    - Age Range: ${profileData.ageRange || 'Not specified'}
    - Life Context: ${profileData.context || 'Not specified'}
    - Hobbies: ${profileData.hobbies?.join(', ') || 'Not specified'}
    - Deep Insights: ${profileData.deepInsights?.join(', ') || 'Not specified'}

    Based on this profile, recommend ONE song that would resonate with them today. Include:
    1. Song title
    2. Artist
    3. A brief (1-2 sentences) explanation of why this song matches their profile
    
    Format the response as: "Song Title - Artist | Reason"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable music curator who makes personalized song recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json() as OpenAIResponse;
    console.log('OpenAI API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error fetching daily song recommendation:', error);
    throw new Error('Failed to get song recommendation. Please try again later.');
  }
}

export async function fetchQuestions(): Promise<string[]> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing');
    }

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generator. Generate 3 interesting quiz questions.'
          },
          {
            role: 'user',
            content: 'Generate 3 quiz questions about general knowledge.'
          }
        ],
        temperature: 0.7
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Raw API response:', data);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || JSON.stringify(data)}`);
    }

    if (!data || !data.choices) {
      throw new Error(`Invalid response structure: ${JSON.stringify(data)}`);
    }

    if (data.choices.length === 0) {
      throw new Error('No choices returned from OpenAI');
    }

    if (!data.choices[0]?.message?.content) {
      throw new Error(`Invalid choice structure: ${JSON.stringify(data.choices[0])}`);
    }

    const questions = data.choices[0].message.content
      .split('\n')
      .filter((line: string) => line.trim().length > 0);

    if (questions.length === 0) {
      throw new Error('No questions generated');
    }

    console.log('Generated questions:', questions);
    return questions;

  } catch (error: any) {
    console.error('Detailed error in fetchQuestions:', {
      error,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }
}

export async function fetchWeather(latitude: number, longitude: number) {
  const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_WEATHER_API_KEY}&q=${latitude},${longitude}`);
  const data = await response.json() as WeatherResponse;
  return data.current;
}

export async function fetchMusic() {
  const response = await fetch(`http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&format=json`);
  const data = await response.json() as MusicResponse;
  return data.tracks.track;
}

export async function fetchNews() {
  const response = await fetch(`https://api.polygon.io/v2/reference/news?apiKey=${import.meta.env.VITE_POLYGON_API_KEY}`);
  const data = await response.json() as NewsResponse;
  return data.results;
} 