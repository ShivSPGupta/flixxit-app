import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black' : 'bg-gradient-to-b from-black to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center space-x-8">
          <Link to="/home" className="text-netflix text-3xl font-bold">
            FLIXXIT
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/home" className="hover:text-gray-300 transition">
              Home
            </Link>
            <Link to="/mylist" className="hover:text-gray-300 transition">
              My List
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SearchBar />
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2"
            >
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded"
              />
              <svg
                className={`w-4 h-4 transition-transform ${
                  showMenu ? 'rotate-180' : ''
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-gray-700 rounded shadow-lg">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-800 transition"
                  onClick={() => setShowMenu(false)}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-800 transition"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;