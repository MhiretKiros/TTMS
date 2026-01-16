// components/RouteMap.tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);

// Custom icon components
const createDivIcon = (color: string, emoji: string, label?: string) => {
  return {
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${emoji}
        ${label ? `
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: #333;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            border: 1px solid #ddd;
          ">${label}</div>
        ` : ''}
      </div>
    `
  };
};

interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
  type?: 'pickup' | 'delivery' | 'warehouse' | 'waypoint';
  address?: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  position: [number, number];
  type: 'truck' | 'van' | 'car' | 'bus';
  status: 'active' | 'idle' | 'offline' | 'on-route';
}

interface RouteMapProps {
  waypoints: RouteWaypoint[];
  vehicles?: Vehicle[];
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function RouteMap({
  waypoints = [],
  vehicles = [],
  showRoute = true,
  center = [51.505, -0.09],
  zoom = 13,
  height = '500px',
}: RouteMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Fix Leaflet icons dynamically
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }
  }, []);

  if (!isMounted) {
    return (
      <div 
        className="animate-pulse bg-gray-200 rounded-lg" 
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  const routePositions = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full"
        style={{ height }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {showRoute && waypoints.length > 1 && (
          <Polyline
            positions={routePositions}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}
        
        {waypoints.map((waypoint, index) => {
          let iconProps;
          let emoji = '📍';
          
          if (waypoint.type === 'pickup') {
            iconProps = createDivIcon('#10b981', '📦');
            emoji = '📦';
          } else if (waypoint.type === 'delivery') {
            iconProps = createDivIcon('#ef4444', '📍');
            emoji = '📍';
          } else if (waypoint.type === 'warehouse') {
            iconProps = createDivIcon('#3b82f6', '🏭');
            emoji = '🏭';
          } else {
            iconProps = createDivIcon('#6b7280', `${index + 1}`, `${index + 1}`);
            emoji = `${index + 1}`;
          }
          
          return (
            <Marker
              key={`waypoint-${index}`}
              position={[waypoint.lat, waypoint.lng]}
              // @ts-ignore - Leaflet types issue with custom icons
              icon={window.L ? window.L.divIcon(iconProps) : undefined}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{emoji}</span>
                    <h4 className="font-semibold">
                      {waypoint.type ? waypoint.type.toUpperCase() : 'Waypoint'} #{index + 1}
                    </h4>
                  </div>
                  {waypoint.name && <p className="text-sm">{waypoint.name}</p>}
                  {waypoint.address && <p className="text-xs text-gray-600">{waypoint.address}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            position={vehicle.position}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${
                    vehicle.status === 'active' || vehicle.status === 'on-route' ? 'bg-green-500' :
                    vehicle.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <h4 className="font-bold">🚗 {vehicle.plateNumber}</h4>
                </div>
                <p className="text-sm capitalize">{vehicle.type}</p>
                <p className="text-sm text-gray-600">{vehicle.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}