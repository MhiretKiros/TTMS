// components/MapWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Vehicle, LatLngTuple, VehicleHistoryPoint } from '../type';

const MapComponent = dynamic(
  () => import('./MapComponent').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

type MapWrapperProps = {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  center?: LatLngTuple;
  historyPath?: VehicleHistoryPoint[];
  onMapClick?: () => void;
};

export default function MapWrapper({ 
  vehicles, 
  selectedVehicle, 
  center, 
  historyPath,
  onMapClick 
}: MapWrapperProps) {
  const [mapKey, setMapKey] = useState(Date.now());
  const [isMounted, setIsMounted] = useState(false);

  // Re-render map when vehicles or history path changes
  useEffect(() => {
    setMapKey(Date.now());
  }, [vehicles, historyPath]);

  // Track mount state to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle map container click
  const handleContainerClick = () => {
    if (onMapClick) {
      onMapClick();
    }
  };

  if (!isMounted) {
    return (
      <div className="h-[450px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        Initializing map...
      </div>
    );
  }

  return (
    <div 
      className="h-[450px] w-full relative"
      onClick={handleContainerClick}
    >
      <MapComponent 
        key={mapKey}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        center={center}
        historyPath={historyPath}
      />
    </div>
  );
}