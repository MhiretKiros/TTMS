'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiLoader, FiSave, FiDroplet, FiCalendar, FiChevronsLeft } from 'react-icons/fi';
import {
  fetchPlateSuggestionsAPI,
  fetchCarDetailsAPI,
  mapCarTypeToVehicleType,
  submitFuelEntryAPI,
  PlateSuggestion,
  CarDetails,
  FuelEntryRequest,
} from '../fuel-entry/components/fuelEntryApi';

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export default function FuelEntryPage() {
  const router = useRouter();
  const [carType, setCarType] = useState<'organization' | 'personal' | ''>('');
  const [plateNumberInput, setPlateNumberInput] = useState('');
  const [plateSuggestions, setPlateSuggestions] = useState<PlateSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [selectedCarDetails, setSelectedCarDetails] = useState<CarDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [fuelLiters, setFuelLiters] = useState('');
  const [kmAtFueling, setKmAtFueling] = useState('');
  const [fuelingDate, setFuelingDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedFetchSuggestions = useCallback(debounce(fetchPlateSuggestionsAPI, 300), []);

  const resetFormFields = () => {
    setFuelLiters('');
    setKmAtFueling('');
    setFuelingDate(new Date().toISOString().split('T')[0]);
    // Keep selected car or reset as preferred
  };

  useEffect(() => {
    setSelectedCarDetails(null);
    resetFormFields();
    setFormMessage(null);

    if (plateNumberInput.trim().length > 1) {
      setIsFetchingSuggestions(true);
      debouncedFetchSuggestions(plateNumberInput, carType)
        .then(async suggestions => setPlateSuggestions(await suggestions))
        .catch(error => {
          console.error("Error fetching plate suggestions:", error);
          setPlateSuggestions([]);
          setFormMessage({ type: 'error', text: 'Could not fetch plate suggestions.' });
        })
        .finally(() => setIsFetchingSuggestions(false));
    } else {
      setPlateSuggestions([]);
    }
  }, [plateNumberInput, carType, debouncedFetchSuggestions]);

  const loadCarDetails = async (plate: string) => {
    setIsFetchingDetails(true);
    setPlateSuggestions([]);
    setFormMessage(null);
    try {
      const details = await fetchCarDetailsAPI(plate);
      setSelectedCarDetails(details);
      if (details && carType === '' && (details.carType === 'organization' || details.carType === 'personal')) {
        setCarType(details.carType as 'organization' | 'personal');
      }
      if (!details) {
        setFormMessage({ type: 'error', text: `Car with plate ${plate} not found.` });
      } else {
        setFormMessage({ type: 'success', text: `Selected car: ${details.plateNumber} (${details.carType}). Current KM: ${details.currentKm || 'N/A'}` });
      }
    } catch (error: any) {
      console.error("Error loading car details:", error);
      setFormMessage({ type: 'error', text: error.message || 'Failed to load car details.' });
      setSelectedCarDetails(null);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handlePlateSuggestionClick = (suggestion: PlateSuggestion) => {
    setPlateNumberInput(suggestion.plate);
    loadCarDetails(suggestion.plate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);

    if (!selectedCarDetails) {
      setFormMessage({ type: 'error', text: 'Please select a car first.' });
      return;
    }
    if (!fuelLiters || !kmAtFueling || !fuelingDate) {
      setFormMessage({ type: 'error', text: 'Please fill all fuel details: Liters, KM at Fueling, and Date.' });
      return;
    }
    const liters = parseFloat(fuelLiters);
    const km = parseFloat(kmAtFueling);

    if (isNaN(liters) || liters <= 0) {
      setFormMessage({ type: 'error', text: 'Liters added must be a positive number.' });
      return;
    }
    if (isNaN(km) || km < 0) {
      setFormMessage({ type: 'error', text: 'KM at fueling must be a valid number.' });
      return;
    }
    if (selectedCarDetails.currentKm && km < Number(selectedCarDetails.currentKm)) {
        setFormMessage({ type: 'error', text: `KM at fueling (${km}) cannot be less than the car's last recorded KM (${selectedCarDetails.currentKm}).` });
        return;
    }

    setIsSubmitting(true);
    const fuelData: FuelEntryRequest = {
      vehiclePlateNumber: selectedCarDetails.plateNumber,
      vehicleType: mapCarTypeToVehicleType(selectedCarDetails.carType),
      litersAdded: liters,
      kmAtFueling: km,
      fuelingDate: fuelingDate,
    };

    try {
      console.log('Submitting fuel entry:', fuelData);
      const response = await submitFuelEntryAPI(fuelData);
      setFormMessage({ type: 'success', text: response.message || `Fuel entry for ${selectedCarDetails.plateNumber} recorded successfully!` });
      // Reset form for next entry
      setPlateNumberInput(''); // This will trigger useEffect to clear car selection and suggestions
      setCarType('');
      // resetFormFields(); // Already called by useEffect when plateNumberInput changes
    } catch (error: any) {
      console.error("Error submitting fuel entry:", error);
      setFormMessage({ type: 'error', text: error.message || 'Failed to submit fuel entry.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate KM per Liter
  const liters = parseFloat(fuelLiters);
  const kmFuel = parseFloat(kmAtFueling);

  const kmPerLiter =
    !isNaN(liters) &&
    liters > 0 &&
    !isNaN(kmFuel)
      ? (kmFuel / liters).toFixed(2)
      : null;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-lg">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FiChevronsLeft className="mr-2 h-4 w-4" /> Back to Attendance
      </button>

      <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">Add Fuel Entry</h1>

      {formMessage && (
        <div className={`p-3 mb-4 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {formMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Car Selection identical to CarAttendancePage */}
        <div>
          <label htmlFor="carType" className="block text-sm font-medium text-gray-700">Car Type</label>
          <select id="carType" value={carType} onChange={(e) => setCarType(e.target.value as any)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!!selectedCarDetails || isFetchingDetails || isFetchingSuggestions || isSubmitting}>
            <option value="">Any</option>
            <option value="organization">Organization</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div className="relative">
          <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700">Plate Number</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiSearch className="h-5 w-5 text-gray-400" /></div>
            <input type="text" id="plateNumber" value={plateNumberInput} onChange={(e) => setPlateNumberInput(e.target.value)}
              placeholder="Enter plate number to search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isFetchingDetails || isSubmitting} />
            {isFetchingSuggestions && <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />}
          </div>
          {plateNumberInput.length > 0 && !isFetchingSuggestions && plateSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
              {plateSuggestions.map(suggestion => (
                <li key={suggestion.id} onClick={() => handlePlateSuggestionClick(suggestion)}
                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm">
                  {suggestion.plate} ({suggestion.type})
                </li>
              ))}
            </ul>
          )}
        </div>

        {isFetchingDetails && <p className="text-sm text-indigo-600 flex items-center"><FiLoader className="animate-spin mr-2" /> Loading car details...</p>}

        {selectedCarDetails && (
          <div className="p-4 border border-dashed border-teal-300 rounded-md bg-teal-50 space-y-4">
            <h3 className="text-lg font-semibold text-teal-700">Fuel Details for {selectedCarDetails.plateNumber}</h3>
            
            
            <div><label htmlFor="fuelLiters" className="block text-sm font-medium text-gray-700">Liters Added *</label><input type="number" id="fuelLiters" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} placeholder="e.g., 30" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" min="0.01" step="0.01" required disabled={isSubmitting} /></div>
            <div><label htmlFor="kmAtFueling" className="block text-sm font-medium text-gray-700">KM at Fueling *</label><input type="number" id="kmAtFueling" value={kmAtFueling} onChange={(e) => setKmAtFueling(e.target.value)} placeholder={`Current KM: ${selectedCarDetails.currentKm || 'N/A'}`} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" min="0" required disabled={isSubmitting} /></div>
            <div><label htmlFor="fuelingDate" className="block text-sm font-medium text-gray-700">Fueling Date * <FiCalendar className="inline ml-1 mb-0.5"/></label><input type="date" id="fuelingDate" value={fuelingDate} onChange={(e) => setFuelingDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required disabled={isSubmitting} /></div>
            {/* KM per Liter Calculation */}
            <div className="mt-2 text-sm text-teal-800 font-semibold">
              KM per Liter:{" "}
              {kmPerLiter !== null ? (
                <span>{kmPerLiter} km/l</span>
              ) : (
                <span className="text-gray-500">Enter valid values to calculate</span>
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={!selectedCarDetails || isSubmitting || isFetchingDetails}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiDroplet className="mr-2" />}
          Record Fuel Entry
        </button>
      </form>
    </div>
  );
}