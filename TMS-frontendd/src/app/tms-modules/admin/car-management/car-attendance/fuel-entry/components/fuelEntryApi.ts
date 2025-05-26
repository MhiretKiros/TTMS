// c:\Users\biruk\Desktop\TMS\TMS-frontendd\src\app\tms-modules\admin\car-management\car-attendance\fuel-entry\components\fuelEntryApi.ts

const API_BASE_URL = 'http://localhost:8080/api/car-attendance'; // For attendance specific endpoints
; // Ensure this path is correct for your project's base API URL

// --- Reusing from carAttendanceApi.ts ---
// These are imported from the main attendance API component file to ensure consistency
// and reuse existing logic for car selection and type mapping.
export type {
  PlateSuggestion,
  CarDetails, // This is the frontend-centric CarDetails, suitable for component state
} from '../../components/carAttendanceApi';

export {
  fetchPlateSuggestionsAPI,
  fetchCarDetailsAPI,
  mapCarTypeToVehicleType, // To convert 'organization'/'personal' to backend's "ORGANIZATION_CAR"/"CAR"
} from '../../components/carAttendanceApi';

// --- Fuel Entry Specific Interfaces ---

/**
 * Defines the structure for a request to log a new fuel entry.
 * This should align with the DTO expected by your backend API.
 */
export interface FuelEntryRequest {
  vehiclePlateNumber: string;
  vehicleType: string; // e.g., "ORGANIZATION_CAR", "CAR" (use mapCarTypeToVehicleType)
  litersAdded: number;
  kmAtFueling: number;
  fuelingDate: string; // Expected format: "YYYY-MM-DD"
}

/**
 * Defines the expected structure of the response from the backend after successfully logging a fuel entry.
 */
export interface FuelEntryResponse {
  id: number | string; // The unique identifier of the created fuel entry record
  vehiclePlateNumber: string;
  litersAdded: number;
  kmAtFueling: number;
  fuelingDate: string;
  message?: string; // Optional success or informational message from the backend
}

// --- Fuel Entry Specific API Call ---

export const submitFuelEntryAPI = async (data: FuelEntryRequest): Promise<FuelEntryResponse> => {
  const response = await fetch(`${API_BASE_URL}/fuel-entries`, { // Example endpoint, adjust as needed
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header if your API requires it:
      // 'Authorization': `Bearer ${your_auth_token_here}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Attempt to parse error message from backend, otherwise use generic HTTP error
    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status} (${response.statusText})` }));
    throw new Error(errorData.message || `Failed to submit fuel entry. Status: ${response.status}`);
  }

  return response.json();
};