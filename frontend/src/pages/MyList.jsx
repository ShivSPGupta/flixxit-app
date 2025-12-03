import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFavorites, removeFromFavorites } from '../redux/slices/favoritesSlice';
import Navbar from '../components/Navbar';

const MyList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(getFavorites());
  }, [dispatch]);

  const handleRemove = (imdbID) => {
    dispatch(removeFromFavorites(imdbID));
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12">
        <h1 className="text-4xl font-bold mb-8">My List</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : list.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {list.map((movie) => (
              <div key={movie.imdbID} className="relative group">
                <div
                  onClick={() => navigate(`/movie/${movie.imdbID}`)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <img
                    src={movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/200x300?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-auto rounded"
                  />
                  <h3 className="mt-2 font-semibold text-sm line-clamp-2">
                    {movie.title}
                  </h3>
                </div>
                
                <button
                  onClick={() => handleRemove(movie.imdbID)}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl mb-2">Your list is empty</p>
            <p>Add movies to your list to watch them later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;