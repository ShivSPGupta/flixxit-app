import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMovieDetail, clearMovieDetail } from '../redux/slices/moviesSlice';
import { addToFavorites, removeFromFavorites } from '../redux/slices/favoritesSlice';
import Navbar from '../components/Navbar';
import { resolvePosterUrl, posterFallback } from '../utils/posterUrl';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { movieDetail, detail, rows, searchResults } = useSelector((state) => state.movies);
  const { list } = useSelector((state) => state.favorites);
  const [playTrailer, setPlayTrailer] = useState(false);

  const normalizeFallbackMovie = (movie) => {
    if (!movie) return null;

    return {
      imdbID: String(movie.imdbID || id),
      Title: movie.Title || movie.title || 'Untitled',
      Year: movie.Year || 'N/A',
      Poster: movie.Poster || movie.poster || 'N/A',
      Plot: movie.Plot || 'Details are temporarily limited for this title.',
      imdbRating: 'N/A',
      Runtime: 'N/A',
      Rated: 'N/A',
      Released: movie.Year || 'N/A',
      Director: 'N/A',
      Writer: 'N/A',
      Actors: 'N/A',
      Genre: 'N/A',
      Language: 'N/A',
      Country: 'N/A',
      BoxOffice: 'N/A',
      Awards: 'N/A',
      isPartialDetail: true,
    };
  };

  const findCachedMovie = () => {
    const navigationMovie = normalizeFallbackMovie(location.state?.movie);
    if (navigationMovie) return navigationMovie;

    const rowMovie = Object.values(rows)
      .flatMap((row) => (Array.isArray(row) ? row : []))
      .find((movie) => String(movie.imdbID) === String(id));
    if (rowMovie) return normalizeFallbackMovie(rowMovie);

    const searchMovie = searchResults.find((movie) => String(movie.imdbID) === String(id));
    if (searchMovie) return normalizeFallbackMovie(searchMovie);

    const favoriteMovie = list.find((movie) => String(movie.imdbID) === String(id));
    return normalizeFallbackMovie(favoriteMovie);
  };

  const fallbackMovie = findCachedMovie();
  const displayedMovie = movieDetail || (detail.isError ? fallbackMovie : null);
  const posterUrl = resolvePosterUrl(displayedMovie?.Poster, posterFallback);

  useEffect(() => {
    dispatch(getMovieDetail(id));
    return () => {
      dispatch(clearMovieDetail());
    };
  }, [id, dispatch]);

  if (detail.isError && !displayedMovie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Could not load this title</h1>
          <p className="text-gray-400 mb-6">
            {detail.message || 'Something went wrong while loading the movie details.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => dispatch(getMovieDetail(id))}
              className="bg-white text-black px-5 py-2 rounded font-semibold hover:bg-gray-200 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/home')}
              className="bg-gray-700 text-white px-5 py-2 rounded font-semibold hover:bg-gray-600 transition"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!displayedMovie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  const isInList = list.some(item => item.imdbID === displayedMovie.imdbID);

  const handleToggleList = () => {
    if (isInList) {
      dispatch(removeFromFavorites(displayedMovie.imdbID));
    } else {
      dispatch(addToFavorites({
        imdbID: displayedMovie.imdbID,
        title: displayedMovie.Title,
        poster: displayedMovie.Poster
      }));
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="relative pt-16">
        {/* Hero Section */}
        <div className="relative h-[70vh]">
          {playTrailer && displayedMovie.trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${displayedMovie.trailerKey}?autoplay=1`}
              title={displayedMovie.Title}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={posterUrl}
                alt={displayedMovie.Title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black via-black/70 to-transparent" />
            </>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {displayedMovie.Title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-500 font-semibold">
                {displayedMovie.imdbRating}/10
              </span>
              <span>{displayedMovie.Year}</span>
              <span>{displayedMovie.Runtime}</span>
              <span className="border border-gray-400 px-2">{displayedMovie.Rated}</span>
            </div>

            {displayedMovie.isPartialDetail && (
              <p className="max-w-2xl text-sm text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 mb-4">
                Showing limited cached details because the movie service is temporarily slow.
              </p>
            )}
            
            <div className="flex space-x-3">
              {displayedMovie.trailerKey && (
                <button
                  onClick={() => setPlayTrailer(!playTrailer)}
                  className="flex items-center bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition font-semibold"
                >
                  {playTrailer ? (
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 5.5A1.5 1.5 0 016.5 4h7A1.5 1.5 0 0115 5.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 12.5v-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  )}
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
                {displayedMovie.Plot}
              </p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Director:</span>{' '}
                  <span>{displayedMovie.Director}</span>
                </div>
                <div>
                  <span className="text-gray-400">Writers:</span>{' '}
                  <span>{displayedMovie.Writer}</span>
                </div>
                <div>
                  <span className="text-gray-400">Stars:</span>{' '}
                  <span>{displayedMovie.Actors}</span>
                </div>
                <div>
                  <span className="text-gray-400">Genre:</span>{' '}
                  <span>{displayedMovie.Genre}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Additional Info</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Released:</span>{' '}
                  <span>{displayedMovie.Released}</span>
                </div>
                <div>
                  <span className="text-gray-400">Language:</span>{' '}
                  <span>{displayedMovie.Language}</span>
                </div>
                <div>
                  <span className="text-gray-400">Country:</span>{' '}
                  <span>{displayedMovie.Country}</span>
                </div>
                <div>
                  <span className="text-gray-400">Box Office:</span>{' '}
                  <span>{displayedMovie.BoxOffice || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Awards:</span>{' '}
                  <span>{displayedMovie.Awards}</span>
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
