import { createContext, useContext, useState } from 'react';

const TripsContext = createContext();

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [hasFetchedTrips, setHasFetchedTrips] = useState(false);
  const [hasFetchedMyTrips, setHasFetchedMyTrips] = useState(false);

  const value = {
    trips,
    setTrips,
    myTrips,
    setMyTrips,
    hasFetchedTrips,
    setHasFetchedTrips,
    hasFetchedMyTrips,
    setHasFetchedMyTrips,
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
