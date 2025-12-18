import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchMovies } from '../redux/slices/moviesSlice';
import Navbar from '../components/Navbar';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults, isLoading } = useSelector((state) => state.movies);

  useEffect(() => {
    if (query) {
      dispatch(searchMovies(query));
    }
  }, [query, dispatch]);

  // Remove duplicates with useMemo for performance
  const uniqueResults = useMemo(() => {
    const seen = new Set();
    return searchResults.filter(movie => {
      if (seen.has(movie.imdbID)) {
        return false;
      }
      seen.add(movie.imdbID);
      return true;
    });
  }, [searchResults]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12">
        <h1 className="text-3xl font-bold mb-8">
          Search results for "{query}"
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : uniqueResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {uniqueResults.map((movie) => (
              <div
                key={movie.imdbID}
                onClick={() => navigate(`/movie/${movie.imdbID}`)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}
                  alt={movie.Title}
                  className="w-full h-auto rounded"
                />
                <h3 className="mt-2 font-semibold text-sm line-clamp-2">
                  {movie.Title}
                </h3>
                <p className="text-sm text-gray-400">{movie.Year}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl">No results found for "{query}"</p>
            <p className="mt-2">Try different keywords or check your spelling</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;