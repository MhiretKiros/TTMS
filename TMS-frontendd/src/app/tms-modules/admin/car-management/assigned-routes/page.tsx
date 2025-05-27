'use client';
import { useEffect, useState } from 'react';
import { FiMapPin, FiAlertCircle, FiLoader } from 'react-icons/fi'; // Added icons

type AssignedRoute = {
  plateNumber: string;
  destinationLat: number;
  destinationLng: number;
  destinationName?: string; // To store the fetched name
  // Assuming your backend might also return an ID or a timestamp for uniqueness if plate numbers can have multiple historical assignments
  id?: string | number; 
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
    fetch('http://localhost:8080/auth/organization-car/assigned-routes')
      .then(res => res.json())
      .then(async (data) => {
        const rawRoutes: Omit<AssignedRoute, 'destinationName'>[] = data.assignedRoutes || data || [];
        const routesWithNames = await Promise.all(
          rawRoutes.map(async (route) => ({
            ...route,
            destinationName: await fetchLocationName(route.destinationLat, route.destinationLng),
          }))
        );
        setRoutes(routesWithNames);
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
            <th className="border px-4 py-2 text-left">Destination (Lat, Lng)</th>
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
                <td className="border px-4 py-2">
                  {route.destinationName || `${route.destinationLat.toFixed(5)}, ${route.destinationLng.toFixed(5)}`}
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