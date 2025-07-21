'use client';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

interface OrganizationCar {
  id?: string;
  organizationCar?: {
    id?: string;
    plateNumber?: string;
    model?: string;
    lat?: string | number;
    lng?: string | number;
  };
}

interface RentCar {
  id?: string;
  plateNumber?: string;
  model?: string;
  lat?: string | number;
  lng?: string | number;
}

interface Bus {
  source: 'organization' | 'rented';
  id: string;
  plateNumber: string;
  model: string;
  lat: number;
  lng: number;
  original: any;
}

interface Waypoint {
  destinationLat: number;
  destinationLng: number;
  destinationName?: string;
}

interface ExistingAssignedRoute {
  plateNumber: string;
  id?: string | number;
  waypoints: Waypoint[];
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const welloSefer: LatLngTuple = [8.992820, 38.773790];

async function fetchInspectedBuses(): Promise<Bus[]> {
  try {
    const [orgRes, rentRes] = await Promise.all([
      fetch(`${API_BASE_URL}/auth/organization-car/service-buses`),
      fetch(`${API_BASE_URL}/auth/rent-car/bus-minibus`),
    ]);

    if (!orgRes.ok || !rentRes.ok) throw new Error("Failed to fetch one or more vehicle sources");

    const orgData = await orgRes.json();
    const rentData = await rentRes.json();
    const rentCarList = rentData?.rentCarList || [];

    const orgCars = (orgData.cars || orgData.organizationCarList || []).map((car: OrganizationCar) => ({
      source: 'organization' as const,
      id: car.id || car.organizationCar?.id || '',
      plateNumber: car.organizationCar?.plateNumber || '',
      model: car.organizationCar?.model || '',
      lat: Number(car.organizationCar?.lat || 0),
      lng: Number(car.organizationCar?.lng || 0),
      original: car,
    })).filter((car: Bus) => car.plateNumber);

    const rentCars = rentCarList.map((car: RentCar) => ({
      source: 'rented' as const,
      id: car.id || '',
      plateNumber: car.plateNumber || '',
      model: car.model || '',
      lat: Number(car.lat || 0),
      lng: Number(car.lng || 0),
      original: car,
    })).filter((car: Bus) => car.plateNumber);

    return [...orgCars, ...rentCars];
  } catch (error) {
    console.error("Error fetching service vehicles:", error);
    return [];
  }
}

async function fetchRoute(points: LatLngTuple[]) {
  const apiKey = '5b3ce3597851110001cf6248db908c59be8b4a8e85283a6208452126';
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
  if (points.length < 2) return [];
  
  const body = { coordinates: points.map(p => [p[1], p[0]]) };
  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  return data.features[0].geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]] as LatLngTuple
  );
}

async function fetchLocationName(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
    );
    if (!response.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await response.json();
    return data?.address?.village || data?.address?.town || data?.address?.suburb || 
           data?.address?.city_district || data?.address?.city || 
           data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

function MapViewUpdater({
  routeCoords,
  busPosition,
  activeWaypoints,
}: {
  routeCoords: LatLngTuple[];
  busPosition: LatLngTuple | null;
  activeWaypoints: LatLngTuple[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let bounds: LatLngTuple[] = [];
    if (busPosition) bounds.push(busPosition);
    if (activeWaypoints.length > 0) bounds.push(...activeWaypoints);

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    } else if (routeCoords.length > 0) {
      map.fitBounds(routeCoords, { padding: [50, 50] });
    }
  }, [routeCoords, busPosition, activeWaypoints, map]);

  return null;
}

interface LeafletMapProps {
  plateNumber: string;
}

