// components/MapComponent.tsx
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle, LatLngTuple, VehicleHistoryPoint } from '../type';

// Custom marker icons
const orgCarIcon = new L.Icon({
  iconUrl: '/images/org-car.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const rentCarIcon = new L.Icon({
  iconUrl: '/images/rent-car.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const directionIcon = new L.Icon({
  iconUrl: '/images/direction-arrow.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

type MapComponentProps = {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  center?: LatLngTuple;
  historyPath?: VehicleHistoryPoint[];
};

export default function MapComponent({ 
  vehicles, 
  selectedVehicle, 
  center, 
  historyPath 
}: MapComponentProps) {
  const mapRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const pathRef = useRef<any>(null);

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

  useEffect(() => {
    if (historyPath && historyPath.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(historyPath.map(point => point.position));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [historyPath]);

  // Fix for default marker icons in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });
  }, []);

  // Ensure map is properly sized after container changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [selectedVehicle, historyPath]);

  const getPathColor = () => {
    return selectedVehicle?.type === 'organization' ? '#3b82f6' : '#10b981';
  };

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
      
      {/* History Path */}
      {historyPath && historyPath.length > 1 && (
        <>
          <Polyline
            positions={historyPath.map(point => point.position)}
            color={getPathColor()}
            weight={4}
            opacity={0.7}
          />
          {historyPath.map((point, index) => (
            <Marker
              key={`path-${index}`}
              position={point.position}
              icon={directionIcon}
            >
              <Tooltip direction="top" offset={[0, -10]} permanent={false}>
                <div className="min-w-[150px]">
                  <strong>Time:</strong> {new Date(point.timestamp).toLocaleString()}<br />
                  <strong>Speed:</strong> {point.speed?.toFixed(1) || 'N/A'} km/h
                </div>
              </Tooltip>
            </Marker>
          ))}
        </>
      )}

      {/* Current Vehicles */}
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