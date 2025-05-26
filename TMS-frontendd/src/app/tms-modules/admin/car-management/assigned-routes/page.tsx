'use client';
import { useEffect, useState } from 'react';

type AssignedRoute = {
  plateNumber: string;
  destinationLat: number;
  destinationLng: number;
};

export default function AssignedRoutesPage() {
  const [routes, setRoutes] = useState<AssignedRoute[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/auth/organization-car/assigned-routes')
      .then(res => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Assigned Routes</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Plate Number</th>
            <th className="border px-4 py-2">Destination (Lat, Lng)</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route, idx) => (
            <tr key={route.plateNumber || idx}>
              <td className="border px-4 py-2">{route.plateNumber}</td>
              <td className="border px-4 py-2">
                {route.destinationLat}, {route.destinationLng}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}