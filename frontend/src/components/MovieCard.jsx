import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites } from '../redux/slices/favoritesSlice';
import TrailerHover from './TrailerHover';

const MovieCard = ({ movie, isLarge = false }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.favorites);

  const isInList = list.some(item => item.imdbID === movie.imdbID);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setShowTrailer(true);
    }, 800);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowTrailer(false);
  };

  const handleAddToList = (e) => {
    e.stopPropagation();
    if (isInList) {
      dispatch(removeFromFavorites(movie.imdbID));
    } else {
      dispatch(addToFavorites({
        imdbID: movie.imdbID,
        title: movie.Title,
        poster: movie.Poster
      }));
    }
  };

  const handleClick = () => {
    navigate(`/movie/${movie.imdbID}`);
  };

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer transition-transform hover:scale-105 hover:z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: isLarge ? '300px' : '200px',
        height: isLarge ? '450px' : '300px',
      }}
    >
      <img
        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}
        alt={movie.Title}
        onClick={handleClick}
        className="w-full h-full object-cover rounded"
      />
      
      {showTrailer && (
        <TrailerHover movie={movie} onClose={() => setShowTrailer(false)} />
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 hover:opacity-100 transition-opacity">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{movie.Title}</h3>
        <div className="flex items-center justify-between">
          <button
            onClick={handleClick}
            className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
          
          <button
            onClick={handleAddToList}
            className="bg-gray-700/70 hover:bg-gray-700 rounded-full p-2 transition"
          >
            {isInList ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;