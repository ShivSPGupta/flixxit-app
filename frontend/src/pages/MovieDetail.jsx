import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieDetail, clearMovieDetail } from '../redux/slices/moviesSlice';
import { addToFavorites, removeFromFavorites } from '../redux/slices/favoritesSlice';
import Navbar from '../components/Navbar';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { movieDetail, isLoading } = useSelector((state) => state.movies);
  const { list } = useSelector((state) => state.favorites);
  const [playTrailer, setPlayTrailer] = useState(false);

  useEffect(() => {
    dispatch(getMovieDetail(id));
    return () => {
      dispatch(clearMovieDetail());
    };
  }, [id, dispatch]);

  if (isLoading || !movieDetail) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  const isInList = list.some(item => item.imdbID === movieDetail.imdbID);

  const handleToggleList = () => {
    if (isInList) {
      dispatch(removeFromFavorites(movieDetail.imdbID));
    } else {
      dispatch(addToFavorites({
        imdbID: movieDetail.imdbID,
        title: movieDetail.Title,
        poster: movieDetail.Poster
      }));
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="relative pt-16">
        {/* Hero Section */}
        <div className="relative h-[70vh]">
          {playTrailer && movieDetail.trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${movieDetail.trailerKey}?autoplay=1`}
              title={movieDetail.Title}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={movieDetail.Poster !== 'N/A' ? movieDetail.Poster : 'https://via.placeholder.com/1920x1080?text=No+Image'}
                alt={movieDetail.Title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            </>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {movieDetail.Title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-500 font-semibold">
                {movieDetail.imdbRating}/10
              </span>
              <span>{movieDetail.Year}</span>
              <span>{movieDetail.Runtime}</span>
              <span className="border border-gray-400 px-2">{movieDetail.Rated}</span>
            </div>
            
            <div className="flex space-x-3">
              {movieDetail.trailerKey && (
                <button
                  onClick={() => setPlayTrailer(!playTrailer)}
                  className="flex items-center bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition font-semibold"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  {playTrailer ? 'Stop' : 'Play Trailer'}
                </button>
              )}
              
              <button
                onClick={handleToggleList}
                className={`flex items-center ${
                  isInList ? 'bg-gray-600' : 'bg-gray-500/70 hover:bg-gray-500'
                } text-white px-6 py-3 rounded transition font-semibold`}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isInList ? 'Remove from List' : 'Add to List'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Details Section */}
        <div className="px-4 md:px-12 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {movieDetail.Plot}
              </p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Director:</span>{' '}
                  <span>{movieDetail.Director}</span>
                </div>
                <div>
                  <span className="text-gray-400">Writers:</span>{' '}
                  <span>{movieDetail.Writer}</span>
                </div>
                <div>
                  <span className="text-gray-400">Stars:</span>{' '}
                  <span>{movieDetail.Actors}</span>
                </div>
                <div>
                  <span className="text-gray-400">Genre:</span>{' '}
                  <span>{movieDetail.Genre}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Additional Info</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Released:</span>{' '}
                  <span>{movieDetail.Released}</span>
                </div>
                <div>
                  <span className="text-gray-400">Language:</span>{' '}
                  <span>{movieDetail.Language}</span>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>{' '}
                  <span>{movieDetail.Country}</span>
                </div>
                <div>
                  <span className="text-gray-400">Box Office:</span>{' '}
                  <span>{movieDetail.BoxOffice || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Awards:</span>{' '}
                  <span>{movieDetail.Awards}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;