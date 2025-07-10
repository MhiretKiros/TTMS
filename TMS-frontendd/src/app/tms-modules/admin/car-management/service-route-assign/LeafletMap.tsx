'use client';
import axios from 'axios';
import L from 'leaflet'; // Import L for custom icons if needed
import { Toaster, toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
// Fix for default marker icon paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

const welloSefer: LatLngTuple = [8.992820, 38.773790];

async function fetchInspectedBuses() {
  try {
    const [orgRes, rentRes] = await Promise.all([
      fetch(`${API_BASE_URL}/auth/organization-car/service-buses`),
      fetch(`${API_BASE_URL}/auth/rent-car/bus-minibus`),
    ]);

    if (!orgRes.ok || !rentRes.ok) throw new Error("Failed to fetch one or more vehicle sources");

    const orgData = await orgRes.json();
    const rentData = await rentRes.json();
    const rentCarList = rentData?.rentCarList || [];

    const orgCars = (orgData.cars || orgData.organizationCarList || []).map((car: any) => ({
      source: 'organization',
      id: car.id || car.organizationCar?.id,
      plateNumber: car.organizationCar?.plateNumber,
      model: car.organizationCar?.model,
      lat: Number(car.organizationCar?.lat),
      lng: Number(car.organizationCar?.lng),
      original: car,
    })).filter(car => car.plateNumber);

    const rentCars = rentCarList.map((car: any) => ({
      source: 'rented',
      id: car.id,
      plateNumber: car.plateNumber,
      model: car.model,
      lat: Number(car.lat),
      lng: Number(car.lng),
      original: car,
    })).filter(car => car.plateNumber);

    return [...orgCars, ...rentCars];

  } catch (error) {
    console.error("Error fetching service vehicles:", error);
    return [];
  }
}


type Waypoint = {
  destinationLat: number;
  destinationLng: number;
  destinationName?: string;
};

type ExistingAssignedRoute = {
  plateNumber: string;
  id?: string | number; // Optional, but good if backend provides it
  waypoints: Waypoint[]; // Now stores an array of waypoints
}

// Fetch real route from OpenRouteService
async function fetchRoute(points: LatLngTuple[]) { // Accepts an array of points
  const apiKey = '5b3ce3597851110001cf6248db908c59be8b4a8e85283a6208452126'; // <-- Replace with your real key
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
  if (points.length < 2) {
    return []; // Not enough points to form a route
  }
  const body = {
    coordinates: points.map(p => [p[1], p[0]]), // Convert all points to [lng, lat]
  };
  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json',
  };
  const response = await axios.post(url, body, { headers });
  // Convert GeoJSON to LatLngTuple[]
  return response.data.features[0].geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]] as LatLngTuple
  );
}

async function fetchLocationName(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
    );
    if (!response.ok) throw new Error('Failed to fetch location name');
    const data = await response.json();
    if (data && data.address) {
      return data.address.village || data.address.town || data.address.suburb || data.address.city_district || data.address.city || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback on error
  }
}

