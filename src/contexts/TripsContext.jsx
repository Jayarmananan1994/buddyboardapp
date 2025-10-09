import { createContext, useContext, useState } from 'react';

const TripsContext = createContext();

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [hasFetchedTrips, setHasFetchedTrips] = useState(false);
  const [hasFetchedMyTrips, setHasFetchedMyTrips] = useState(false);

  // Function to refresh trips data
  const refreshTrips = () => {
    setHasFetchedTrips(false);
  };

  // Function to refresh my trips data
  const refreshMyTrips = () => {
    setHasFetchedMyTrips(false);
  };

  // Function to refresh all data
  const refreshAll = () => {
    setHasFetchedTrips(false);
    setHasFetchedMyTrips(false);
  };

  const value = {
    trips,
    setTrips,
    myTrips,
    setMyTrips,
    hasFetchedTrips,
    setHasFetchedTrips,
    hasFetchedMyTrips,
    setHasFetchedMyTrips,
    refreshTrips,
    refreshMyTrips,
    refreshAll,
  };

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
}
