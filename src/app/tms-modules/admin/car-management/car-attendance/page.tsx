'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiLoader, FiSave, FiList, FiDroplet } from 'react-icons/fi'; // Added FiDroplet
import {
  fetchPlateSuggestionsAPI,
  fetchCarDetailsAPI,
  // Import APIs for attendance and car details
  recordMorningArrivalAPI,
  findTodaysMorningArrivalRecordAPI,
  findLastEveningDepartureRecordAPI,
  recordEveningDepartureAPI,
  // Import Helper functions
  mapCarTypeToVehicleType,
  // Import Interfaces from the API file
  CarDetails,
  PlateSuggestion,
  FrontendAttendanceEntry,
  MorningArrivalRequest,
  EveningDepartureRequest,
} from './components/carAttendanceApi'; // Assuming the api file is in a 'components' subfolder


// Rename FrontendAttendanceEntry to AttendanceEntry for brevity in the component
type AttendanceEntry = FrontendAttendanceEntry;

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

function isMorningAttendance() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 7 && hour < 15;
}

export default function CarAttendancePage() {
  const [carType, setCarType] = useState<'organization' | 'personal' | ''>('');
  const [plateNumberInput, setPlateNumberInput] = useState('');
  const [plateSuggestions, setPlateSuggestions] = useState<PlateSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [selectedCarDetails, setSelectedCarDetails] = useState<CarDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [morningKm, setMorningKm] = useState(''); // State for Morning Arrival KM input
  const [nightKm, setNightKm] = useState(''); // State for Evening Departure KM input
  const [kmDifference, setKmDifference] = useState<number | null>(null);
  const [overnightKmDifference, setOvernightKmDifference] = useState<number | null>(null);
  const [previousEveningKm, setPreviousEveningKm] = useState<number | null>(null);

  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEveningDepartureMode, setIsEveningDepartureMode] = useState(false);
  // Stores the details of the morning arrival record if found
  const [isDayComplete, setIsDayComplete] = useState(false); // New state: true if both morning and evening KM recorded for today
  const [morningArrivalRecordDetails, setMorningArrivalRecordDetails] = useState<AttendanceEntry | null>(null);

  const router = useRouter(); 
  const debouncedFetchSuggestions = useCallback(debounce(fetchPlateSuggestionsAPI, 300), []);

  useEffect(() => {
    setSelectedCarDetails(null);
    setMorningArrivalRecordDetails(null);
    setIsDayComplete(false); // Reset day complete status
    setIsEveningDepartureMode(false); // Reset mode
    setMorningKm('');
    setNightKm('');
    setKmDifference(null);
    setOvernightKmDifference(null);
    setPreviousEveningKm(null);
    setFormMessage(null);

     if (plateNumberInput.trim().length > 1) {
     console.log('Fetching suggestions for:', plateNumberInput, 'with carType:', carType);
       setIsFetchingSuggestions(true);
       debouncedFetchSuggestions(plateNumberInput, carType)
         .then(async suggestions => {
          console.log('Suggestions received:', suggestions);
           setPlateSuggestions(await suggestions);
         })
         .catch(error => {

          console.error("Error fetching plate suggestions:", error);
          setPlateSuggestions([]);
        })
        .finally(() => {
            setIsFetchingSuggestions(false);
        });
    } else {
      setPlateSuggestions([]);
      setIsFetchingSuggestions(false);
    }
  }, [plateNumberInput, carType, debouncedFetchSuggestions]);


  // Function to load car details and check for existing morning arrival record
  const loadCarAndAttendanceStatus = async (plate: string) => {
    setIsFetchingDetails(true);
    setPlateSuggestions([]); // Hide suggestions after selection

    // Clear form message specific to this loading action.
    // Other states (selectedCarDetails, morningKm, etc.) are reset by the main useEffect
    // if plateNumberInput was changed prior to calling this function (e.g., by suggestion click).
    setFormMessage(null); 
    try {
      const details = await fetchCarDetailsAPI(plate);
      if (details) {
        setSelectedCarDetails(details);
        // If carType wasn't set, set it now based on fetched details
        if (carType === '' && (details.carType === 'organization' || details.carType === 'personal')) {
          setCarType(details.carType);
        }

        // Now check for an existing morning arrival record for today
        const existingMorningArrival = await findTodaysMorningArrivalRecordAPI(plate, mapCarTypeToVehicleType(details.carType), details);

        if (existingMorningArrival) {
          setMorningArrivalRecordDetails(existingMorningArrival);
          setMorningKm(existingMorningArrival.morningKm?.toString() || '');

          if (existingMorningArrival.nightKm !== null && typeof existingMorningArrival.nightKm !== 'undefined') {
            setIsDayComplete(true);
            setIsEveningDepartureMode(true); // Keep true for UI context
            setNightKm(existingMorningArrival.nightKm.toString());
            // Calculate and set daily KM difference for display, ensuring morningKm is not null
            const dailyDiff = existingMorningArrival.nightKm - (existingMorningArrival.morningKm ?? 0);
            if (!isNaN(dailyDiff) && dailyDiff >= 0) {
              setKmDifference(dailyDiff);
            } else {
              setKmDifference(null);
            }
            setFormMessage({ type: 'success', text: `Attendance for ${plate} (${details.carType}) is complete for today. Morning: ${existingMorningArrival.morningKm} KM, Evening: ${existingMorningArrival.nightKm} KM.` });
          } else {
            // Only morning KM is recorded, ready for evening departure
            setIsDayComplete(false);
            setIsEveningDepartureMode(true);
            setFormMessage({ type: 'success', text: `Car ${plate} (${details.carType}) has a Morning Arrival at ${existingMorningArrival.morningKm} KM. Ready for Evening Departure.` });
          }
        } else {
          // No morning record found, ready to record morning arrival
          setIsDayComplete(false);
          setIsEveningDepartureMode(false);
          // Fetch last evening KM for all car types to calculate overnight difference
          const lastEveningRecord = await findLastEveningDepartureRecordAPI(plate, mapCarTypeToVehicleType(details.carType), details);
          if (lastEveningRecord && lastEveningRecord.nightKm !== null) {
            setPreviousEveningKm(lastEveningRecord.nightKm);
            setFormMessage({ type: 'success', text: `Car ${plate} (${details.carType}) details loaded. Ready for Morning Arrival. Previous Evening KM: ${lastEveningRecord.nightKm}.` });
          } else {
            setFormMessage({ type: 'success', text: `Car ${plate} (${details.carType}) details loaded. Ready for Morning Arrival. No previous evening KM found.` });
          }
        }
      } else {
        setFormMessage({ type: 'error', text: `Car with plate ${plate} not found.` });
        // Keep plateNumberInput as entered by user for correction
        setSelectedCarDetails(null); // Ensure no car is selected
      }
    } catch (error: any) {
      console.error("Error loading car/attendance status:", error);
      setFormMessage({ type: 'error', text: error.message || 'Failed to load car/attendance status. Please try again.' });
      setSelectedCarDetails(null); // Ensure no car is selected on error
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Handle click on a plate suggestion
  const handlePlateSuggestionClick = (suggestion: PlateSuggestion) => {
    setPlateNumberInput(suggestion.plate); // Update input field with selected plate
    loadCarAndAttendanceStatus(suggestion.plate); // Load details and status for the selected plate
  };

  // Effect to calculate KM difference when in Evening Departure mode and nightKm changes
  useEffect(() => {
    if (isEveningDepartureMode && morningArrivalRecordDetails) {
      const morningArrivalKmVal = morningArrivalRecordDetails.morningKm;
      const eveningDepartureKmVal = parseFloat(nightKm); // 'nightKm' state holds evening departure KM

      if (
        morningArrivalKmVal !== null &&
        !isNaN(eveningDepartureKmVal) &&
        eveningDepartureKmVal >= morningArrivalKmVal
      ) {
        setKmDifference(eveningDepartureKmVal - morningArrivalKmVal);
      } else {
        setKmDifference(null); // Reset difference if invalid input
      }
    } else {
      setKmDifference(null); // Not in Evening Departure mode
    }
  }, [nightKm, isEveningDepartureMode, morningArrivalRecordDetails]);

  // Effect to calculate Overnight KM difference when in Morning Arrival mode and morningKm or previousEveningKm changes
  useEffect(() => {
    if (
      !isEveningDepartureMode &&
      selectedCarDetails && // Calculate for any selected car
      previousEveningKm !== null &&
      morningKm.trim() !== '') {
      const currentMorningKmVal = parseFloat(morningKm);
      if (!isNaN(currentMorningKmVal) && currentMorningKmVal >= previousEveningKm) {
        setOvernightKmDifference(currentMorningKmVal - previousEveningKm);
      } else {
        setOvernightKmDifference(null); // Reset if morning KM is less or invalid
      }
    } else {
      // Clear if conditions are not met (e.g., no previous KM, morning KM input empty, etc.)
      setOvernightKmDifference(null);
    }
  }, [morningKm, previousEveningKm, isEveningDepartureMode, selectedCarDetails]);


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null); // Clear previous messages
    setIsSubmitting(true); // Start submitting state

    if (!selectedCarDetails) {
      setFormMessage({ type: 'error', text: 'Please select a valid car first.' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEveningDepartureMode && morningArrivalRecordDetails) {
        // --- Handle Evening Departure KM Recording ---
        const eveningDepartureKmVal = parseFloat(nightKm);
        const morningArrivalKmVal = morningArrivalRecordDetails.morningKm;

        if (morningArrivalKmVal === null) {
          setFormMessage({ type: 'error', text: 'Morning arrival KM is missing. Cannot record evening departure.' });
          setIsSubmitting(false);
          return;
        }

        if (isNaN(eveningDepartureKmVal) || eveningDepartureKmVal < morningArrivalKmVal) {
          setFormMessage({ type: 'error', text: 'Evening Departure KM must be a valid number and greater than or equal to Morning Arrival KM.' });
          setIsSubmitting(false);
          return;
        }

        // Recalculate difference just before saving to be safe
        const finalKmDifference = eveningDepartureKmVal - morningArrivalKmVal;
        if (isNaN(finalKmDifference) || finalKmDifference < 0) {
           setFormMessage({ type: 'error', text: 'KM difference calculation failed.' });
           setIsSubmitting(false); return;
        }

        const departureRequest: EveningDepartureRequest = {
          eveningKm: eveningDepartureKmVal,
          // Fuel fields are optional and not sent from here
        };
        // morningArrivalRecordDetails.id is now a number
        const recordedDeparture = await recordEveningDepartureAPI(morningArrivalRecordDetails.id, departureRequest, selectedCarDetails);
        const displayedKmDifference = recordedDeparture.kmDifference ?? finalKmDifference;
        setFormMessage({ type: 'success', text: `Evening Departure for ${selectedCarDetails.plateNumber} recorded. KM used today: ${displayedKmDifference} KM.` });

      } else {
        // --- Handle Morning Arrival KM Recording ---
        const morningArrivalKmVal = parseFloat(morningKm);
        if (isNaN(morningArrivalKmVal) || morningArrivalKmVal < 0) {
          setFormMessage({ type: 'error', text: 'Morning Arrival KM must be a valid positive number.' });
          setIsSubmitting(false); return;
        }
        if (selectedCarDetails.carType === 'organization' && previousEveningKm !== null && morningArrivalKmVal < previousEveningKm) {
          setFormMessage({ type: 'error', text: 'Morning KM cannot be less than previous evening KM for organization cars.' });
          setIsSubmitting(false); return;
        }

        const arrivalRequest: MorningArrivalRequest = {
            plateNumber: selectedCarDetails.plateNumber,
            vehicleType: mapCarTypeToVehicleType(selectedCarDetails.carType),
            morningKm: morningArrivalKmVal,
            overnightKmDifference: overnightKmDifference, // Send the calculated overnight difference
            // Fuel fields are optional and not sent from here
        };

        await handleAttendanceSubmit(arrivalRequest);
      }

      // Reset form after successful submission
      resetFormState();

    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      setFormMessage({ type: 'error', text: error.message || 'Failed to submit attendance. Please try again.' });
    } finally {
      setIsSubmitting(false); // End submitting state
    }
  };

  const handleAttendanceSubmit = async (payload: MorningArrivalRequest) => {
    try {
      const payloadWithTimeCheck = {
        ...payload,
        isMorning: isMorningAttendance(),
      };

      // Show confirm dialog if not morning
      if (!payloadWithTimeCheck.isMorning) {
        const confirmed = window.confirm(
          "Warning: You are not within the morning attendance time (7:00 - 15:00).\nDo you want to proceed with registering the attendance?"
        );
        if (!confirmed) {
          // User cancelled, do not proceed
          setIsSubmitting(false); // Ensure submitting state is reset
          return;
        }
      }

      await recordMorningArrivalAPI(payloadWithTimeCheck, selectedCarDetails);
      // ...success logic...
    } catch (err: any) {
      let errorMsg = "Failed to record attendance.";
      if (err?.response?.status === 500) {
        errorMsg = `The car with plate number ${payload.plateNumber} is already checked for today.`;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      alert(errorMsg);
    }
  };

  // Function to reset all form-related states
  const resetFormState = () => {
    setCarType(''); // Reset car type filter
    setPlateNumberInput(''); // This will trigger the main useEffect to reset other dependent states and suggestions
    // The main useEffect watching plateNumberInput and carType will handle resetting:
    // - selectedCarDetails, morningArrivalRecordDetails, isEveningDepartureMode
    // - morningKm, nightKm, kmDifference, overnightKmDifference, previousEveningKm
    // - plateSuggestions (if plateNumberInput becomes empty)    
    // - formMessage is reset in handleSubmit or when plateNumberInput changes
  };

  // Function to navigate to the all records page
  const handleShowAllRecords = () => {
    router.push('/tms-modules/admin/car-management/car-attendance/all-records');
  };

  // Function to navigate to the fuel entry page
  const handleAddFuelEntry = () => {
    router.push('/tms-modules/admin/car-management/car-attendance/fuel-entry');
  };

  // Helper to display date, ensuring it's treated as local
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    // Assuming dateString is YYYY-MM-DD from backend
    // Append T00:00:00 to ensure it's parsed as local midnight to avoid timezone shifts with toLocaleDateString
    return new Date(dateString + 'T00:00:00').toLocaleDateString();
  };

    // DEBUG: Log selectedCarDetails
    console.log('selectedCarDetails:', selectedCarDetails);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Record Car Attendance</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddFuelEntry}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
          >
            <FiDroplet className="mr-2" /> Add Fuel
          </button>
          <button
            onClick={handleShowAllRecords}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
          >
            <FiList className="mr-2" /> All Records
          </button>
        </div>
      </div>

      {formMessage && (
        <div className={`mb-4 p-3 rounded ${formMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {formMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="carType" className="block text-sm font-medium text-gray-700">Car Type</label>
          <select
            id="carType"
            value={carType}
            onChange={(e) => {
                setCarType(e.target.value as 'organization' | 'personal' | '');
                // Reset plate input and dependent states if car type changes
                if (plateNumberInput) setPlateNumberInput(''); // This triggers the useEffect to reset other states
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            // Disable type selection if a car is already selected, to avoid confusion
            disabled={!!selectedCarDetails || isFetchingDetails || isFetchingSuggestions}
          >
            <option value="">Any</option>
            <option value="organization">Organization</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div className="relative">
          <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">Plate Number</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="plateNumber"
              value={plateNumberInput}
              onChange={(e) => {
                setPlateNumberInput(e.target.value);
                // Clearing selectedCarDetails and status is now handled in the useEffect
              }}
              placeholder="Enter plate number"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isFetchingDetails || isSubmitting || isDayComplete} // Disable if day is complete
            />
            {isFetchingSuggestions && <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />}
          </div>
          {/* Show suggestions only if input has value, not fetching, and suggestions exist */}
          {plateNumberInput.length > 0 && !isFetchingSuggestions && plateSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
              {plateSuggestions.map(suggestion => (
                <li
                  key={suggestion.id}
                  onClick={() => handlePlateSuggestionClick(suggestion)}
                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                >
                  {suggestion.plate} ({suggestion.type})
                </li>
              ))}
            </ul>
          )}
        </div>

        {isFetchingDetails && <p className="text-sm text-indigo-600 flex items-center"><FiLoader className="animate-spin mr-2" /> Loading car status...</p>}

        {selectedCarDetails && (
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-3">
            <div className="text-center font-semibold text-indigo-700 text-lg capitalize">
              {isDayComplete
                ? `Attendance Complete for: ${selectedCarDetails.plateNumber}`
                : isEveningDepartureMode
                  ? `Record Evening Departure (approx. 5 PM) for: ${selectedCarDetails.plateNumber}`
                  : `Record Morning Arrival for: ${selectedCarDetails.plateNumber}`}
            </div>
            <div className="grid grid-cols-2 gap-x-4 text-sm">
                <p><span className="font-semibold">Driver:</span> {selectedCarDetails.driverName}</p>
                <p><span className="font-semibold">KM/Liter:</span> {selectedCarDetails.kmPerLiter} km/l</p>
            </div>
            {isEveningDepartureMode && morningArrivalRecordDetails && (
                 <p className="text-sm text-center bg-yellow-100 p-2 rounded-md"><span className="font-semibold">Morning Arrival was at:</span> {morningArrivalRecordDetails.morningKm} KM on {formatDate(morningArrivalRecordDetails.date)}</p>
            )}
            {!isEveningDepartureMode && !isDayComplete && previousEveningKm !== null && (
              <p className="text-sm text-center bg-blue-100 p-2 rounded-md"><span className="font-semibold">Previous Evening Departure KM:</span> {previousEveningKm}</p>
            )}
            {/* Add a message prompting for Morning KM if previous evening KM exists but morning KM is not yet entered */}
            {!isEveningDepartureMode && !isDayComplete && previousEveningKm !== null && morningKm.trim() === '' && (
              <p className="text-sm text-center text-gray-600 mt-2">Enter Morning KM to see overnight difference.</p>
            )}
            {!isEveningDepartureMode && !isDayComplete && overnightKmDifference !== null && (
              <p className="text-sm text-center bg-green-100 p-2 rounded-md"><span className="font-semibold">Overnight KM Used:</span> {overnightKmDifference} KM</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="morningKm" className="block text-sm font-medium text-gray-700">Morning Arrival KM</label>
            <input
              type="number"
              id="morningKm"
              value={morningKm}
              onChange={(e) => setMorningKm(e.target.value)}
              placeholder="KM at morning arrival"
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isEveningDepartureMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              min="0"
              required={!isDayComplete} // Not required if day is complete
              disabled={!selectedCarDetails || isEveningDepartureMode || isSubmitting || isDayComplete}
              readOnly={isEveningDepartureMode || isDayComplete}
            />
          </div>
          <div>
            <label htmlFor="nightKm" className="block text-sm font-medium text-gray-700">Evening Departure KM (approx. 5 PM)</label>
            <input
              type="number"
              id="nightKm"
              value={nightKm}
              onChange={(e) => setNightKm(e.target.value)}
              placeholder="KM at evening departure"
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEveningDepartureMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              min={morningKm || "0"}
              required={isEveningDepartureMode && !isDayComplete} // Required if in evening mode and not complete
              disabled={!selectedCarDetails || !isEveningDepartureMode || !morningArrivalRecordDetails || isSubmitting || isDayComplete}
            />
          </div>
        </div>

        {/* Show KM difference only if calculated and in Evening Departure mode */}
        {isEveningDepartureMode && kmDifference !== null && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
            <p className="text-sm font-semibold text-indigo-700">KM Driven for Organization Today: {kmDifference} km</p>
          </div>
        )}

        <button
          type="submit"
          disabled={
            !selectedCarDetails ||
            isFetchingDetails ||
            isSubmitting ||
            (isEveningDepartureMode && !morningArrivalRecordDetails) ||
            isDayComplete // Disable if the day's attendance is already complete
          }
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
          {isEveningDepartureMode ? 'Record Evening Departure & Finalize Day' : 'Record Morning Arrival'}
        </button>
      </form>
    </div>
  );
}
