'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

const welloSefer: LatLngTuple = [8.992820, 38.773790];

async function fetchInspectedBuses() {
  const res = await fetch('http://localhost:8080/auth/organization-car/service-buses');
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  const data = await res.json();
  // Ensure organizationCar exists and has a plateNumber for valid buses
  return (data.cars || data.organizationCarList || []).filter(
    (bus: any) => bus.organizationCar && bus.organizationCar.plateNumber
  );
}

type ExistingAssignedRoute = {
  plateNumber: string;
  destinationLat: number;
  destinationLng: number;
  destinationName?: string; // To store the fetched name
  id?: string | number; // Optional, but good if backend provides it
}

// Fetch real route from OpenRouteService
async function fetchRoute(start: [number, number], end: [number, number]) {
  const apiKey = '5b3ce3597851110001cf6248db908c59be8b4a8e85283a6208452126'; // <-- Replace with your real key
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
  const body = {
    coordinates: [
      [start[1], start[0]], // [lng, lat]
      [end[1], end[0]],
    ],
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

// Helper function for reverse geocoding (can be moved to a utils file)
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

// --- Search Bar Component ---
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

export default function LeafletMap() {
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  // State to store routes fetched from the backend
  const [existingAssignedRoutes, setExistingAssignedRoutes] = useState<ExistingAssignedRoute[]>([]);
  const [routeCoords, setRouteCoords] = useState<LatLngTuple[]>([]);
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [isLoadingAssignedRoutes, setIsLoadingAssignedRoutes] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchInspectedBuses().then(setBuses).catch(console.error);

    // Fetch existing assigned routes from the backend
    setIsLoadingAssignedRoutes(true);
    fetch('http://localhost:8080/auth/organization-car/assigned-routes')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch assigned routes');
        }
        return res.json();
      })
      .then(async (data) => {
        const rawRoutes: Omit<ExistingAssignedRoute, 'destinationName'>[] = data.assignedRoutes || data || [];
        const routesWithNames = await Promise.all(
          rawRoutes.map(async (r) => ({
            ...r,
            plateNumber: r.plateNumber,
            destinationLat: parseFloat(String(r.destinationLat)),
            destinationLng: parseFloat(String(r.destinationLng)),
            destinationName: await fetchLocationName(parseFloat(String(r.destinationLat)), parseFloat(String(r.destinationLng))),
            id: r.id,
          }))
        );
        setExistingAssignedRoutes(routesWithNames);
      })
      .catch(error => console.error("Error fetching assigned routes:", error))
      .finally(() => setIsLoadingAssignedRoutes(false));
  }, []);

  // Get bus position from organizationCar or use Wello Sefer
  const busPosition: [number, number] =
    selectedBus?.organizationCar?.lat && selectedBus?.organizationCar?.lng
      ? [Number(selectedBus.organizationCar.lat), Number(selectedBus.organizationCar.lng)]
      : welloSefer;

  // Fetch real route when bus or destination changes
  useEffect(() => {
    if (selectedBus && destination) {
      fetchRoute(busPosition, destination)
        .then(setRouteCoords)
        .catch(() => setRouteCoords([]));
    } else {
      setRouteCoords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBus, destination]);

  const handleAssignRoute = async () => {
    if (selectedBus && destination) {
      const plateNumber = selectedBus.organizationCar?.plateNumber;
      if (!plateNumber) {
        alert("Selected bus has no plate number.");
        return;
      }

      const alreadyAssigned = existingAssignedRoutes.find(
        (route) => route.plateNumber === plateNumber
      );

      if (alreadyAssigned) {
        alert(
          `Car ${plateNumber} is already assigned to a route.\nDestination: ${alreadyAssigned.destinationName || `Lat ${alreadyAssigned.destinationLat.toFixed(5)}, Lng ${alreadyAssigned.destinationLng.toFixed(5)}`}.`
        );
        return; // Prevent new assignment
      }

      try {
        const response = await fetch('http://localhost:8080/auth/organization-car/assign-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plateNumber: plateNumber,
            latitude: destination[0],
            longitude: destination[1],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to assign route. Unknown server error." }));
          throw new Error(errorData.message || `Failed to assign route. Status: ${response.status}`);
        }

        const destinationName = await fetchLocationName(destination[0], destination[1]);

        alert(
          `Route assigned to ${plateNumber}!\nDestination: ${destinationName}`
        );

        // Update local state to reflect the new assignment immediately
        setExistingAssignedRoutes(prevRoutes => [
          ...prevRoutes,
          {
            // Assuming your backend doesn't return the full new object with ID immediately,
            // otherwise, use data from `await response.json()`
            plateNumber: plateNumber,
            destinationLat: destination[0],
            destinationLng: destination[1],
            destinationName: destinationName,
            // id: newAssignmentData?.id // if backend returns an id
          },
        ]);
        setDestination(null); // Clear destination for next assignment
        setRouteCoords([]);   // Clear drawn route
      } catch (error) {
        console.error("Error assigning route:", error);
        alert(`Error assigning route: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const isBusCurrentlyAssigned = (plateNumber?: string) => {
    if (!plateNumber) return false;
    return existingAssignedRoutes.some(route => route.plateNumber === plateNumber);
  };

  const getBusAssignmentDetails = (plateNumber?: string) => {
    if (!plateNumber) return null;
    return existingAssignedRoutes.find(route => route.plateNumber === plateNumber);
  };

  const filteredBuses = buses.filter(bus =>
    bus.organizationCar?.plateNumber?.toLowerCase().includes(busSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">Assign Route to Registered & Inspected Buses</h1>
      <p className="mb-4 text-gray-600">Select a bus, then click on the map or use the search bar to set a destination. Click "Assign Route" to save.</p>
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
                    const plate = bus.organizationCar?.plateNumber;
                    const assignment = getBusAssignmentDetails(plate);
                    return (
                      <li
                        key={
                          bus.organizationCar?.id ??
                          plate ??
                          `${bus.organizationCar?.model ?? 'bus'}-${index}`
                        }
                        className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                          selectedBus?.organizationCar?.plateNumber === plate
                            ? 'bg-blue-500 text-white'
                            : assignment
                              ? 'bg-green-50 hover:bg-green-100'
                              : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedBus(bus);
                          setDestination(null); // Clear previous destination when selecting a new bus
                          setRouteCoords([]);   // Clear previous route line
                        }}
                      >
                        <span className="font-medium">{plate}</span>
                        {assignment && (
                          <span className="block text-xs text-green-700">
                            Assigned to: {assignment.destinationName || `${assignment.destinationLat.toFixed(4)}, ${assignment.destinationLng.toFixed(4)}`}
                          </span>
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
            center={busPosition}
            zoom={14}
            style={{ width: '100%', height: '400px' }}
            key={selectedBus?.organizationCar?.plateNumber || 'map'} // Force re-render if bus changes to reset view potentially
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {selectedBus && (
              <Marker position={busPosition}>
                <Popup>Bus: {selectedBus.organizationCar.plateNumber}<br/>Current Location</Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={destination}>
                <Popup>Selected Destination</Popup>
              </Marker>
            )}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
            {selectedBus && !isBusCurrentlyAssigned(selectedBus.organizationCar?.plateNumber) && (
              <DestinationSetter onSet={setDestination} />
            )}
            <MapSearchBar onSelect={(latlng) => {
              if (selectedBus && !isBusCurrentlyAssigned(selectedBus.organizationCar?.plateNumber)) {
                setDestination(latlng);
              } else if (selectedBus) {
                alert(`Bus ${selectedBus.organizationCar.plateNumber} is already assigned. Cannot set new destination.`);
              } else {
                alert("Please select a bus first.");
              }
            }} />
          </MapContainer>
          <div className="mt-4 flex flex-col gap-3">
            {selectedBus && isBusCurrentlyAssigned(selectedBus.organizationCar?.plateNumber) && (
              <p className="text-orange-600 font-semibold p-2 bg-orange-100 rounded">
                Car {selectedBus.organizationCar.plateNumber} is already assigned.
                You cannot assign a new route until the current one is completed or unassigned.
              </p>
            )}
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !selectedBus ||
                !destination ||
                isLoadingAssignedRoutes ||
                isBusCurrentlyAssigned(selectedBus.organizationCar?.plateNumber)
              }
              onClick={handleAssignRoute}
            >
              Assign Route to {selectedBus?.organizationCar?.plateNumber || "Bus"}
            </button>
            
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              onClick={() => router.push('/tms-modules/admin/car-management/assigned-routes')}
            >
              View All Assigned Routes
            </button>
          </div>
          {selectedBus && !destination && !isBusCurrentlyAssigned(selectedBus.organizationCar?.plateNumber) && (
            <p className="mt-2 text-sm text-gray-500">
              Click on the map or use search to set a destination for {selectedBus.organizationCar.plateNumber}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}