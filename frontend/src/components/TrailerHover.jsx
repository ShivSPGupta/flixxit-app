import { useEffect, useState } from 'react';
import api from '../api/axios';

const TrailerHover = ({ movie, onClose }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrailer = async () => {
      try {
        const response = await api.get(`/movies/trailer/${encodeURIComponent(movie.Title)}`);
        setTrailerKey(response.data.trailerKey);
      } catch (error) {
        console.error('Failed to load trailer');
      } finally {
        setLoading(false);
      }
    };

    fetchTrailer();
  }, [movie.Title]);

  if (loading) {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded z-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!trailerKey) {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded z-20">
        <p className="text-gray-400">No trailer available</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 rounded overflow-hidden z-20 shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
        title={movie.Title}
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; encrypted-media"
      />
    </div>
  );
};

export default TrailerHover;