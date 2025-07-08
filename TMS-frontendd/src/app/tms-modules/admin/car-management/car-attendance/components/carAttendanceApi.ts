// c:\Users\biruk\Desktop\TMS\TMS-frontendd\src\app\tms-modules\admin\car-management\car-attendance\components\carAttendanceApi.ts

// --- Constants ---
const API_ATTENDANCE_BASE_URL = '${process.env.NEXT_PUBLIC_API_BASE_URL}/api/car-attendance'; // For attendance specific endpoints
const API_VEHICLES_BASE_URL = '${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles'; // For vehicle specific endpoints

// --- Frontend-specific Interfaces (mostly for mock functions or component state) ---
export interface CarDetails {
  currentKm: string; // Used by mock fetchCarDetailsAPI and component state
  driverName: string;
  kmPerLiter: number;
  plateNumber: string;
  carType: 'organization' | 'personal';
}

export interface PlateSuggestion { // Used by mock fetchPlateSuggestionsAPI and component state
  id: string;
  plate: string;
  type: 'organization' | 'personal';
}

// --- Interfaces aligned with Backend DTOs ---

// Assumed Backend DTO for vehicle details (replaces mock CarDetails source)
export interface BackendVehicleDTO {
  // id: string; // Or number, if your vehicle has a separate primary key
  plateNumber: string;
  driverName: string;
  kmPerLiter: number;
  vehicleType: string; // e.g., "ORGANIZATION_CAR", "CAR" (matches backend enum/string)
}

// Assumed Backend DTO for plate suggestions
export interface BackendPlateSuggestionDTO {
  plateNumber: string;
  vehicleType: string; // e.g., "ORGANIZATION_CAR", "CAR"
}

// Matches backend CarAttendanceResponseDTO
export interface BackendCarAttendanceResponse {
  id: number; // Long in backend
  vehiclePlateNumber: string; // As per backend DTO: dto.setVehiclePlateNumber
  vehicleType: string; // "CAR" or "ORGANIZATION_CAR"
  // driverName and kmPerLiter are not directly in CarAttendanceResponseDTO,
  // they are properties of the Vehicle. If needed, they'd be fetched separately
  // or added to the DTO on the backend if it makes sense for the use case.
  // For now, assuming they are primarily used for creating new records from CarDetails.
  date: string; // YYYY-MM-DD - Matches the actual backend response field name
  morningKm: number | null; // Can be null if not set
  eveningKm: number | null;
  overnightKmDifferenceFromPrevious: number | null; // Aligned with backend DTO
  dailyKmDifference: number | null; // Aligned with backend DTO
  fuelLitersAdded: number | null;
  kmAtFueling?: number | null; // New: KM reading when fuel was added
  createdAt: string; // Assuming ISO string date
  updatedAt: string; // Assuming ISO string date
}

// This is the structure the frontend component will primarily work with for attendance records.
export interface FrontendAttendanceEntry {
  id: number;
  plateNumber: string; // Derived from vehiclePlateNumber
  carType: 'organization' | 'personal'; // Mapped from vehicleType
  driverName: string; // This will come from selectedCarDetails, not directly from attendance response
  kmPerLiter: number; // This will come from selectedCarDetails, not directly from attendance response
  date: string; // Aligned with BackendCarAttendanceResponse.date
  morningKm: number | null;
  nightKm: number | null; // Alias for eveningKm
  overnightKmDifference: number | null; // Mapped from overnightKmDifferenceFromPrevious
  kmDifference: number | null; // Mapped from dailyKmDifference
  fuelLitersAdded: number | null;
  kmAtFueling?: number | null; // New: KM reading when fuel was added
}

// Matches backend MorningArrivalRequestDTO
export interface MorningArrivalRequest {
  plateNumber: string;
  vehicleType: string;
  morningKm: number;
  // driverName and kmPerLiter are not part of the backend MorningArrivalRequestDTO.
  // The backend likely derives or fetches this information based on plateNumber and vehicleType.
  kmAtFueling?: number | null; // New: KM reading when fuel was added
  fuelLitersAdded?: number | null; // Optional, as per backend DTO
}

// Matches backend EveningDepartureRequestDTO
export interface EveningDepartureRequest {
  eveningKm: number; // Aligned with backend DTO
  // kmDifference is calculated by backend, not sent by frontend in this DTO
  fuelLitersAdded?: number | null; // Optional, as per backend DTO
  kmAtFueling?: number | null; // New: KM reading when fuel was added
}



// --- Helper Functions ---
export const mapCarTypeToVehicleType = (carType: 'organization' | 'personal'): string => {
  if (carType === 'organization') return 'ORGANIZATION_CAR';
  if (carType === 'personal') return 'CAR';
  console.warn(`Unexpected carType for mapping: ${carType}`);
  return carType.toUpperCase(); // Fallback
};

export const mapVehicleTypeToCarType = (vehicleType: string): 'organization' | 'personal' => {
  if (vehicleType === 'ORGANIZATION_CAR') return 'organization';
  if (vehicleType === 'CAR') return 'personal';
  console.warn(`Unexpected vehicleType from backend: ${vehicleType}, defaulting to personal`);
  return 'personal'; // Fallback
};

