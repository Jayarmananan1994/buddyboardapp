function FilterBar() {
  const handleFilterClick = (filterType) => {
    console.log('Filter clicked:', filterType);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-background-light p-4">
      <h3 className="text-lg font-semibold text-slate-800">Filter by:</h3>
      <div className="flex flex-wrap gap-3">
        <button
          className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
          onClick={() => handleFilterClick('destination')}
        >
          <span className="material-symbols-outlined text-base">location_on</span>
          <span>Destination</span>
          <span className="material-symbols-outlined text-base">arrow_drop_down</span>
        </button>

        <button
          className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
          onClick={() => handleFilterClick('date')}
        >
          <span className="material-symbols-outlined text-base">date_range</span>
          <span>Date Range</span>
          <span className="material-symbols-outlined text-base">arrow_drop_down</span>
        </button>

        <button
          className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
          onClick={() => handleFilterClick('gender')}
        >
          <span className="material-symbols-outlined text-base">wc</span>
          <span>Gender Preference</span>
          <span className="material-symbols-outlined text-base">arrow_drop_down</span>
        </button>
      </div>
    </div>
  );
}

export default FilterBar;