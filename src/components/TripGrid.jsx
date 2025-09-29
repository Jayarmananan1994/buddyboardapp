import { Link } from 'react-router-dom';
import TripCard from './TripCard';

function TripGrid({ trips }) {
  // Show empty state if no trips
  if (!trips || trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-background-light p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400">travel_explore</span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">No Trips Found</h2>
        <p className="mt-2 text-slate-500">There are currently no trips matching your criteria. Why not be the first?</p>
        <Link
          to="/create-trip"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Create a Trip</span>
        </Link>
      </div>
    );
  }

  // Show normal grid if trips exist
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}

export default TripGrid;