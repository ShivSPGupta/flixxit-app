import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSearchResults } from '../redux/slices/moviesSlice';
import { resolvePosterUrl, posterFallback } from '../utils/posterUrl';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows } = useSelector((state) => state.movies);

  const localSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) return [];

    const seen = new Set();
    return Object.values(rows)
      .flatMap((row) => (Array.isArray(row) ? row : []))
      .filter((movie) => {
        const title = String(movie?.Title || '').toLowerCase();
        if (!movie?.imdbID || seen.has(movie.imdbID) || !title.includes(normalizedQuery)) {
          return false;
        }

        seen.add(movie.imdbID);
        return true;
      })
      .slice(0, 6);
  }, [query, rows]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      dispatch(clearSearchResults());
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (movie) => {
    navigate(`/movie/${movie.imdbID}`, { state: { movie } });
    dispatch(clearSearchResults());
    setQuery('');
    setIsOpen(false);
  };

  const showSuggestions = isOpen && localSuggestions.length > 0;

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded p-2 transition hover:bg-gray-800"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {isOpen && (
          <form
            onSubmit={handleSubmit}
            className="fixed left-4 right-4 top-16 z-50 sm:static sm:ml-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Titles, people, genres"
              className="w-full rounded border border-white bg-black/90 px-4 py-2 text-sm focus:border-white focus:outline-none sm:w-64 sm:bg-black/70 sm:py-1"
              autoFocus
            />
          </form>
        )}
      </div>

      {showSuggestions && (
        <div className="fixed left-4 right-4 top-28 z-50 max-h-[60vh] overflow-y-auto rounded border border-gray-700 bg-black/95 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-96 sm:w-80">
          {localSuggestions.map((movie) => (
            <button
              key={movie.imdbID}
              type="button"
              onClick={() => handleSuggestionClick(movie)}
              className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-gray-800"
            >
              <img
                src={resolvePosterUrl(movie.Poster, posterFallback)}
                alt={movie.Title}
                onError={(event) => {
                  event.currentTarget.src = posterFallback;
                }}
                className="h-16 w-12 rounded object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{movie.Title}</p>
                <p className="text-sm text-gray-400">{movie.Year}</p>
              </div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchBar;
