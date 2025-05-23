import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Profile } from '../types/profile';
import { fetchDailySong } from '../api';
import { fetchNextBubbles } from '../utils/api';

interface DashboardProps {
  profile: Profile;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface LoadingState {
  events: boolean;
  song: boolean;
  products: boolean;
}

interface ErrorState {
  events: string | null;
  song: string | null;
  products: string | null;
}

interface Product {
  name: string;
  imageUrl: string;
  link: string;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ 
    events: false,
    song: false,
    products: false
  });
  const [error, setError] = useState<ErrorState>({ 
    events: null,
    song: null,
    products: null
  });
  const [dailySong, setDailySong] = useState<{ title: string; artist: string; reason: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>('');

  // Fetch daily song on mount
  useEffect(() => {
    const loadDailySong = async () => {
      try {
        setLoading(prev => ({ ...prev, song: true }));
        const songData = await fetchDailySong(profile);
        setDailySong(songData);
      } catch (err) {
        console.error('Error fetching daily song:', err);
        setError(prev => ({ ...prev, song: 'Failed to load daily song' }));
      } finally {
        setLoading(prev => ({ ...prev, song: false }));
      }
    };

    loadDailySong();
  }, [profile]);

  // Fetch product recommendations
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        // Simulated product data
        const mockProducts = [
          {
            name: "Mindfulness Journal",
            imageUrl: "https://placekitten.com/32/32",
            link: "https://example.com/journal"
          },
          {
            name: "Fitness Tracker",
            imageUrl: "https://placekitten.com/32/32",
            link: "https://example.com/tracker"
          },
          {
            name: "Learning Platform Subscription",
            imageUrl: "https://placekitten.com/32/32",
            link: "https://example.com/learn"
          }
        ];
        setProducts(mockProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(prev => ({ ...prev, products: 'Failed to load product recommendations' }));
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    fetchProducts();
  }, [profile]);

  // Get user's location and reverse geocode
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        
        try {
          // Use OpenStreetMap's Nominatim service for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          setLocationName(data.display_name.split(',').slice(0, 2).join(','));
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocationName('Location not available');
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationName('Location access denied');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handlePill = async (pill: string) => {
    try {
      setIsLoading(true);
      const suggestions = await fetchNextBubbles(
        `User says: "${pill}". Given profile answers, return 3 relevant action suggestions as a JSON array of strings.`,
        { answers: profile.answers }
      );
      setQuickActions(suggestions ?? []);
    } catch (e) {
      console.error(e);
      setQuickActions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!coords) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content (3 columns) */}
        <div className="md:col-span-3">
          {/* Location Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Location</h2>
            <p className="text-gray-600">{locationName || 'Loading location...'}</p>
          </div>

          {/* Central Prompt & Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-xl font-bold mb-2">What's on your mind today?</h1>
            <div className="flex gap-2 mb-4">
              {['Need focus', 'Stressed', 'Ideas'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => handlePill(pill)}
                  className="px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-150"
                  disabled={isLoading}
                >
                  {pill}
                </button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ul className="ml-4 space-y-2">
                {quickActions.map((action) => (
                  <li key={action} className="list-disc text-gray-700">
                    {action}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Daily Song */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="font-semibold">🎶 Daily Song</h2>
            {loading.song ? (
              <p className="text-gray-600">Loading your daily song...</p>
            ) : error.song ? (
              <p className="text-red-600">{error.song}</p>
            ) : dailySong && (
              <div className="mt-2">
                <p className="italic">{dailySong.title} - {dailySong.artist}</p>
                <p className="text-sm text-gray-600 mt-1">{dailySong.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 