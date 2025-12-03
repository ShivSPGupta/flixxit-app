import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchMovies, clearSearchResults } from '../redux/slices/moviesSlice';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.movies);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        dispatch(searchMovies(query));
        setShowResults(true);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      dispatch(clearSearchResults());
      setShowResults(false);
    }
  }, [query, dispatch]);

  const handleMovieClick = (imdbID) => {
    navigate(`/movie/${imdbID}`);
    setQuery('');
    setShowResults(false);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-800 rounded transition"
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
          <form onSubmit={handleSubmit} className="ml-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Titles, people, genres"
              className="bg-black/70 border border-white px-4 py-1 rounded text-sm focus:outline-none focus:border-white w-64"
              autoFocus
            />
          </form>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-black/95 border border-gray-700 rounded shadow-xl">
          {searchResults.slice(0, 5).map((movie) => (
            <button
              key={movie.imdbID}
              onClick={() => handleMovieClick(movie.imdbID)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-800 transition w-full text-left"
            >
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/50x75?text=No+Image'}
                alt={movie.Title}
                className="w-12 h-16 object-cover rounded"
              />
              <div>
                <p className="font-semibold">{movie.Title}</p>
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