export default function LeafletMap({ plateNumber }: LeafletMapProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [activeRouteWaypoints, setActiveRouteWaypoints] = useState<LatLngTuple[]>([]);
  const [activeRouteWaypointNames, setActiveRouteWaypointNames] = useState<string[]>([]);
  const [existingAssignedRoutes, setExistingAssignedRoutes] = useState<ExistingAssignedRoute[]>([]);
  const [routeCoords, setRouteCoords] = useState<LatLngTuple[]>([]);
  const [isLoadingAssignedRoutes, setIsLoadingAssignedRoutes] = useState(true);

  useEffect(() => {
    fetchInspectedBuses().then(fetchedBuses => {
      setBuses(fetchedBuses);
      const bus = fetchedBuses.find(b => b.plateNumber === plateNumber);
      if (bus) setSelectedBus(bus);
    });
  }, [plateNumber]);

  useEffect(() => {
    setIsLoadingAssignedRoutes(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/routes`),
      fetch(`${API_BASE_URL}/auth/rent-car-routes`)
    ])
      .then(async ([orgRes, rentRes]) => {
        if (!orgRes.ok || !rentRes.ok) throw new Error("Failed to fetch one or more route types");

        const orgData = await orgRes.json();
        const rentData = await rentRes.json();
        const allRoutes = [...orgData, ...rentData];

        const routesWithNames: ExistingAssignedRoute[] = await Promise.all(
          allRoutes.map(async (route: any) => {
            const waypoints = route.waypoints || [];
            const waypointsWithNames: Waypoint[] = await Promise.all(
              waypoints.map(async (wp: any) => ({
                destinationLat: Number(wp.latitude),
                destinationLng: Number(wp.longitude),
                destinationName: await fetchLocationName(Number(wp.latitude), Number(wp.longitude)),
              }))
            );
            return {
              plateNumber: route.plateNumber,
              id: route.id,
              waypoints: waypointsWithNames,
            };
          })
        );
        setExistingAssignedRoutes(routesWithNames);

        const assignedRoute = routesWithNames.find(r => r.plateNumber === plateNumber);
        if (assignedRoute) {
          const waypoints = assignedRoute.waypoints.map(wp => [wp.destinationLat, wp.destinationLng] as LatLngTuple);
          setActiveRouteWaypoints(waypoints);
        }
      })
      .catch(error => console.error("Error fetching assigned routes:", error))
      .finally(() => setIsLoadingAssignedRoutes(false));
  }, [plateNumber]);

  const busPosition: LatLngTuple | null = selectedBus?.lat && selectedBus?.lng
    ? [Number(selectedBus.lat), Number(selectedBus.lng)]
    : selectedBus ? welloSefer : null;

  useEffect(() => {
    if (activeRouteWaypoints.length > 0) {
      Promise.all(activeRouteWaypoints.map(wp => fetchLocationName(wp[0], wp[1])))
        .then(setActiveRouteWaypointNames)
        .catch((err) => {
          console.error("Error fetching waypoint names:", err);
          setActiveRouteWaypointNames(activeRouteWaypoints.map(wp => `${wp[0].toFixed(4)}, ${wp[1].toFixed(4)}`));
        });
    } else {
      setActiveRouteWaypointNames([]);
    }
  }, [activeRouteWaypoints]);

  useEffect(() => {
    if (selectedBus && activeRouteWaypoints.length > 0) {
      const pointsForRoute = [welloSefer, ...activeRouteWaypoints];
      
      if (pointsForRoute.length >= 2) {
        fetchRoute(pointsForRoute)
          .then(setRouteCoords)
          .catch((err) => {
            console.error("Error fetching API route:", err);
            setRouteCoords([]);
          });
      } else {
        setRouteCoords([]);
      }
    } else {
      setRouteCoords([]);
    }
  }, [selectedBus, activeRouteWaypoints, busPosition]);

  if (!selectedBus) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">Vehicle Not Found</h3>
        <p className="mt-2 text-sm text-gray-500">
          No vehicle found with plate number: {plateNumber}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-xl font-bold">Vehicle route visualization </h4>
        <p className="text-sm text-gray-600">This is real map shows of your assigned route</p>
      </div>

      <div className="flex-grow relative">
        <MapContainer
          center={welloSefer}
          zoom={13}
          style={{ width: '100%', height: '400px' }}
          className="z-0"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <MapViewUpdater
            routeCoords={routeCoords}
            busPosition={busPosition}
            activeWaypoints={activeRouteWaypoints}
          />
          
          {busPosition && selectedBus && (
            <Marker position={busPosition}>
              <Popup>Bus: {selectedBus.plateNumber}</Popup>
            </Marker>
          )}

          {activeRouteWaypoints.map((wp, index) => (
            <Marker key={`waypoint-${index}`} position={wp}>
              <Popup>Waypoint {index + 1}: {activeRouteWaypointNames[index] || `${wp[0].toFixed(4)}, ${wp[1].toFixed(4)}`}</Popup>
            </Marker>
          ))}

          {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
        </MapContainer>
      </div>

      {activeRouteWaypoints.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Route Sequence</h3>
          <div className="flex overflow-x-auto py-2 space-x-4">
            <div className="flex-shrink-0 px-3 py-2 bg-blue-100 rounded-md">
              <p className="font-medium">Start</p>
              <p className="text-sm">Wello Sefer</p>
            </div>
            
            {activeRouteWaypointNames.map((name, index) => (
              <div key={index} className="flex items-center">
                <div className="text-gray-400 mx-2">→</div>
                <div className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-md">
                  <p className="font-medium">Stop {index + 1}</p>
                  <p className="text-sm">{name || `Waypoint ${index + 1}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}