"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiLoader,
  FiSave,
  FiDroplet,
  FiCalendar,
  FiChevronsLeft,
  FiCheck,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import {
  fetchPlateSuggestionsAPI,
  fetchCarDetailsAPI,
  mapCarTypeToVehicleType,
  submitFuelEntryAPI,
  PlateSuggestion,
  CarDetails,
  FuelEntryRequest,
} from "../fuel-entry/components/fuelEntryApi";

// Primary color theme
const primaryColor = "#3c8dbc";
const primaryHover = "#3078a6";
const primaryLight = "#ebf5fb";
const primaryBorder = "#a8d0e6";

// Debounce function
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export default function FuelEntryPage() {
  const router = useRouter();
  const [carType, setCarType] = useState<"organization" | "personal" | "">("");
  const [plateNumberInput, setPlateNumberInput] = useState("");
  const [plateSuggestions, setPlateSuggestions] = useState<PlateSuggestion[]>(
    []
  );
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [selectedCarDetails, setSelectedCarDetails] =
    useState<CarDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [fuelLiters, setFuelLiters] = useState("");
  const [kmAtFueling, setKmAtFueling] = useState("");
  const [fuelingDate, setFuelingDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchPlateSuggestionsAPI, 300),
    []
  );

  const resetFormFields = () => {
    setFuelLiters("");
    setKmAtFueling("");
    setFuelingDate(new Date().toISOString().split("T")[0]);
  };

  useEffect(() => {
    setSelectedCarDetails(null);
    resetFormFields();
    setFormMessage(null);

    if (plateNumberInput.trim().length > 1) {
      setIsFetchingSuggestions(true);
      debouncedFetchSuggestions(plateNumberInput, carType)
        .then(async (suggestions) => setPlateSuggestions(await suggestions))
        .catch((error) => {
          console.error("Error fetching plate suggestions:", error);
          setPlateSuggestions([]);
          setFormMessage({
            type: "error",
            text: "Could not fetch plate suggestions.",
          });
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
      if (
        details &&
        carType === "" &&
        (details.carType === "organization" || details.carType === "personal")
      ) {
        setCarType(details.carType as "organization" | "personal");
      }
      if (!details) {
        setFormMessage({
          type: "error",
          text: `Car with plate ${plate} not found.`,
        });
      } else {
        setFormMessage({
          type: "success",
          text: `Selected car: ${details.plateNumber} (${
            details.carType
          }). Current KM: ${details.currentKm || "N/A"}`,
        });
      }
    } catch (error: any) {
      console.error("Error loading car details:", error);
      setFormMessage({
        type: "error",
        text: error.message || "Failed to load car details.",
      });
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
      setFormMessage({ type: "error", text: "Please select a car first." });
      return;
    }
    if (!fuelLiters || !kmAtFueling || !fuelingDate) {
      setFormMessage({
        type: "error",
        text: "Please fill all fuel details: Liters, KM at Fueling, and Date.",
      });
      return;
    }
    const liters = parseFloat(fuelLiters);
    const km = parseFloat(kmAtFueling);

    if (isNaN(liters) || liters <= 0) {
      setFormMessage({
        type: "error",
        text: "Liters added must be a positive number.",
      });
      return;
    }
    if (isNaN(km) || km < 0) {
      setFormMessage({
        type: "error",
        text: "KM at fueling must be a valid number.",
      });
      return;
    }
    if (
      selectedCarDetails.currentKm &&
      km < Number(selectedCarDetails.currentKm)
    ) {
      setFormMessage({
        type: "error",
        text: `KM at fueling (${km}) cannot be less than the car's last recorded KM (${selectedCarDetails.currentKm}).`,
      });
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
      console.log("Submitting fuel entry:", fuelData);
      const response = await submitFuelEntryAPI(fuelData);
      setFormMessage({
        type: "success",
        text:
          response.message ||
          `Fuel entry for ${selectedCarDetails.plateNumber} recorded successfully!`,
      });
      setPlateNumberInput("");
      setCarType("");
    } catch (error: any) {
      console.error("Error submitting fuel entry:", error);
      setFormMessage({
        type: "error",
        text: error.message || "Failed to submit fuel entry.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const liters = parseFloat(fuelLiters);
  const kmFuel = parseFloat(kmAtFueling);

  const kmPerLiter =
    !isNaN(liters) &&
    liters > 0 &&
    !isNaN(kmFuel) &&
    selectedCarDetails?.currentKm
      ? ((kmFuel - Number(selectedCarDetails.currentKm)) / liters).toFixed(2)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3c8dbc] transition-all duration-200 shadow-sm mb-4"
          >
            <FiChevronsLeft className="mr-2 h-4 w-4" /> Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                New Fuel Entry
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Record vehicle fuel consumption
              </p>
            </div>
          </div>
        </div>

        {/* Main Card - More Compact */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Compact Card Header */}
          <div
            className="px-6 py-4 border-b border-gray-200"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <FiDroplet className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-white">
                  Add Fuel Entry
                </h2>
                <p className="text-white/90 text-xs mt-0.5">
                  Enter vehicle and fuel details
                </p>
              </div>
            </div>
          </div>

          {/* Card Body - Adjusted spacing */}
          <div className="p-6">
            {formMessage && (
              <div
                className={`mb-5 p-3 rounded-lg border flex items-start ${
                  formMessage.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : formMessage.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                {formMessage.type === "success" ? (
                  <FiCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                ) : formMessage.type === "error" ? (
                  <FiAlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <FiInfo className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm">{formMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection Section - More Compact */}
              <div className="space-y-5">
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                    <div
                      className="p-1.5 rounded-md mr-2"
                      style={{ backgroundColor: primaryLight }}
                    >
                      <FiSearch
                        className="h-3.5 w-3.5"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    Vehicle Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Car Type */}
                    <div>
                      <label
                        htmlFor="carType"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Car Type
                      </label>
                      <select
                        id="carType"
                        value={carType}
                        onChange={(e) => setCarType(e.target.value as any)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-700 text-sm"
                        style={{
                          backgroundColor: primaryLight,
                          borderColor: primaryBorder,
                        }}
                        disabled={
                          !!selectedCarDetails ||
                          isFetchingDetails ||
                          isFetchingSuggestions ||
                          isSubmitting
                        }
                      >
                        <option value="">Select Type</option>
                        <option value="organization">Organization</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    {/* Plate Number */}
                    <div>
                      <label
                        htmlFor="plateNumber"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Plate Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch
                            className="h-4 w-4"
                            style={{ color: primaryColor }}
                          />
                        </div>
                        <input
                          type="text"
                          id="plateNumber"
                          value={plateNumberInput}
                          onChange={(e) => setPlateNumberInput(e.target.value)}
                          placeholder="Enter plate number"
                          className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                          style={{
                            borderColor: primaryBorder,
                            backgroundColor: primaryLight,
                          }}
                          disabled={isFetchingDetails || isSubmitting}
                        />
                        {isFetchingSuggestions && (
                          <FiLoader
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin"
                            style={{ color: primaryColor }}
                          />
                        )}
                      </div>

                      {/* Suggestions Dropdown */}
                      {plateNumberInput.length > 0 &&
                        !isFetchingSuggestions &&
                        plateSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full max-w-md mt-0.5">
                            <ul className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                              {plateSuggestions.map((suggestion) => (
                                <li
                                  key={suggestion.id}
                                  onClick={() =>
                                    handlePlateSuggestionClick(suggestion)
                                  }
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 flex items-center text-sm"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">
                                      {suggestion.plate}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Type: {suggestion.type}
                                    </div>
                                  </div>
                                  <div
                                    className="p-1.5 rounded-md"
                                    style={{ backgroundColor: primaryLight }}
                                  >
                                    <FiCheck
                                      className="h-3 w-3"
                                      style={{ color: primaryColor }}
                                    />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isFetchingDetails && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiLoader
                        className="h-4 w-4 animate-spin"
                        style={{ color: primaryColor }}
                      />
                      <span className="text-sm">Loading car details...</span>
                    </div>
                  </div>
                )}

                {/* Selected Car Details - More Compact */}
                {selectedCarDetails && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: primaryLight,
                      borderColor: primaryBorder,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-gray-800">
                          {selectedCarDetails.plateNumber}
                        </h4>
                        <div className="flex items-center mt-1 space-x-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor:
                                selectedCarDetails.carType === "organization"
                                  ? "#d4edda"
                                  : "#fff3cd",
                              color:
                                selectedCarDetails.carType === "organization"
                                  ? "#155724"
                                  : "#856404",
                            }}
                          >
                            {selectedCarDetails.carType}
                          </span>
                          <span className="text-xs text-gray-600">
                            Current KM:{" "}
                            <span className="font-semibold">
                              {selectedCarDetails.currentKm || "N/A"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded-md bg-white">
                        <FiCheck
                          className="h-4 w-4"
                          style={{ color: primaryColor }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fuel Details Section - More Compact */}
              {selectedCarDetails && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                      <div
                        className="p-1.5 rounded-md mr-2"
                        style={{ backgroundColor: primaryLight }}
                      >
                        <FiDroplet
                          className="h-3.5 w-3.5"
                          style={{ color: primaryColor }}
                        />
                      </div>
                      Fuel Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Liters Added */}
                      <div>
                        <label
                          htmlFor="fuelLiters"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Liters Added *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="fuelLiters"
                            value={fuelLiters}
                            onChange={(e) => setFuelLiters(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                            style={{
                              borderColor: primaryBorder,
                              backgroundColor: "white",
                            }}
                            min="0.01"
                            step="0.01"
                            required
                            disabled={isSubmitting}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">L</span>
                          </div>
                        </div>
                      </div>

                      {/* KM at Fueling */}
                      <div>
                        <label
                          htmlFor="kmAtFueling"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          KM at Fueling *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="kmAtFueling"
                            value={kmAtFueling}
                            onChange={(e) => setKmAtFueling(e.target.value)}
                            placeholder={
                              selectedCarDetails.currentKm || "Enter KM"
                            }
                            className="w-full px-3 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                            style={{
                              borderColor: primaryBorder,
                              backgroundColor: "white",
                            }}
                            min="0"
                            required
                            disabled={isSubmitting}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">KM</span>
                          </div>
                        </div>
                      </div>

                      {/* Fueling Date */}
                      <div>
                        <label
                          htmlFor="fuelingDate"
                          className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center"
                        >
                          Date *
                          <FiCalendar
                            className="ml-1.5 h-3.5 w-3.5"
                            style={{ color: primaryColor }}
                          />
                        </label>
                        <input
                          type="date"
                          id="fuelingDate"
                          value={fuelingDate}
                          onChange={(e) => setFuelingDate(e.target.value)}
                          className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm"
                          style={{
                            borderColor: primaryBorder,
                            backgroundColor: "white",
                          }}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Calculator - More Compact */}
                  {kmPerLiter !== null && (
                    <div
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: "#f0f9ff",
                        borderColor: "#bae6fd",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            Fuel Efficiency
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Calculated from entered values
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-xl font-bold"
                            style={{ color: primaryColor }}
                          >
                            {kmPerLiter} km/L
                          </div>
                          <div className="text-xs text-gray-500">
                            Distance:{" "}
                            {(
                              kmFuel - Number(selectedCarDetails.currentKm)
                            ).toFixed(1)}{" "}
                            km
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button - More Compact */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    !selectedCarDetails || isSubmitting || isFetchingDetails
                  }
                  className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-sm"
                  style={{
                    backgroundColor: primaryColor,
                    backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryHover} 100%)`,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      <span>Record Fuel Entry</span>
                    </>
                  )}
                </button>

                {!selectedCarDetails && (
                  <p className="text-center text-gray-500 text-xs mt-2">
                    Select a vehicle to enable fuel entry
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Compact Card Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FiInfo className="h-3 w-3" />
                <span>* Required fields</span>
              </div>
              <div className="text-right">
                <span
                  className="font-medium text-xs"
                  style={{ color: primaryColor }}
                >
                  Fuel Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