const transformBackendResponseToFrontendEntry = (
  backendData: BackendCarAttendanceResponse,

  carDetailsContext?: CarDetails | null
): FrontendAttendanceEntry => {
  return {
    id: backendData.id,
    plateNumber: backendData.vehiclePlateNumber,
    carType: mapVehicleTypeToCarType(backendData.vehicleType),
    // Populate from context if available, otherwise they'd be missing
    driverName: carDetailsContext?.driverName || 'N/A',
    kmPerLiter: carDetailsContext?.kmPerLiter || 0,
    date: backendData.date,
    morningKm: backendData.morningKm,
    nightKm: backendData.eveningKm,
    overnightKmDifference: backendData.overnightKmDifferenceFromPrevious,
    kmDifference: backendData.dailyKmDifference,
    fuelLitersAdded: backendData.fuelLitersAdded,
    kmAtFueling: backendData.kmAtFueling,
  };
};

export const fetchPlateSuggestionsAPI = async (query: string, carTypeFilter: 'organization' | 'personal' | ''): Promise<PlateSuggestion[]> => {
  const params = new URLSearchParams();
  if (query) {
    params.append('query', query);
  }
  if (carTypeFilter) {
    params.append('vehicleType', mapCarTypeToVehicleType(carTypeFilter));
  }

  const response = await fetch(`${API_VEHICLES_BASE_URL}/suggestions?${params.toString()}`);

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to fetch plate suggestions: ${errorMessage}`);
  }

  const backendSuggestions: BackendPlateSuggestionDTO[] = await response.json();
  return backendSuggestions.map(suggestion => ({
    id: suggestion.plateNumber, // Assuming plateNumber is unique enough for ID in suggestions
    plate: suggestion.plateNumber,
    type: mapVehicleTypeToCarType(suggestion.vehicleType),
  }));
};

// Fetches car details from the backend by plate number
export const fetchCarDetailsAPI = async (plateNumber: string): Promise<CarDetails | null> => {
  if (!plateNumber) return null;

  const response = await fetch(`${API_VEHICLES_BASE_URL}/by-plate/${encodeURIComponent(plateNumber)}`);

  if (response.status === 404) {
    return null; // Car not found
  }

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to fetch car details: ${errorMessage}`);
  }

  const backendVehicle: BackendVehicleDTO = await response.json();
  return {
    plateNumber: backendVehicle.plateNumber,
    driverName: backendVehicle.driverName,
    kmPerLiter: backendVehicle.kmPerLiter,
    carType: mapVehicleTypeToCarType(backendVehicle.vehicleType),
  };
};

export const recordMorningArrivalAPI = async (
    requestData: MorningArrivalRequest,
    selectedCarDetails: CarDetails | null // To provide context for the response transformation
): Promise<FrontendAttendanceEntry> => {
  const response = await fetch(`${API_ATTENDANCE_BASE_URL}/morning-arrival`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to record morning arrival: ${errorMessage}`);
  }
  const backendResponse: BackendCarAttendanceResponse = await response.json();
  return transformBackendResponseToFrontendEntry(backendResponse, selectedCarDetails);
};

export const fetchAllAttendanceRecordsAPI = async (): Promise<FrontendAttendanceEntry[]> => {
  const response = await fetch(`${API_ATTENDANCE_BASE_URL}`);

  if (response.status === 204) {
    return []; // No content, return empty array
  }

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to fetch all attendance records: ${errorMessage}`);
  }

  const backendRecords: BackendCarAttendanceResponse[] = await response.json();
  // For a list, we don't have specific CarDetails context for each item.
  // The transformWithContext function will use default fallbacks for driverName and kmPerLiter.
  return backendRecords.map(record => transformBackendResponseToFrontendEntry(record, null));
};

export const findTodaysMorningArrivalRecordAPI = async (
    plateNumber: string,
    vehicleType: string,
    selectedCarDetails: CarDetails | null // To provide context for the response transformation
): Promise<FrontendAttendanceEntry | null> => {
  const response = await fetch(`${API_ATTENDANCE_BASE_URL}/today-morning-arrival/${encodeURIComponent(plateNumber)}/${encodeURIComponent(vehicleType)}`);
  if (response.status === 204) return null; // No content
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to find today's morning arrival: ${errorMessage}`);
  }
  const backendResponse: BackendCarAttendanceResponse = await response.json();
  return transformBackendResponseToFrontendEntry(backendResponse, selectedCarDetails);
};

export const findLastEveningDepartureRecordAPI = async (
    plateNumber: string,
    vehicleType: string,
    selectedCarDetails: CarDetails | null // To provide context for the response transformation
): Promise<FrontendAttendanceEntry | null> => {
  const response = await fetch(`${API_ATTENDANCE_BASE_URL}/last-evening-departure/${encodeURIComponent(plateNumber)}/${encodeURIComponent(vehicleType)}`);
  if (response.status === 204) return null; // No content
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to find last evening departure: ${errorMessage}`);
  }
  const backendResponse: BackendCarAttendanceResponse = await response.json();
  return transformBackendResponseToFrontendEntry(backendResponse, selectedCarDetails);
};

export const recordEveningDepartureAPI = async (
    attendanceId: number,
    requestData: EveningDepartureRequest,
    selectedCarDetails: CarDetails | null // To provide context for the response transformation
): Promise<FrontendAttendanceEntry> => {
  const response = await fetch(`${API_ATTENDANCE_BASE_URL}/evening-departure/${attendanceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) { /* Ignore if response is not JSON */ }
    throw new Error(`Failed to record evening departure: ${errorMessage}`);
  }
  const backendResponse: BackendCarAttendanceResponse = await response.json();
  return transformBackendResponseToFrontendEntry(backendResponse, selectedCarDetails);
};
