import React, { useEffect, useState, useCallback } from 'react';

interface WeatherData {
  condition: string;
  temperature: number;
  location: string;
}

interface WeatherChannelProps {
  userLocation: string;
}

const WeatherIcons: { [key: string]: string } = {
  'Clear': 'M12 3v2M12 19v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M3 12h2M19 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z',
  'Cloudy': 'M3 15h.17A6.002 6.002 0 0118 12.17a4 4 0 11-2 7.83H6a4 4 0 110-8c.22 0 .44.02.65.05',
  'Rain': 'M8 19v2m4-2v2m4-2v2M3 15h.17A6.002 6.002 0 0118 12.17a4 4 0 11-2 7.83H6a4 4 0 110-8c.22 0 .44.02.65.05',
  'Snow': 'M12 3v17m4-4l-4 4-4-4m8-9l-4-4-4 4',
  'default': 'M3 15h.17A6.002 6.002 0 0118 12.17a4 4 0 11-2 7.83H6a4 4 0 110-8c.22 0 .44.02.65.05'
};

const WeatherChannel: React.FC<WeatherChannelProps> = ({ userLocation }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = useCallback(async (signal?: AbortSignal) => {
    if (!apiKey) {
      setError('Weather API key not found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(userLocation)}&aqi=no`,
        signal ? { signal } : undefined
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      
      setWeather({
        condition: data.current.condition.text,
        temperature: Math.round(data.current.temp_f),
        location: `${data.location.name}, ${data.location.region}`
      });
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while fetching weather data');
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey, userLocation]);

  useEffect(() => {
    const controller = new AbortController();
    fetchWeather(controller.signal);
    return () => controller.abort();
  }, [fetchWeather]);

  const getWeatherIcon = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return WeatherIcons['Clear'];
    if (lowerCondition.includes('cloud')) return WeatherIcons['Cloudy'];
    if (lowerCondition.includes('rain')) return WeatherIcons['Rain'];
    if (lowerCondition.includes('snow')) return WeatherIcons['Snow'];
    return WeatherIcons['default'];
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-gray-500">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-gray-500">No weather data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">{weather.temperature}°F</h2>
          <p className="text-gray-600">{weather.location}</p>
        </div>
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d={getWeatherIcon(weather.condition)} />
        </svg>
      </div>
      <p className="text-gray-500 mt-2">{weather.condition}</p>
    </div>
  );
};

export default WeatherChannel; 