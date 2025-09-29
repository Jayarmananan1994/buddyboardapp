import { useNavigate, Link, useLocation } from 'react-router-dom';

function Header({ showCreateTripButton = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateTrip = () => {
    navigate('/create-trip');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between whitespace-nowrap border-b border-slate-200/80 bg-background-light/80 px-4 sm:px-6 lg:px-10 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.93,11.2a0.5,0.5,0,0,0-.43-0.2l-2.75-0.2L16,5.33a0.5,0.5,0,0,0-0.92,0L12.3,8.8,9.55,8.6a0.5,0.5,0,0,0-.43.2L7.38,10.66,4.64,10.45a0.5,0.5,0,0,0-.43.2L2.09,12.8a0.5,0.5,0,0,0,.29.89l2.74.2L8,19.34a0.5,0.5,0,0,0,.92,0L11.7,15.8l2.75,0.2a0.5,0.5,0,0,0,.43-0.2l1.74-2.14,2.74,0.2a0.5,0.5,0,0,0,.43-0.2l2.12-2.15A0.5,0.5,0,0,0,21.93,11.2ZM9.07,14.43,8.5,12.8l1.62,0.12a0.5,0.5,0,0,0,.43-0.2L12,10.6l1.45,2.13a0.5,0.5,0,0,0,.43.2l1.62-.12-0.57,1.63L13.27,14.6a0.5,0.5,0,0,0-.29.89l0.57,1.63-1.62-.12a0.5,0.5,0,0,0-.43.2L10.07,19l-1-2.48a0.5,0.5,0,0,0-.29-.39Z"></path>
          </svg>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">BuddyBoard</h2>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/trips"
            className={`text-sm font-medium transition-colors ${
              (location.pathname === '/' || location.pathname === '/trips')
                ? 'text-primary font-bold'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            View Trips
          </Link>
          <Link
            to="/create-trip"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/create-trip'
                ? 'text-primary font-bold'
                : 'text-slate-600 hover:text-primary'
            }`}
          >
            Post a Trip
          </Link>
         
        </nav>
      </div>

      {/* Right side - Create Trip Button or View Trips Button */}
      <div className="flex items-center">
        {/* Create Trip Button - only show when showCreateTripButton is true */}
        {showCreateTripButton && (
          <button
            onClick={handleCreateTrip}
            className="flex items-center gap-1 sm:gap-2 rounded-lg bg-primary px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-primary/90 transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span className="hidden sm:inline">Create Trip</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}

        {/* View Trips Button - show on create-trip page for mobile */}
        {location.pathname === '/create-trip' && (
          <Link
            to="/trips"
            className="flex items-center gap-1 sm:gap-2 rounded-lg bg-slate-600 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-slate-700 transition-colors duration-200 md:hidden"
          >
            <span className="material-symbols-outlined text-base">view_list</span>
            <span>View Trips</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;