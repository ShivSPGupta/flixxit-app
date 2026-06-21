import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const TrailerHover = ({ movie }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerError, setTrailerError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchTrailer = async () => {
      try {
        const response = await api.get(`/movies/trailer/${encodeURIComponent(movie.Title)}`);
        if (!cancelled) {
          setTrailerKey(response.data.trailerKey);
          setTrailerError(false);
        }
      } catch {
        if (!cancelled) {
          setTrailerKey(null);
          setTrailerError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTrailer();
    return () => {
      cancelled = true;
    };
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
        <div className="text-center px-4">
          <p className="text-gray-200 font-medium">
            {trailerError ? 'Trailer unavailable' : 'No trailer available'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            We could not find a playable trailer for this title.
          </p>
          <Link
            to={`/movie/${movie.imdbID}`}
            className="mt-4 inline-flex items-center justify-center rounded bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            Open details
          </Link>
        </div>
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
