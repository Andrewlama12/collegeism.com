import { getApiKey } from './apiKeys';

interface ApiError {
  message: string;
  status?: number;
}

export class ApiClient {
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const error: ApiError = {
        message: `API request failed: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }
    return response.json();
  }

  static async fetchWeather(city: string) {
    const apiKey = getApiKey('weather');
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    return this.handleResponse(response);
  }

  static async fetchNews(category: string) {
    const apiKey = getApiKey('news');
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}`
    );
    return this.handleResponse(response);
  }

  static async fetchSongRecommendations(genre: string) {
    const apiKey = getApiKey('lastfm');
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${genre}&api_key=${apiKey}&format=json`
    );
    return this.handleResponse(response);
  }

  static async fetchStockData(symbol: string) {
    const apiKey = getApiKey('polygon');
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${apiKey}`
    );
    return this.handleResponse(response);
  }

  static async getAIResponse(prompt: string) {
    const apiKey = getApiKey('openai');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    return this.handleResponse(response);
  }
} 