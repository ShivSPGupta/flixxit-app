import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(reset());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(reset());
      navigate('/home');
    }
  }, [user, navigate, dispatch]);

  const formError = localError || (isError ? message || 'Login failed. Please try again.' : '');

  const handleChange = (e) => {
    setLocalError('');
    if (isError || isSuccess) {
      dispatch(reset());
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{
      backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/a3873901-5b7c-46eb-b9fa-12fea5197bd3/IN-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg)'
    }}>
      <div className="min-h-screen bg-black/70 flex items-center justify-center">
        <div className="bg-black/75 p-8 rounded w-full max-w-md sm:p-12">
          <h1 className="text-3xl font-bold mb-8">Sign In</h1>
          
          {formError && (
            <div className="bg-red-600/20 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-white"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-white"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-netflix hover:bg-red-700 text-white font-semibold py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-gray-400">
            <p>
              New to Flixxit?{' '}
              <Link to="/register" className="text-white hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
