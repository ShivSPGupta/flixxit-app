import { useState } from 'react';
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
  const { user, isLoading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('profile');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
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
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'Not available';
  const accountName = user?.displayName || user?.email || 'Flixxit User';

  const clearFeedback = () => {
    setFormError('');
    setFormSuccess('');
    dispatch(reset());
  };

  const handleTabChange = (tab) => {
    clearFeedback();
    setActiveTab(tab);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    clearFeedback();

    const displayName = profileData.displayName.trim();
    const avatar = profileData.avatar.trim();

    if (displayName.length > 40) {
      setFormError('Display name must be 40 characters or less');
      return;
    }

    try {
      await dispatch(updateProfile({ displayName, avatar })).unwrap();
      setFormSuccess('Profile updated successfully');
    } catch (error) {
      setFormError(error || 'Failed to update profile');
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    clearFeedback();

    const email = emailData.email.trim().toLowerCase();

    if (!email) {
      setFormError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please provide a valid email');
      return;
    }

    try {
      await dispatch(updateEmail({ email })).unwrap();
      setFormSuccess('Email updated successfully');
    } catch (error) {
      setFormError(error || 'Failed to update email');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    clearFeedback();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setFormError('New password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormSuccess('Password updated successfully');
    } catch (error) {
      setFormError(error || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await dispatch(deleteAccount()).unwrap();
      navigate('/login');
    } catch (error) {
      setFormError(error || 'Failed to delete account. Please try again.');
      setFormSuccess('');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>

        {formSuccess && (
          <div className="mb-6 rounded border border-green-600 bg-green-600/15 px-4 py-3 text-green-200">
            {formSuccess}
          </div>
        )}

        {formError && (
          <div className="mb-6 rounded border border-red-600 bg-red-600/15 px-4 py-3 text-red-200">
            {formError}
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => handleTabChange('profile')}
            className={`pb-4 px-4 ${
              activeTab === 'profile'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => handleTabChange('email')}
            className={`pb-4 px-4 ${
              activeTab === 'email'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => handleTabChange('password')}
            className={`pb-4 px-4 ${
              activeTab === 'password'
                ? 'border-b-2 border-netflix text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => handleTabChange('danger')}
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
                <h3 className="text-xl font-semibold">{accountName}</h3>
                {user?.displayName && (
                  <p className="text-gray-400">{user.email}</p>
                )}
                <p className="text-gray-400">Member since {memberSince}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => {
                  clearFeedback();
                  setProfileData({ ...profileData, displayName: e.target.value });
                }}
                maxLength={40}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
              />
              <p className="mt-1 text-sm text-gray-400">
                {profileData.displayName.length}/40 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => {
                  clearFeedback();
                  setProfileData({ ...profileData, avatar: e.target.value });
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-netflix hover:bg-red-700 text-white px-6 py-2 rounded transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
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
                onChange={(e) => {
                  clearFeedback();
                  setEmailData({ email: e.target.value });
                }}
                autoComplete="email"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-netflix hover:bg-red-700 text-white px-6 py-2 rounded transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Email'}
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
                onChange={(e) => {
                  clearFeedback();
                  setPasswordData({ ...passwordData, currentPassword: e.target.value });
                }}
                autoComplete="current-password"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  clearFeedback();
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                }}
                autoComplete="new-password"
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
                onChange={(e) => {
                  clearFeedback();
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                }}
                autoComplete="new-password"
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-netflix hover:bg-red-700 text-white px-6 py-2 rounded transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
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
