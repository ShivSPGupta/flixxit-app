import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  deleteAccount,
  reset 
} from '../redux/slices/authSlice';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isSuccess, message } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    avatar: user?.avatar || '',
  });
  const [emailData, setEmailData] = useState({
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isSuccess && message) {
      alert(message);
      dispatch(reset());
    }
  }, [isSuccess, message, dispatch]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profileData));
  };

  const handleEmailUpdate = (e) => {
    e.preventDefault();
    dispatch(updateEmail(emailData));
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    dispatch(updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }));

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      dispatch(deleteAccount());
      navigate('/login');
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-4 ${
              activeTab === 'profile'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-4 px-4 ${
              activeTab === 'email'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-4 px-4 ${
              activeTab === 'password'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`pb-4 px-4 ${
              activeTab === 'danger'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Danger Zone
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center space-x-6 mb-6">
              <img
                src={profileData.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded"
              />
              <div>
                <h3 className="text-xl font-semibold">{user?.email}</h3>
                <p className="text-gray-400">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
              />
            </div>
            
            <button
              type="submit"
              className="bg-netflix hover:bg-red-700 text-white px-6 py-2 rounded transition"
            >
              Save Changes
            </button>
          </form>
        )}
        
        {/* Email Tab */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData({ email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-netflix hover:bg-red-700 text-white px-6 py-2 rounded transition"
            >
              Update Email
            </button>
          </form>
        )}
        
        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              className="bg-netflix hover:bg-red-700 text-white px-6 py-2 rounded transition"
            >
              Change Password
            </button>
          </form>
        )}
        
        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-900 rounded p-6">
              <h3 className="text-xl font-semibold text-red-500 mb-2">Delete Account</h3>
              <p className="text-gray-300 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {showDeleteConfirm && (
                <div className="bg-red-900/30 border border-red-700 rounded p-4 mb-4">
                  <p className="font-semibold mb-2">Are you absolutely sure?</p>
                  <p className="text-sm text-gray-300 mb-3">
                    This action cannot be undone. This will permanently delete your account and remove all your data.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                    >
                      Yes, delete my account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;