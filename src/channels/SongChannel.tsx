import React, { useEffect, useState } from 'react';

interface SongData {
  name: string;
  artist: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
}

interface SongChannelProps {
  userMusicService: 'spotify' | 'appleMusic';
}

const SongChannel: React.FC<SongChannelProps> = ({ userMusicService }) => {
  const [song, setSong] = useState<SongData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded recommended song since we're not using an API
  useEffect(() => {
    setSong({
      name: "Blinding Lights",
      artist: "The Weeknd",
      spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
      appleMusicUrl: "https://music.apple.com/us/album/blinding-lights/1499378108?i=1499378615"
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-gray-500">Loading music recommendation...</div>
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

  if (!song) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-gray-500">No song recommendation available</div>
      </div>
    );
  }

  const musicUrl = userMusicService === 'spotify' ? song.spotifyUrl : song.appleMusicUrl;
  const serviceName = userMusicService === 'spotify' ? 'Spotify' : 'Apple Music';

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-semibold mb-4">Music Recommendation</h2>
      <div className="space-y-2">
        <p className="text-lg font-medium">{song.name}</p>
        <p className="text-gray-600">{song.artist}</p>
        {musicUrl && (
          <a
            href={musicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-black hover:text-gray-600"
          >
            Listen on {serviceName} →
          </a>
        )}
      </div>
    </div>
  );
};

export default SongChannel; 