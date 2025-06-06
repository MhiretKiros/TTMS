'use client';
import { useEffect, useState } from 'react';
import { FiMapPin, FiAlertCircle, FiLoader, FiList } from 'react-icons/fi'; // Added FiList

const API_BASE_URL = 'http://localhost:8080'; // Assuming Spring Boot runs on port 8080

type Waypoint = {
  latitude: number;
  longitude: number;
  name?: string; // To store the fetched name
};

type AssignedRoute = {
  id?: string | number;
  plateNumber: string;
  waypoints: Waypoint[];
};

export default function AssignedRoutesPage() {
  const [routes, setRoutes] = useState<AssignedRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Helper function for reverse geocoding
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
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; // Fallback
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/routes`) // Updated URL
      .then(res => res.json())
      .then(async (data) => {
        // Assuming data is an array of AssignedRouteResponseDTO
        const rawRoutesFromApi: any[] = data || [];

        const processedRoutes: AssignedRoute[] = await Promise.all(
          rawRoutesFromApi.map(async (apiRoute) => {
            const waypointsWithNames: Waypoint[] = apiRoute.waypoints && Array.isArray(apiRoute.waypoints)
              ? await Promise.all(
                  apiRoute.waypoints.map(async (wp: any) => ({
                    // Assuming backend DTO for waypoint provides 'latitude' and 'longitude' as numbers
                    latitude: Number(wp.latitude),
                    longitude: Number(wp.longitude),
                    name: await fetchLocationName(
                      Number(wp.latitude),
                      Number(wp.longitude)
                    ),
                  }))
                )
              : [];
            return {
              id: apiRoute.id,
              plateNumber: apiRoute.plateNumber,
              waypoints: waypointsWithNames,
            };
          })
        );
        setRoutes(processedRoutes);
      })
      .catch(err => { console.error(err); setError("Failed to load assigned routes."); setIsLoading(false); });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Assigned Routes</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Plate Number</th>
            <th className="border px-4 py-2 text-left">Waypoints</th>
            <th className="border px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="text-center py-4">
                <div className="flex justify-center items-center">
                  <FiLoader className="animate-spin h-5 w-5 mr-2" /> Loading routes...
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-red-500">
                <FiAlertCircle className="inline h-5 w-5 mr-2" /> {error}
              </td>
            </tr>
          ) : routes.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4 text-gray-500">
                <FiMapPin className="inline h-5 w-5 mr-2" /> No routes assigned yet.
              </td>
            </tr>
          ) : (
            routes.map((route, idx) => (
              <tr key={route.id || route.plateNumber || idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{route.plateNumber}</td>
                <td className="border px-4 py-2 ">
                  {route.waypoints.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {route.waypoints.map((wp, wpIdx) => (
                        <li key={wpIdx}>
                          {wp.name || `${wp.latitude.toFixed(4)}, ${wp.longitude.toFixed(4)}`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No waypoints</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-green-600">Assigned</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}