import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieRow } from '../redux/slices/moviesSlice';
import { addToFavorites } from '../redux/slices/favoritesSlice';

const Banner = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows } = useSelector((state) => state.movies);
  const { list } = useSelector((state) => state.favorites);
  const fallbackPoster = 'https://via.placeholder.com/1920x1080?text=No+Image';
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    dispatch(getMovieRow({ keyword: 'trending' }));
  }, [dispatch]);

  useEffect(() => {
    if (!rows.trending?.length) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % rows.trending.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [rows.trending]);

  const safeIndex = rows.trending?.length
    ? currentIndex % rows.trending.length
    : 0;

  const movie = rows.trending?.[safeIndex] || rows.trending?.[0] || null;

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
      key={movie.imdbID}
      className="relative min-h-[70vh] overflow-hidden bg-cover bg-center transition-all duration-700 ease-in-out md:h-[70vh]"
      style={{
        backgroundImage: `url(${movie.Poster !== 'N/A' ? movie.Poster : fallbackPoster})`,
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      
      <div className="relative flex min-h-[70vh] flex-col justify-end px-4 pb-20 pt-28 sm:pb-24 md:px-12 md:pt-0">
        <div className="max-w-2xl transition-opacity duration-700">
          <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          {movie.Title}
          </h1>
        
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate(`/movie/${movie.imdbID}`)}
              className="inline-flex items-center justify-center bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              <svg className="mr-2 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Play
            </button>
            
            <button
              onClick={handleAddToList}
              disabled={isInList}
              className={`inline-flex items-center justify-center px-6 py-3 font-semibold transition ${
                isInList ? 'bg-gray-600 text-white' : 'bg-gray-500/70 text-white hover:bg-gray-500'
              }`}
            >
              <svg className="mr-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isInList ? 'In My List' : 'My List'}
            </button>
          </div>

          <p className="mt-5 max-w-xl text-base text-gray-100 sm:text-lg">
            {truncate(movie.Plot || 'Click to see more details about this title.', 150)}
          </p>
        </div>

        {rows.trending?.length > 1 && (
          <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {rows.trending.map((item, index) => (
              <button
                key={item.imdbID}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === safeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label={`Show featured movie ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </header>
  );
};

export default Banner;
