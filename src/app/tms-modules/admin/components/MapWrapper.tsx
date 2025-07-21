// components/MapWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const MapComponent = dynamic(
  () => import('./MapComponent').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

export default function MapWrapper() {
  const [mapKey, setMapKey] = useState(Date.now());

  return <MapComponent key={mapKey} />;
}