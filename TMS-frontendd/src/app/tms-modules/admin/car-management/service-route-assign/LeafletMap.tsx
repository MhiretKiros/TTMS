'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

const welloSefer: LatLngTuple = [8.992820, 38.773790];

async function fetchInspectedBuses() {
  const res = await fetch('http://localhost:8080/auth/organization-car/service-buses');
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  const data = await res.json();
  return data.cars || data.organizationCarList || [];
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
  const [assignedRoutes, setAssignedRoutes] = useState<
    { plateNumber: string; destination: [number, number] }[]
  >([]);
  const [routeCoords, setRouteCoords] = useState<LatLngTuple[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchInspectedBuses().then(setBuses).catch(console.error);
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

  // Assign route to bus (in-memory, you can POST to backend here)
  const handleAssignRoute = async () => {
    if (selectedBus && destination) {
      setAssignedRoutes(prev => [
        ...prev.filter(r => r.plateNumber !== selectedBus.organizationCar?.plateNumber),
        { plateNumber: selectedBus.organizationCar?.plateNumber, destination },
      ]);
      // Send to backend
      await fetch('http://localhost:8080/auth/organization-car/assign-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: selectedBus.organizationCar?.plateNumber,
          latitude: destination[0],
          longitude: destination[1],
        }),
      });
      alert(
        `Route assigned to ${selectedBus.organizationCar?.plateNumber}!\nDestination: [${destination[0].toFixed(
          5
        )}, ${destination[1].toFixed(5)}]`
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Assign Route to Registered & Inspected Buses</h1>
      <div className="flex gap-6">
        <div className="w-1/3">
          <h2 className="font-semibold mb-2">Mini Buses & Buses</h2>
          <ul>
            {buses.map((bus, index) => (
              <li
                key={
                  bus.organizationCar?.id ??
                  bus.organizationCar?.plateNumber ??
                  `${bus.organizationCar?.model ?? 'bus'}-${index}`
                }
                className={`p-2 mb-2 rounded cursor-pointer ${
                  selectedBus?.organizationCar?.plateNumber === bus.organizationCar?.plateNumber
                    ? 'bg-blue-200'
                    : 'bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedBus(bus);
                  setDestination(null);
                }}
              >
                {bus.organizationCar?.plateNumber
                  ? bus.organizationCar.plateNumber
                  : <span className="text-red-500">No Plate Number</span>}
                {assignedRoutes.find(
                  r => r.plateNumber === bus.organizationCar?.plateNumber
                ) && (
                  <span className="ml-2 text-green-600 text-xs">Route assigned</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3">
          <MapContainer
            center={busPosition}
            zoom={14}
            style={{ width: '100%', height: '400px' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {selectedBus && <Marker position={busPosition} />}
            {destination && <Marker position={destination} />}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
            {selectedBus && <DestinationSetter onSet={setDestination} />}
            <MapSearchBar onSelect={setDestination} />
          </MapContainer>
          <div className="mt-2 flex items-center gap-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!selectedBus || !destination}
              onClick={handleAssignRoute}
            >
              Assign Route
            </button>
            {selectedBus && assignedRoutes.find(r => r.plateNumber === selectedBus.plateNumber) && (
              <span className="text-green-700">Route assigned!</span>
            )}
          </div>
          <p className="mt-2 text-gray-600">
            Select a bus, then click on the map to set a destination. Click "Assign Route" to assign.
          </p>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
            onClick={() => router.push('/tms-modules/admin/car-management/assigned-routes')}
          >
            View Assigned Routes
          </button>
        </div>
      </div>
    </div>
  );
}