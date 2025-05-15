// c:/Users/biruk/Desktop/TMS/TMS-frontendd/src/app/tms-modules/admin/car-management/car-attendance/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { FiSearch, FiLoader, FiSave, FiList } from 'react-icons/fi'; // Added FiList
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


// Debounce function (moved outside for stability)
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};


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

  // Consolidated State for fuel filling
  const [fuelFilled, setFuelFilled] = useState(false);
  const [fuelLiters, setFuelLiters] = useState('');
  const [kmAtFueling, setKmAtFueling] = useState(''); // UI only for now, not sent to backend yet
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the two-step attendance process
  // True if a morning arrival has been recorded and we're ready for evening departure KM
  const [isEveningDepartureMode, setIsEveningDepartureMode] = useState(false);
  // Stores the details of the morning arrival record if found
  const [isDayComplete, setIsDayComplete] = useState(false); // New state: true if both morning and evening KM recorded for today
  const [morningArrivalRecordDetails, setMorningArrivalRecordDetails] = useState<AttendanceEntry | null>(null);

  const router = useRouter(); // Initialize router

  // Debounced fetch for plate suggestions
  // `fetchPlateSuggestionsAPI` is stable as it's defined outside the component.
  const debouncedFetchSuggestions = useCallback(debounce(fetchPlateSuggestionsAPI, 300), []);

  // Effect to fetch suggestions as plateNumberInput changes
  useEffect(() => {
    // Clear selected car details and attendance status when input changes significantly
    setSelectedCarDetails(null);
    setMorningArrivalRecordDetails(null);
    setIsDayComplete(false); // Reset day complete status
    setIsEveningDepartureMode(false); // Reset mode
    setMorningKm('');
    setNightKm('');
    setKmDifference(null);
    setOvernightKmDifference(null);
    setPreviousEveningKm(null);
    setFuelFilled(false); // Reset consolidated fuel state
    setFuelLiters('');
    setKmAtFueling('');
    setFormMessage(null);

     if (plateNumberInput.trim().length > 1) {
     console.log('Fetching suggestions for:', plateNumberInput, 'with carType:', carType);
       setIsFetchingSuggestions(true);
       debouncedFetchSuggestions(plateNumberInput, carType)
         .then(suggestions => {
          console.log('Suggestions received:', suggestions);
           setPlateSuggestions(suggestions);
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
        const vehicleType = mapCarTypeToVehicleType(details.carType);
        const existingMorningArrival = await findTodaysMorningArrivalRecordAPI(plate, vehicleType);

        if (existingMorningArrival) {
          setMorningArrivalRecordDetails(existingMorningArrival);
          setMorningKm(existingMorningArrival.morningKm.toString());

          // Check if evening KM is also recorded, meaning the day is complete
          if (existingMorningArrival.nightKm !== null && typeof existingMorningArrival.nightKm !== 'undefined') {
            setIsDayComplete(true);
            setIsEveningDepartureMode(true); // Keep true for UI context
            setNightKm(existingMorningArrival.nightKm.toString());
            // Calculate and set daily KM difference for display
            const dailyDiff = existingMorningArrival.nightKm - existingMorningArrival.morningKm;
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
          const lastEveningRecord = await findLastEveningDepartureRecordAPI(plate, vehicleType);
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

      if (!isNaN(morningArrivalKmVal) && !isNaN(eveningDepartureKmVal) && eveningDepartureKmVal >= morningArrivalKmVal) {
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
        if (isNaN(eveningDepartureKmVal) || eveningDepartureKmVal < morningArrivalRecordDetails.morningKm) {
          setFormMessage({ type: 'error', text: 'Evening Departure KM must be a valid number and greater than or equal to Morning Arrival KM.' });
          setIsSubmitting(false);
          return;
        }

        // Recalculate difference just before saving to be safe
        const finalKmDifference = eveningDepartureKmVal - morningArrivalRecordDetails.morningKm;
        if (isNaN(finalKmDifference) || finalKmDifference < 0) {
           setFormMessage({ type: 'error', text: 'KM difference calculation failed.' });
           setIsSubmitting(false); return;
        }

        let currentFuelLiters: number | null = null;
        let currentKmAtFueling: number | null = null;

        if (fuelFilled && fuelLiters.trim() !== '') {
          currentFuelLiters = parseFloat(fuelLiters);
          if (kmAtFueling.trim() !== '') {
            currentKmAtFueling = parseFloat(kmAtFueling);
          }
        }

        const departureRequest: EveningDepartureRequest = {
          eveningKm: eveningDepartureKmVal,
          fuelLitersAdded: currentFuelLiters,
          kmAtFueling: currentKmAtFueling,
        };
        // morningArrivalRecordDetails.id is now a number
        const recordedDeparture = await recordEveningDepartureAPI(morningArrivalRecordDetails.id, departureRequest, selectedCarDetails);
        const displayedKmDifference = recordedDeparture.dailyKmDifference ?? finalKmDifference;
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

        let currentFuelLiters: number | null = null;
        let currentKmAtFueling: number | null = null;

        if (fuelFilled && fuelLiters.trim() !== '') {
          currentFuelLiters = parseFloat(fuelLiters);
          if (kmAtFueling.trim() !== '') {
            currentKmAtFueling = parseFloat(kmAtFueling);
          }
        }

        const arrivalRequest: MorningArrivalRequest = {
            plateNumber: selectedCarDetails.plateNumber,
            vehicleType: mapCarTypeToVehicleType(selectedCarDetails.carType),
            morningKm: morningArrivalKmVal,
            overnightKmDifference: overnightKmDifference, // Send the calculated overnight difference
            fuelLitersAdded: currentFuelLiters,
            kmAtFueling: currentKmAtFueling,
        };
        const recordedArrival = await recordMorningArrivalAPI(arrivalRequest, selectedCarDetails);

        let successMessage = `Morning Arrival for ${selectedCarDetails.plateNumber} recorded at ${morningArrivalKmVal} KM.`;
        // Use overnightKmDifference from response if available, otherwise from local calculation
        const overnightDiffToDisplay = recordedArrival.overnightKmDifference ?? overnightKmDifference;
        if (overnightDiffToDisplay !== null) {
          successMessage += ` Overnight KM: ${overnightDiffToDisplay}`;
        }
        if (currentFuelLiters !== null) {
          successMessage += ` Fuel added: ${currentFuelLiters}L.`;
        }
        setFormMessage({ type: 'success', text: successMessage });
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

  // Function to reset all form-related states
  const resetFormState = () => {
    setCarType(''); // Reset car type filter
    setPlateNumberInput(''); // This will trigger the main useEffect to reset other dependent states and suggestions
    // The main useEffect watching plateNumberInput and carType will handle resetting:
    // - selectedCarDetails, morningArrivalRecordDetails, isEveningDepartureMode
    // - morningKm, nightKm, kmDifference, overnightKmDifference, previousEveningKm
    // - plateSuggestions (if plateNumberInput becomes empty)
    // - Consolidated Fuel related states
    setFuelFilled(false);
    setFuelLiters('');
    setKmAtFueling('');
    // - formMessage
  };

  // Function to navigate to the all records page
  const handleShowAllRecords = () => {
    router.push('/tms-modules/admin/car-management/car-attendance/all-records');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Record Car Attendance</h1>
        <button
          onClick={handleShowAllRecords}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
        >
          <FiList className="mr-2" /> Show All Records
        </button>
      </div>

      {formMessage && (
        <div className={`p-3 mb-4 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                 <p className="text-sm text-center bg-yellow-100 p-2 rounded-md"><span className="font-semibold">Morning Arrival was at:</span> {morningArrivalRecordDetails.morningKm} KM on {formatDate(morningArrivalRecordDetails.attendanceDate)}</p>
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

        {/* Consolidated Fuel Filling Section - Show if a car is selected */}
        {selectedCarDetails && (
          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Fuel Details (If Applicable)</h3>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="fuelFilled"
                checked={fuelFilled}
                onChange={(e) => setFuelFilled(e.target.checked)}
                disabled={isSubmitting || isDayComplete}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="fuelFilled"
                className="ml-2 block text-sm text-gray-900"
              >
                Fuel was added?
              </label>
            </div>
            {fuelFilled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="fuelLiters" className="block text-sm font-medium text-gray-700">Liters Added</label><input type="number" id="fuelLiters" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} placeholder="e.g., 30" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDayComplete ? 'bg-gray-100 cursor-not-allowed' : ''}`} min="0" step="0.01" disabled={isDayComplete} /></div>
                <div><label htmlFor="kmAtFueling" className="block text-sm font-medium text-gray-700">KM at Fueling</label><input type="number" id="kmAtFueling" value={kmAtFueling} onChange={(e) => setKmAtFueling(e.target.value)} placeholder="Odometer at fueling" className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isDayComplete ? 'bg-gray-100 cursor-not-allowed' : ''}`} min="0" disabled={isDayComplete} /></div>
              </div>
            )}
          </div>
        )}

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
