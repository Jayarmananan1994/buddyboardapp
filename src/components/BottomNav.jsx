import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const location = useLocation();

  const tabs = [
    {
      path: '/trips',
      label: 'Trips',
      icon: 'explore',
    },
    {
      path: '/create-trip',
      label: 'Create',
      icon: 'add_circle',
    },
    {
      path: '/my-trips',
      label: 'My Trips',
      icon: 'assignment',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(tab.path)
                ? 'text-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive(tab.path) ? 'font-bold' : ''}`}>
              {tab.icon}
            </span>
            <span className={`text-xs mt-1 ${isActive(tab.path) ? 'font-semibold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
