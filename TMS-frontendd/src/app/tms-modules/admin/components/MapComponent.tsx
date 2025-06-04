// components/MapComponent.tsx
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
  const mapRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent re-initialization on hot reload
    if (isInitialized.current) return;
    isInitialized.current = true;
  }, []);

  const vehicles = [
    { name: "VEH-003", status: "In Use", position: [51.505, -0.09] },
    { name: "VEH-002", status: "Available", position: [51.51, -0.1] },
    { name: "VEH-003", status: "Maintenance", position: [51.49, -0.07] }
  ];

  return (
    <MapContainer
      ref={mapRef}
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {vehicles.map((vehicle, index) => (
        <Marker key={index} position={vehicle.position}>
          <Popup>
            <strong>{vehicle.name}</strong><br />
            Status: {vehicle.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}