function DestinationSetter({ onSet }: { onSet: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onSet([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapSearchBar({ onSelect }: { onSelect: (latlng: [number, number]) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const map = useMap();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setResults(data);
  };

  const handleSelect = (lat: string, lon: string) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    onSelect([latNum, lonNum]);
    map.setView([latNum, lonNum], 16);
    setResults([]);
    setQuery('');
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 1000,
      background: 'white',
      padding: 8,
      borderRadius: 8,
      width: 300
    }}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          placeholder="Search location..."
          onChange={e => setQuery(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </form>
      {results.length > 0 && (
        <ul className="bg-white border mt-2 rounded max-h-40 overflow-auto">
          {results.map((r: any) => (
            <li
              key={r.place_id}
              className="p-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => handleSelect(r.lat, r.lon)}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MapViewUpdater({
  routeCoords,
  busPosition,
  activeWaypoints,
  selectedBus
}: {
  routeCoords: LatLngTuple[];
  busPosition: LatLngTuple | null;
  activeWaypoints: LatLngTuple[];
  selectedBus: any | null;
}) 
{
  const map = useMap(); 

  useEffect(() => {
    if (!map) return;

    let bounds: LatLngTuple[] = [];
    if (busPosition) bounds.push(busPosition);
    // Always include Wello Sefer if there are waypoints for an auto-route context
    if (activeWaypoints.length > 0) bounds.push(welloSefer); 
    if (activeWaypoints.length > 0) bounds.push(...activeWaypoints);


    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (bounds.length === 1) { // e.g. only busPosition or only WelloSefer
      map.setView(bounds[0], 15);
    } else if (routeCoords.length > 0) { // If there's a drawn route but no specific points to bound
        map.fitBounds(routeCoords, { padding: [50, 50] });
    }
    // If nothing is set, map remains at its last state or initial center/zoom
  }, [routeCoords, busPosition, activeWaypoints, selectedBus, map]);

  return null;
}

export default function LeafletMap() {
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [activeRouteWaypoints, setActiveRouteWaypoints] = useState<LatLngTuple[]>([]);
  const [activeRouteWaypointNames, setActiveRouteWaypointNames] = useState<string[]>([]);
  const [existingAssignedRoutes, setExistingAssignedRoutes] = useState<ExistingAssignedRoute[]>([]);
  const [routeCoords, setRouteCoords] = useState<LatLngTuple[]>([]);
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [isLoadingAssignedRoutes, setIsLoadingAssignedRoutes] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch the list of available buses when the component mounts
    fetchInspectedBuses().then(setBuses);
  }, []);

useEffect(() => {
  setIsLoadingAssignedRoutes(true);
  Promise.all([
    fetch(`${API_BASE_URL}/api/routes`),                // Organization cars
    fetch(`${API_BASE_URL}/auth/rent-car-routes`)       // Rent cars
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
    })
    .catch(error => console.error("Error fetching assigned routes:", error))
    .finally(() => setIsLoadingAssignedRoutes(false));
}, []);


  const busPosition: LatLngTuple | null =
    selectedBus?.lat && selectedBus?.lng
      ? [Number(selectedBus.lat), Number(selectedBus.lng)]
      : selectedBus // If a bus is selected but has no coordinates, default to Wello Sefer
        ? welloSefer
        : null;

  const mapInitialCenter = welloSefer; 

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
  }, [selectedBus, activeRouteWaypoints, busPosition]); // Added busPosition as dependency

  const handlePointSelected = (latlng: LatLngTuple) => {
    if (!selectedBus) {
      toast.error("Please select a bus first.");
      return;
    }
    setActiveRouteWaypoints(prevPoints => [...prevPoints, latlng]);
  };

  const handleAssignRoute = async () => {
    if (selectedBus && activeRouteWaypoints.length > 0) {
       const plateNumber = selectedBus.plateNumber;
      if (!plateNumber) {
        toast.error("Selected bus has no plate number.");
        return;
      }

      try {
        const waypointsPayload = activeRouteWaypoints.map(wp => ({
          latitude: wp[0],
          longitude: wp[1],
        }));

        const endpoint = selectedBus.source === 'rented'
  ? `${API_BASE_URL}/auth/rent-car-routes/assign`
  : `${API_BASE_URL}/api/routes/assign`;

const response = await fetch(endpoint, {
 // Updated URL
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plateNumber: plateNumber,
            waypoints: waypointsPayload,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to assign route. Unknown server error." }));
          throw new Error(errorData.message || `Failed to assign route. Status: ${response.status}`);
        }

        const newAssignmentDataFromResponse = await response.json().catch(() => null);
        const assignedWaypointNames = await Promise.all(
          activeRouteWaypoints.map(wp => fetchLocationName(wp[0], wp[1]))
        );

        toast.success(
          `Route for ${plateNumber} assigned: ${assignedWaypointNames.join(' -> ')}`
        );

        setExistingAssignedRoutes(prevRoutes => {
          const updatedRouteEntry: ExistingAssignedRoute = {
            plateNumber: plateNumber,
            id: newAssignmentDataFromResponse?.id || getBusAssignmentDetails(plateNumber)?.id,
            waypoints: activeRouteWaypoints.map((wp, index) => ({
              destinationLat: wp[0],
              destinationLng: wp[1],
              destinationName: assignedWaypointNames[index],
            })),
          };
          return prevRoutes
            .filter(route => route.plateNumber !== plateNumber)
            .concat(updatedRouteEntry);
        });
        setActiveRouteWaypoints([]); 
        setActiveRouteWaypointNames([]);
        setRouteCoords([]);   
      } catch (error) {
        console.error("Error assigning route:", error);
        toast.error(`Error assigning route: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else { 
      toast.error("Please select a bus and add at least one waypoint."); 
    }
  };

  const isBusCurrentlyAssigned = (plateNumber?: string) => {
    if (!plateNumber) return false;
    const assignment = getBusAssignmentDetails(plateNumber);
    return !!(assignment && assignment.waypoints && assignment.waypoints.length > 0);
  };

  const getBusAssignmentDetails = (plateNumber?: string) => {
    if (!plateNumber) return null;
    return existingAssignedRoutes.find(route => route.plateNumber === plateNumber);
  };

  const filteredBuses = buses.filter(bus =>
    bus.plateNumber?.toLowerCase().includes(busSearchQuery.toLowerCase())
  );

  const handleClearEntireRoute = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-2 bg-white rounded-lg shadow-md">
          <p className="font-semibold">Confirm Clear</p>
          <p className="text-sm text-gray-600">Are you sure you want to clear all waypoints for the current route?</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                setActiveRouteWaypoints([]);
                setActiveRouteWaypointNames([]);
                setRouteCoords([]);
                toast.dismiss(t.id);
                toast.success("Waypoints cleared.");
              }}
            >
              Yes, Clear
            </button>
            <button
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity } // This toast will not auto-dismiss
    );
  };

  const intermediateWaypointIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41], // Standard size for clarity, or smaller if preferred
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });


  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <div>
          <h1 className="text-2xl font-bold">Assign Route to Inspected Buses</h1>
          <p className="text-sm text-gray-600">
            Select a bus, then click on the map or search to add waypoints.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => router.push('/tms-modules/admin/car-management/assigned-routes')}
          >
            View All Assigned Routes
          </button>
          <button
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => router.push('/tms-modules/admin/car-management/Avaliable-seats')}
          >
            Employee Car Assignment
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Available Buses</h2>
            <input
              type="text"
              placeholder="Search by plate number..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={busSearchQuery}
              onChange={(e) => setBusSearchQuery(e.target.value)}
            />
          </div>
          {isLoadingAssignedRoutes ? <p>Loading bus assignment status...</p> : (
            filteredBuses.length === 0
              ? (busSearchQuery ? <p className="text-gray-500">No buses match your search.</p> : <p className="text-gray-500">No inspected buses found.</p>)
              : (
                <ul className="max-h-80 overflow-y-auto border rounded-md">
                  {filteredBuses.map((bus, index) => {
                    const plate = bus.plateNumber;
                    const assignment = getBusAssignmentDetails(plate);
                    return (
                      <li
                        key={bus.id ?? plate ?? `${bus.model ?? 'bus'}-${index}`}
                        className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                          selectedBus?.plateNumber === plate
                            ? 'bg-blue-500 text-white'
                            : (assignment && assignment.waypoints && assignment.waypoints.length > 0)
                              ? 'bg-green-50 hover:bg-green-100'
                                : 'bg-gray-50 hover:bg-gray-100 '
                        }`}
                        onClick={() => {
                          setSelectedBus(bus);
                          setActiveRouteWaypoints([]); 
                          setActiveRouteWaypointNames([]);
                          setRouteCoords([]);   

                          const currentAssignment = getBusAssignmentDetails(plate);
                          if (currentAssignment && currentAssignment.waypoints && currentAssignment.waypoints.length > 0) {
                            const assignedWaypointsLatLng: LatLngTuple[] = currentAssignment.waypoints.map(wp => [wp.destinationLat, wp.destinationLng]);
                            setActiveRouteWaypoints(assignedWaypointsLatLng);
                          }
                        }}
                      >
                        <span className="font-medium">{plate}</span>
                        {assignment && assignment.waypoints && assignment.waypoints.length > 0 && (
                          <div className="text-xs text-green-700">
                            Assigned ({assignment.waypoints.length} stops): 
                            {assignment.waypoints.slice(0, 2).map(wp => wp.destinationName || `${wp.destinationLat.toFixed(2)}, ${wp.destinationLng.toFixed(2)}`).join(' -> ')}
                            {assignment.waypoints.length > 2 ? '...' : ''}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )
          )}
        </div>
        <div className="md:w-2/3 relative">
          <MapContainer
            center={mapInitialCenter}
            zoom={13}
            style={{ width: '100%', height: '400px' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapViewUpdater
              routeCoords={routeCoords}
              busPosition={busPosition}
              activeWaypoints={activeRouteWaypoints}
              selectedBus={selectedBus}
            />
            {busPosition && selectedBus && (
              <Marker position={busPosition} icon={intermediateWaypointIcon}>
                <Popup>Bus: {selectedBus.plateNumber}<br/>Current Location (or Wello Sefer)</Popup>
              </Marker>
            )}

            {activeRouteWaypoints.map((wp, index) => (
              <Marker key={`waypoint-${index}`} position={wp}>
                <Popup>Waypoint {index + 1}: {activeRouteWaypointNames[index] || `${wp[0].toFixed(4)}, ${wp[1].toFixed(4)}`}</Popup>
              </Marker>
            ))}

            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
            
            {selectedBus && (
              <DestinationSetter onSet={handlePointSelected} />
            )}
            <MapSearchBar onSelect={handlePointSelected} />
          </MapContainer>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex gap-2">
              {selectedBus && activeRouteWaypoints.length > 0 && (
                 <button
                  onClick={handleClearEntireRoute}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  Clear Current Waypoints
                </button>
              )}
            </div>
            {selectedBus && (() => {
              const assignment = getBusAssignmentDetails(selectedBus.plateNumber);
              if (assignment && assignment.waypoints && assignment.waypoints.length > 0) {
                const assignedWaypointsText = assignment.waypoints.map(wp => wp.destinationName || `${wp.destinationLat.toFixed(2)},${wp.destinationLng.toFixed(2)}`).join(' -> ');
                return (
                  <p className="text-orange-600 font-semibold p-2 bg-orange-100 rounded">
                    Car {selectedBus.plateNumber} is currently assigned to: {assignedWaypointsText}.
                    {activeRouteWaypoints.length > 0 && " Modifying points below will update this assignment."}
                  </p>
                );
              }
              return null;
            })()}
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !selectedBus ||
                activeRouteWaypoints.length === 0 || 
                isLoadingAssignedRoutes ||
                (() => { 
                  if (isBusCurrentlyAssigned(selectedBus?.plateNumber)) {
                    const currentAssignment = getBusAssignmentDetails(selectedBus.plateNumber);
                    if (currentAssignment && currentAssignment.waypoints.length === activeRouteWaypoints.length) {
                      return currentAssignment.waypoints.every((cw, i) => 
                        cw.destinationLat === activeRouteWaypoints[i][0] && cw.destinationLng === activeRouteWaypoints[i][1]
                      );
                    }
                  }
                  return false;
                })()
              }
              onClick={handleAssignRoute}
            >
              Assign Route to {selectedBus?.plateNumber || "Bus"}
            </button>
            {/* Navigation buttons moved to the top */}
          </div>
          
          {selectedBus && activeRouteWaypoints.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Click on the map or use search to add waypoints for {selectedBus.plateNumber}. Route will start from Wello Sefer.
            </p>
          )}
          {selectedBus && activeRouteWaypoints.length > 0 && (() => {
            const currentAssignment = getBusAssignmentDetails(selectedBus.plateNumber);
            if (currentAssignment && currentAssignment.waypoints.length === activeRouteWaypoints.length && currentAssignment.waypoints.every((cw, i) => cw.destinationLat === activeRouteWaypoints[i][0] && cw.destinationLng === activeRouteWaypoints[i][1])) {
                return <p className="mt-2 text-sm text-green-700">These waypoints match the current assignment for {selectedBus.plateNumber}.</p>;
            } else if (currentAssignment && currentAssignment.waypoints && currentAssignment.waypoints.length > 0) {
                return <p className="mt-2 text-sm text-blue-700">Previewing new route for {selectedBus.plateNumber} via {activeRouteWaypoints.length} waypoint(s). This will update the current assignment.</p>;
            } else {
                 return <p className="mt-2 text-sm text-blue-700">Previewing new route for {selectedBus.plateNumber} via {activeRouteWaypoints.length} waypoint(s). This will be a new assignment.</p>;
            }
          })()}
        </div>
      </div>
    </div>
  );
}