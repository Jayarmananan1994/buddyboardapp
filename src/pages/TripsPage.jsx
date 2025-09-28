import FilterBar from '../components/FilterBar';
import TripGrid from '../components/TripGrid';
import { mockTrips } from '../data/mockTrips';

function TripsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">View Trips</h1>
        <p className="mt-1 text-slate-500">Find your next travel buddy by browsing through trips.</p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Trip Grid */}
      <TripGrid trips={mockTrips} />
    </>
  );
}

export default TripsPage;