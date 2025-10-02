import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout, getUser } from '../services/authService';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between whitespace-nowrap border-b border-slate-200/80 bg-background-light/80 px-4 sm:px-10 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/trips" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.93,11.2a0.5,0.5,0,0,0-.43-0.2l-2.75-0.2L16,5.33a0.5,0.5,0,0,0-0.92,0L12.3,8.8,9.55,8.6a0.5,0.5,0,0,0-.43.2L7.38,10.66,4.64,10.45a0.5,0.5,0,0,0-.43.2L2.09,12.8a0.5,0.5,0,0,0,.29.89l2.74.2L8,19.34a0.5,0.5,0,0,0,.92,0L11.7,15.8l2.75,0.2a0.5,0.5,0,0,0,.43-0.2l1.74-2.14,2.74,0.2a0.5,0.5,0,0,0,.43-0.2l2.12-2.15A0.5,0.5,0,0,0,21.93,11.2ZM9.07,14.43,8.5,12.8l1.62,0.12a0.5,0.5,0,0,0,.43-0.2L12,10.6l1.45,2.13a0.5,0.5,0,0,0,.43.2l1.62-.12-0.57,1.63L13.27,14.6a0.5,0.5,0,0,0-.29.89l0.57,1.63-1.62-.12a0.5,0.5,0,0,0-.43.2L10.07,19l-1-2.48a0.5,0.5,0,0,0-.29-.39Z"></path>
          </svg>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">BuddyBoard</h2>
        </Link>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/trips"
            className={`text-sm font-medium transition-colors ${
              (location.pathname === '/' || location.pathname === '/trips')
                ? 'text-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            View Trips
          </Link>
          <Link
            to="/my-trips"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/my-trips'
                ? 'text-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            My Trips
          </Link>
          <Link
            to="/create-trip"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/create-trip'
                ? 'text-primary'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            Create Trip
          </Link>
        </nav>
      </div>

      {/* Right side - Search, Notifications, User Profile */}
      <div className="flex items-center gap-4">

        {/* Notifications Button - Hidden on mobile */}
        <button className="hidden md:flex relative h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"></span>
        </button>

        {/* User Profile */}
        {user ? (
          <div className="relative group">
            <button className="h-10 w-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
              {user.username.charAt(0).toUpperCase()}
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">{user.username}</p>
                <p className="text-xs text-slate-500">Signed in user</p>
              </div>

              {/* Mobile-only navigation items */}
              <div className="md:hidden">
                <Link
                  to="/trips"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Trips
                </Link>
                <Link
                  to="/my-trips"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  My Trips
                </Link>
                <Link
                  to="/create-trip"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Create Trip
                </Link>
                <hr className="my-2 border-slate-200" />
              </div>

              {/* <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Profile Settings
              </Link> */}

              {/* My Trips link - only show on desktop since it's in mobile nav above */}
              <Link
                to="/my-trips"
                className="hidden md:block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                My Trips
              </Link>
              <hr className="my-2 border-slate-200" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/signin"
            className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-slate-600">person</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;