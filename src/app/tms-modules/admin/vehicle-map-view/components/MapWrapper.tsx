// components/MapWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Vehicle, LatLngTuple } from '../type';
import { useEffect } from 'react';

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
};

export default function MapWrapper({ vehicles, selectedVehicle, center }: MapWrapperProps) {
  const [mapKey, setMapKey] = useState(Date.now());

  // Re-render map when vehicles change
  useEffect(() => {
    setMapKey(Date.now());
  }, [vehicles]);

  return (
    <div className="h-[450px] w-full">
      <MapComponent 
        key={mapKey}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        center={center}
      />
    </div>
  );
}