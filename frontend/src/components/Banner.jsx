import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieRow } from '../redux/slices/moviesSlice';
import { addToFavorites } from '../redux/slices/favoritesSlice';

const Banner = () => {
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows } = useSelector((state) => state.movies);
  const { list } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(getMovieRow({ keyword: 'trending' }));
  }, [dispatch]);

useEffect(() => {
  if (rows.trending?.length > 0) {
    queueMicrotask(() => {
      const randomMovie =
        rows.trending[Math.floor(Math.random() * rows.trending.length)];
      setMovie(randomMovie);
    });
  }
}, [rows.trending]);

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  const isInList = movie && list.some(item => item.imdbID === movie.imdbID);

  const handleAddToList = () => {
    if (movie && !isInList) {
      dispatch(addToFavorites({
        imdbID: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster
      }));
    }
  };

  if (!movie) return null;

  return (
    <header
      className="relative h-[70vh] bg-cover bg-center"
      style={{
        backgroundImage: `url(${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/1920x1080?text=No+Image'})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      
      <div className="relative h-full flex flex-col justify-center px-4 md:px-12 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {movie.Title}
        </h1>
        
        <div className="flex space-x-3 mb-4">
          <button
            onClick={() => navigate(`/movie/${movie.imdbID}`)}
            className="flex items-center bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition font-semibold"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Play
          </button>
          
          <button
            onClick={handleAddToList}
            disabled={isInList}
            className={`flex items-center ${
              isInList ? 'bg-gray-600' : 'bg-gray-500/70 hover:bg-gray-500'
            } text-white px-6 py-2 rounded transition font-semibold`}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isInList ? 'In My List' : 'My List'}
          </button>
        </div>
        
        <p className="text-lg mb-4 max-w-xl">
          {truncate(movie.Plot || 'Click to see more details about this title.', 150)}
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </header>
  );
};

export default Banner;