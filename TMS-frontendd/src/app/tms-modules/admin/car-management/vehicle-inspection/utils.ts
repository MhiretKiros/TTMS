'use client';

// Assuming you might need fetch functions for other car types later,
// but the current function only needs the base URLs.
// import { fetchCars } from '../manage-cars/api/carServices';
// import { fetchOrganizationCars } from '../manage-cars/api/organizationCarServices'; // Uses axios
// import { fetchRentCars } from '../manage-cars/api/rentCarServices'; // Uses axios

// Define the possible car types based on your API structure
export type CarType = 'car' | 'organization' | 'rent';

// Define the base URL (adjust if needed, but seems consistent in the path structure)
const API_BASE_URL = 'http://localhost:8080/auth';

/**
 * Updates the inspection status for a car of a specified type.
 *
 * @param plateNumber - The plate number of the car.
 * @param inspected - Whether the car has been inspected.
 * @param result - The result of the inspection ('Approved' or 'Rejected').
 * @param carType - The type of the car ('car', 'organization', or 'rent').
 * @returns A promise that resolves with the API response data on success.
 * @throws An error if the update fails or if the plate number is missing.
 */
export const updateCarInspectionStatus = async (
  plateNumber: string,
  inspected: boolean,
  result: 'Approved' | 'Rejected',
  carType: CarType // Added carType parameter
) => {
  if (!plateNumber) {
    // More specific error message
    throw new Error('Plate Number is required to update inspection status.');
  }

  // Determine the correct API endpoint based on carType
  let apiUrlSegment = '';
  switch (carType) {
    case 'organization':
      apiUrlSegment = 'organization-car';
      break;
    case 'rent':
      apiUrlSegment = 'rent-car';
      break;
    case 'car':
      apiUrlSegment = 'car';
      break;
    default:
      // Handle unexpected carType, maybe throw an error or default
      console.warn(`Unexpected carType: ${carType}. Defaulting to 'car'.`);
      apiUrlSegment = 'car';
      // Or: throw new Error(`Unsupported car type: ${carType}`);
      break;
  }

  // Construct the full URL - Assuming the endpoint structure is consistent
  const apiUrl = `${API_BASE_URL}/${apiUrlSegment}/update-inspection-status`;

  console.log(`Updating inspection status for ${carType} car (${plateNumber}) via: ${apiUrl}`); // Log the target URL

  try {
    const response = await fetch(apiUrl, { // Use the dynamically constructed URL
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Assuming the backend expects these field names for all types
        plate_number: plateNumber,
        inspected,
        inspection_result: result,
      }),
    });

    // Centralized error handling for non-ok responses
    if (!response.ok) {
      let errorData: any = {};
      try {
        // Attempt to parse error details from the response body
        errorData = await response.json();
      } catch (parseError) {
        // Fallback if the response body isn't valid JSON
        console.error("Could not parse error response JSON:", parseError);
        errorData.message = response.statusText || `HTTP error ${response.status}`;
      }
      // Construct a more informative error message
      const errorMessage = errorData.message || `Failed to update ${carType} car inspection status`;
      throw new Error(errorMessage);
    }

    // If response is OK, parse and return the JSON body
    return await response.json();

  } catch (err: any) {
    // Catch network errors or errors thrown from the non-ok response handling
    console.error(`Error updating ${carType} car inspection status:`, err);

    // Re-throw a user-friendly error message
    if (err instanceof Error) {
      // Use the message from the caught error if available
      throw new Error(`Failed to update ${carType} car inspection status: ${err.message}`);
    } else {
      // Generic fallback for unknown errors
      throw new Error(`An unknown error occurred while updating the ${carType} car inspection status.`);
    }
  }
};

// --- StoredInspectionResult Type and Array ---

export type StoredInspectionResult = {
  plateNumber: string;
  inspectorName: string;
  inspection: any; // Consider defining a more specific type if possible
  notes: string;
  status: 'Approved' | 'Rejected';
  bodyScore: number;
  interiorScore: number;
  carType?: CarType; // Optional: Add carType if you need to distinguish stored results
};

// This array seems like a local placeholder/example.
// Ensure your actual inspection results are managed appropriately (e.g., fetched/stored).
export const storedInspectionResults: StoredInspectionResult[] = [];
