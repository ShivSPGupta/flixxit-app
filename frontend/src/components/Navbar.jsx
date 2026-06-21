import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import SearchBar from "./SearchBar";

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black" : "bg-gradient-to-b from-black to-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-12 md:py-4">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link to="/home" className="text-netflix shrink-0 text-2xl font-bold sm:text-3xl">
            FLIXXIT
          </Link>
          <div className="hidden space-x-6 md:flex">
            <Link to="/home" className="hover:text-gray-300 transition">
              Home
            </Link>
            <Link to="/mylist" className="hover:text-gray-300 transition">
              My List
            </Link>
          </div>

          {/* Mobile Navigation - ONLY My List */}
          <div className="flex md:hidden">
            <Link to="/mylist" className="whitespace-nowrap text-sm transition hover:text-gray-300 sm:text-base">
              My List
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <SearchBar />

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2"
            >
              <img
                src={user?.avatar}
                alt="Avatar"
                className="h-8 w-8 rounded"
              />
              <svg
                className={`w-4 h-4 transition-transform ${
                  showMenu ? "rotate-180" : ""
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
