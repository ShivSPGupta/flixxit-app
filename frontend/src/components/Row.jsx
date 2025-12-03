import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieRow } from '../redux/slices/moviesSlice';
import MovieCard from './MovieCard';

const Row = ({ title, keyword, isLarge = false }) => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const rowRef = useRef(null);
  const dispatch = useDispatch();
  const { rows } = useSelector((state) => state.movies);

  useEffect(() => {
    dispatch(getMovieRow({ keyword }));
  }, [dispatch, keyword]);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const movies = rows[keyword] || [];

  if (!movies.length) return null;

  return (
    <div className="py-4 px-4 md:px-12 relative group">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      
      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/70 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex space-x-2 overflow-x-scroll scrollbar-hide scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} isLarge={isLarge} />
          ))}
        </div>
        
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/70 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Row;