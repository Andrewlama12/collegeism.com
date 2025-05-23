import React, { useState, useEffect } from 'react';
import { FeedbackButtons } from './FeedbackButtons';
import { getPreferences } from '../types/preferences';
import { getProfile } from '../profileStore';

interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  service: 'spotify' | 'appleMusic';
}

export const SongChannel: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const profile = getProfile();
      const prefs = getPreferences();
      
      // Use the user's preferred music service
      const service = profile?.musicService || 'spotify';
      
      const response = await fetch('YOUR_MUSIC_API_ENDPOINT');
      const data = await response.json();
      
      // Filter out disliked songs and prioritize similar to liked ones
      const filteredSongs = data.tracks
        .filter((track: any) => !prefs.dislikedMusic.includes(track.id))
        .map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          url: service === 'spotify' ? track.spotifyUrl : track.appleMusicUrl,
          service
        }));

      setSongs(filteredSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleFeedback = async (songId: string, liked: boolean) => {
    if (liked) {
      // Keep the song and fetch similar ones
      const similarSongs = await fetchSimilarSongs(songId);
      setSongs(prev => [...prev, ...similarSongs]);
    } else {
      // Remove the song and fetch a replacement
      setSongs(prev => prev.filter(item => item.id !== songId));
      const newSong = await fetchNewSong();
      if (newSong) {
        setSongs(prev => [...prev, newSong]);
      }
    }
  };

  const fetchSimilarSongs = async (songId: string): Promise<Song[]> => {
    // Implement API call to fetch similar songs based on the liked song
    return [];
  };

  const fetchNewSong = async (): Promise<Song | null> => {
    // Implement API call to fetch a new random song
    return null;
  };

  if (loading) {
    return <div className="p-4">Loading music recommendations...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {songs.map((song) => (
        <div key={song.id} className="bg-white rounded-lg shadow p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{song.title}</h3>
              <p className="text-sm text-gray-600">{song.artist}</p>
            </div>
            <FeedbackButtons
              contentId={song.id}
              contentType="music"
              onFeedback={(liked) => handleFeedback(song.id, liked)}
            />
          </div>
          <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm inline-flex items-center gap-1"
          >
            Listen on {song.service === 'spotify' ? 'Spotify' : 'Apple Music'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      ))}
    </div>
  );
}; 