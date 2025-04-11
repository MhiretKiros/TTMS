'use client';

import { fetchCars } from '../manage-cars/api/carServices';

export const updateCarInspectionStatus = async (
  plateNumber: string,
  inspected: boolean,
  result: 'Approved' | 'Rejected'
) => {
  try {
    const response = await fetch('http://localhost:8080/auth/car/update-inspection-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        plate_number: plateNumber,
        inspected,
        inspection_result: result 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update inspection status');
    }
    return await response.json();
  } catch (err) {
    console.error('Error updating inspection status:', err);
    throw err;
  }
};

export type StoredInspectionResult = {
  plateNumber: string;
  inspectorName: string;
  inspection: any;
  notes: string;
  status: 'Approved' | 'Rejected';
  bodyScore: number;
  interiorScore: number;
};

export const storedInspectionResults: StoredInspectionResult[] = [];