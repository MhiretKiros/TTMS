'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { fetchCars } from '../manage-cars/api/carServices';

interface Car {
  id: number;
  plate_number: string;
  car_type: string;
  model: string;
  fuel_type: string;
  manufacture_year: string;
  status: string;
  inspected: boolean;
  inspection_result: 'Approved' | 'Rejected';
}


export const storedInspectionResults: StoredInspectionResult[] = [];
export type StoredInspectionResult = {
  plateNumber: string;
  inspectorName: string;
  inspection: any; 
  notes: string;
  status: 'Approved' | 'Rejected';
  bodyScore: number;
  interiorScore: number;
};


export default function CarCheckPage() {
  const router = useRouter();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [searchPlate, setSearchPlate] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isMounted, setIsMounted] = useState(false);
useEffect(() => {
  setIsMounted(true);
  fetchCars();
}, []);
  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/auth/car/all');
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
      const result = await response.json();
      const data = result.carList || result.data || result;
  
      if (!Array.isArray(data)) {
        throw new Error('Expected array but got ' + typeof data);
      }
  
      const transformedCars = data.map((car: any) => ({
        id: car.id,
        plate_number: car.plateNumber || car.plate_number || car.licensePlate || 'N/A',
        car_type: car.carType || car.car_type || car.type || 'Unknown',
        fuel_type: car.fuelType || car.fuel_type || car.fuel || 'Not specified',
        model: car.model || 'Unknown model',
        manufacture_year: car.manufacture_year || car.year || null,
        status: car.status || 'unknown',
        inspected: Boolean(car.inspected),
        inspection_result: car.inspection_result || 'Not inspected'
      }));
  
      setCars(transformedCars);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load car data');
    } finally {
      setLoading(false);
    }
  };


useEffect(() => {
  setIsMounted(true);
  fetchCars();
}, []);



  const handleSearch = () => {
    if (!searchPlate.trim()) {
      setShowAlert(true);
      setSelectedCar(null);
      return;
    }

  
    const foundCar = cars.find(car => 
      car.plate_number.toLowerCase().includes(searchPlate.toLowerCase().trim())
    );
    
    if (foundCar) {
      setSelectedCar(foundCar);
      setShowAlert(false);
    } else {
      setSelectedCar(null);
      setShowAlert(true);
    }
  };

  const handleInspectClick = (car: Car) => {
    // Store the car data in sessionStorage for the inspection page
    sessionStorage.setItem('currentInspectionCar', JSON.stringify(car));
    
    // Navigate to inspection page with plateNumber as query parameter
    router.push(`/tms-modules/admin/car-management/vehicle-inspection/car-inspect?plateNumber=${encodeURIComponent(car.plate_number)}`);
    
    // Close modal
    setSelectedCar(null);
  };

  const isCarReadyToServe = (car: Car) => {
    return car.inspected && 
           car.inspection_result === 'Approved' && 
           car.status === 'active';
  };

  const countReadyCars = cars.filter(car => isCarReadyToServe(car)).length;
  const countNotReadyCars = cars.length - countReadyCars;

  const serviceData = [
    { name: 'Ready to Serve', value: countReadyCars },
    { name: 'Not Ready', value: countNotReadyCars }
  ];

  const carTypeData = cars.reduce((acc: {name: string, count: number}[], car) => {
    const existing = acc.find(item => item.name === car.car_type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: car.car_type, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#28a745', '#dc3545'];

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div className="container py-5">Loading car data...</div>;
  }

  if (error) {
    return <div className="container py-5 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="text-3xl font-bold mb-8 text-teal-600">INSA Car Check - Service Readiness</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by plate number"
          className="p-2 border border-gray-300 rounded-lg"
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          Search
        </button>
      </div>

      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-red-700 text-white p-8 w-[600px] rounded-lg shadow-2xl border-4 border-black animate-pulse">
            <h2 className="text-5xl font-extrabold mb-6 text-center">❌</h2>
            <p className="text-2xl font-semibold text-center">
              {!searchPlate.trim() ? 'Please enter a plate number' : 'No car found with this plate number'}
            </p>
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-white text-red-700 font-bold rounded-lg hover:bg-gray-300 transition duration-300"
                onClick={() => setShowAlert(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-teal-600">Car Inspection Details</h2>
                <button 
                  onClick={() => setSelectedCar(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <DetailItem label="Plate Number" value={selectedCar.plate_number} />
                  <DetailItem label="Car Type" value={selectedCar.car_type} />
                  <DetailItem label="Model" value={selectedCar.model} />
                  <DetailItem label="Fuel Type" value={selectedCar.fuel_type} />
                </div>
                <div className="space-y-3">
                  <DetailItem label="Manufacture Year" value={selectedCar.manufacture_year} />
                  <DetailItem label="Status" value={selectedCar.status} />
                  <DetailItem 
                    label="Inspection Result" 
                    value={selectedCar.inspected ? selectedCar.inspection_result : 'Not Inspected'} 
                    highlight={!selectedCar.inspected || selectedCar.inspection_result === 'Rejected'}
                  />
                  <DetailItem 
                    label="Ready to Serve" 
                    value={isCarReadyToServe(selectedCar) ? 'Yes' : 'No'} 
                    highlight={!isCarReadyToServe(selectedCar)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition duration-300"
                  onClick={() => handleInspectClick(selectedCar)}
                >
                  {selectedCar.inspected ? 'Re-inspect This Car' : 'Inspect This Car'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-teal-600 mb-4">Service Readiness Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceData} cx="50%" cy="50%" label innerRadius={60} outerRadius={100} fill="#8884d8" dataKey="value">
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-teal-600 mb-4">Car Type Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carTypeData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-auto max-h-96 mt-6">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-teal-600 text-white sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Plate Number</th>
              <th className="px-4 py-2 text-left">Car Type</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Fuel Type</th>
              <th className="px-4 py-2 text-left">Inspection Result</th>
              <th className="px-4 py-2 text-left">Ready to Serve</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => {
              const isReady = isCarReadyToServe(car);
              return (
                <tr 
                  key={car.id}
                  className="border-b hover:bg-teal-50 cursor-pointer"
                  onClick={() => setSelectedCar(car)}
                >
                  <td className="px-4 py-2">{car.plate_number}</td>
                  <td className="px-4 py-2">{car.car_type}</td>
                  <td className="px-4 py-2">{car.model}</td>
                  <td className="px-4 py-2">{car.fuel_type}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      car.inspected 
                        ? car.inspection_result === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {car.inspected ? car.inspection_result : 'Not Inspected'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      isReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isReady ? 'Ready' : 'Not Ready'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    
  );

}
// At the bottom of your component file

function DetailItem({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <span className="font-semibold">{label}:</span>
      <span className={`ml-2 ${highlight ? 'text-orange-500 font-medium' : ''}`}>
        {value}
      </span>
    </div>
  );
}


export const updateCarInspectionStatus = async (
  plateNumber: string,
  inspected: boolean,
  result: 'Approved' | 'Rejected'
) => {

  try {

    const response = await fetch('http://localhost:8080/auth/car/update-inspection-status', {
      method: 'PUT', // or 'POST' if your backend expects POST
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        plate_number: plateNumber, // Match your backend's expected field name
        inspected,
        inspection_result: result 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update inspection status');
    }
    await fetchCars(); // Refresh the list after update
  } catch (err) {
    console.error('Error updating inspection status:', err);
    setError('Failed to update inspection status');
  }
};




