// components/MapComponent.tsx
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle, LatLngTuple } from '../type';

// Custom marker icons
const orgCarIcon = new L.Icon({
  iconUrl: '/images/car1.jpeg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/car1.jpeg',
  shadowSize: [41, 41]
});

const rentCarIcon = new L.Icon({
  iconUrl: '/images/car1.jpeg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/car1.jpeg',
  shadowSize: [41, 41]
});

type MapComponentProps = {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  center?: LatLngTuple;
};

export default function MapComponent({ vehicles, selectedVehicle, center }: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (selectedVehicle && mapRef.current) {
      mapRef.current.flyTo(selectedVehicle.position, 15);
    } else if (center && mapRef.current && !selectedVehicle) {
      mapRef.current.flyTo(center, 13);
    }
  }, [selectedVehicle, center]);

  // Fix for default marker icons in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/car1.jpeg',
      iconUrl: '/images/car1.jpeg',
      shadowUrl: '/images/car1.jpeg',
    });
  }, []);

  // This effect ensures the map is properly sized after container changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [selectedVehicle]);

  return (
    <MapContainer
      ref={mapRef}
      center={selectedVehicle?.position || center || [51.505, -0.09]}
      zoom={selectedVehicle ? 15 : 13}
      style={{ height: '100%', width: '100%' }}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {vehicles.map((vehicle) => (
        <Marker 
          key={vehicle.id} 
          position={vehicle.position}
          icon={vehicle.type === 'organization' ? orgCarIcon : rentCarIcon}
          eventHandlers={{
            click: () => {
              if (mapRef.current) {
                mapRef.current.flyTo(vehicle.position, 15);
              }
            },
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <strong>{vehicle.name}</strong><br />
              Plate: {vehicle.plateNumber}<br />
              Model: {vehicle.model}<br />
              Status: <span className={`${getStatusColorClass(vehicle.status)}`}>
                {vehicle.status}
              </span><br />
              Type: {vehicle.type === 'organization' ? 'Organization' : 'Rental'}<br />
              {vehicle.distanceFromReference !== undefined && (
                <span>Distance: {vehicle.distanceFromReference.toFixed(2)} km</span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// Helper function for status colors
function getStatusColorClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'available':
      return 'text-green-600';
    case 'in use':
      return 'text-yellow-600';
    case 'maintenance':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}