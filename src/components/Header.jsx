function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between whitespace-nowrap border-b border-slate-200/80 bg-background-light/80 px-10 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 text-primary">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.93,11.2a0.5,0.5,0,0,0-.43-0.2l-2.75-0.2L16,5.33a0.5,0.5,0,0,0-0.92,0L12.3,8.8,9.55,8.6a0.5,0.5,0,0,0-.43.2L7.38,10.66,4.64,10.45a0.5,0.5,0,0,0-.43.2L2.09,12.8a0.5,0.5,0,0,0,.29.89l2.74.2L8,19.34a0.5,0.5,0,0,0,.92,0L11.7,15.8l2.75,0.2a0.5,0.5,0,0,0,.43-0.2l1.74-2.14,2.74,0.2a0.5,0.5,0,0,0,.43-0.2l2.12-2.15A0.5,0.5,0,0,0,21.93,11.2ZM9.07,14.43,8.5,12.8l1.62,0.12a0.5,0.5,0,0,0,.43-0.2L12,10.6l1.45,2.13a0.5,0.5,0,0,0,.43.2l1.62-.12-0.57,1.63L13.27,14.6a0.5,0.5,0,0,0-.29.89l0.57,1.63-1.62-.12a0.5,0.5,0,0,0-.43.2L10.07,19l-1-2.48a0.5,0.5,0,0,0-.29-.39Z"></path>
          </svg>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Wanderlust</h2>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <a className="text-sm font-medium text-slate-600 hover:text-primary" href="#">Home</a>
          <a className="text-sm font-medium text-primary" href="#">View Trips</a>
          <a className="text-sm font-medium text-slate-600 hover:text-primary" href="#">My Trips</a>
          <a className="text-sm font-medium text-slate-600 hover:text-primary" href="#">Create Trip</a>
        </nav>
      </div>

      {/* Right side - Search only (no icons) */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <input
          className="h-10 w-full min-w-40 max-w-xs rounded-lg border border-slate-200 bg-background-light pl-4 pr-4 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search..."
        />
      </div>
    </header>
  );
}

export default Header;