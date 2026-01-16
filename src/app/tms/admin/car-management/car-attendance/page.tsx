"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiLoader,
  FiSave,
  FiList,
  FiDroplet,
  FiCalendar,
  FiClock,
  FiUsers,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiMoon,
  FiSun,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchPlateSuggestionsAPI,
  fetchCarDetailsAPI,
  recordMorningArrivalAPI,
  findTodaysMorningArrivalRecordAPI,
  findLastEveningDepartureRecordAPI,
  recordEveningDepartureAPI,
  mapCarTypeToVehicleType,
  CarDetails,
  PlateSuggestion,
  FrontendAttendanceEntry,
  MorningArrivalRequest,
  EveningDepartureRequest,
} from "./components/carAttendanceApi";
import Swal from "sweetalert2";
import "@sweetalert2/theme-material-ui/material-ui.css";

type AttendanceEntry = FrontendAttendanceEntry;

// Custom primary color
const PRIMARY_COLOR = "#3c8dbc";

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

function isMorningAttendance() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 7 && hour < 15;
}

export default function CarAttendancePage() {
  const [carType, setCarType] = useState<"organization" | "personal" | "">("");
  const [plateNumberInput, setPlateNumberInput] = useState("");
  const [plateSuggestions, setPlateSuggestions] = useState<PlateSuggestion[]>(
    []
  );
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [selectedCarDetails, setSelectedCarDetails] =
    useState<CarDetails | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [morningKm, setMorningKm] = useState("");
  const [nightKm, setNightKm] = useState("");
  const [kmDifference, setKmDifference] = useState<number | null>(null);
  const [overnightKmDifference, setOvernightKmDifference] = useState<
    number | null
  >(null);
  const [previousEveningKm, setPreviousEveningKm] = useState<number | null>(
    null
  );
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error" | "warning" | "info";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEveningDepartureMode, setIsEveningDepartureMode] = useState(false);
  const [isDayComplete, setIsDayComplete] = useState(false);
  const [morningArrivalRecordDetails, setMorningArrivalRecordDetails] =
    useState<AttendanceEntry | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  const router = useRouter();
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchPlateSuggestionsAPI, 300),
    []
  );

  // Update current time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedCarDetails(null);
    setMorningArrivalRecordDetails(null);
    setIsDayComplete(false);
    setIsEveningDepartureMode(false);
    setMorningKm("");
    setNightKm("");
    setKmDifference(null);
    setOvernightKmDifference(null);
    setPreviousEveningKm(null);
    setFormMessage(null);

    if (plateNumberInput.trim().length > 1) {
      setIsFetchingSuggestions(true);
      debouncedFetchSuggestions(plateNumberInput, carType)
        .then(async (suggestions) => {
          setPlateSuggestions(await suggestions);
        })
        .catch((error) => {
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

  const loadCarAndAttendanceStatus = async (plate: string) => {
    setIsFetchingDetails(true);
    setPlateSuggestions([]);
    setFormMessage(null);

    try {
      const details = await fetchCarDetailsAPI(plate);
      if (details) {
        setSelectedCarDetails(details);
        if (
          carType === "" &&
          (details.carType === "organization" || details.carType === "personal")
        ) {
          setCarType(details.carType);
        }

        const existingMorningArrival = await findTodaysMorningArrivalRecordAPI(
          plate,
          mapCarTypeToVehicleType(details.carType),
          details
        );

        if (existingMorningArrival) {
          setMorningArrivalRecordDetails(existingMorningArrival);
          setMorningKm(existingMorningArrival.morningKm?.toString() || "");

          if (
            existingMorningArrival.nightKm !== null &&
            typeof existingMorningArrival.nightKm !== "undefined"
          ) {
            setIsDayComplete(true);
            setIsEveningDepartureMode(true);
            setNightKm(existingMorningArrival.nightKm.toString());
            const dailyDiff =
              existingMorningArrival.nightKm -
              (existingMorningArrival.morningKm ?? 0);
            if (!isNaN(dailyDiff) && dailyDiff >= 0) {
              setKmDifference(dailyDiff);
            } else {
              setKmDifference(null);
            }
            setFormMessage({
              type: "success",
              text: `Attendance complete for today. Morning: ${existingMorningArrival.morningKm} KM, Evening: ${existingMorningArrival.nightKm} KM.`,
            });
          } else {
            setIsDayComplete(false);
            setIsEveningDepartureMode(true);
            setFormMessage({
              type: "info",
              text: `Morning arrival recorded at ${existingMorningArrival.morningKm} KM. Ready for evening departure.`,
            });
          }
        } else {
          setIsDayComplete(false);
          setIsEveningDepartureMode(false);
          const lastEveningRecord = await findLastEveningDepartureRecordAPI(
            plate,
            mapCarTypeToVehicleType(details.carType),
            details
          );
          if (lastEveningRecord && lastEveningRecord.nightKm !== null) {
            setPreviousEveningKm(lastEveningRecord.nightKm);
            setFormMessage({
              type: "info",
              text: `Ready for morning arrival. Previous evening KM: ${lastEveningRecord.nightKm}`,
            });
          } else {
            setFormMessage({
              type: "info",
              text: `Ready for morning arrival. No previous evening KM found.`,
            });
          }
        }
      } else {
        setFormMessage({
          type: "error",
          text: `Car with plate ${plate} not found.`,
        });
        setSelectedCarDetails(null);
      }
    } catch (error: any) {
      console.error("Error loading car/attendance status:", error);
      setFormMessage({
        type: "error",
        text: error.message || "Failed to load car/attendance status.",
      });
      setSelectedCarDetails(null);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handlePlateSuggestionClick = (suggestion: PlateSuggestion) => {
    setPlateNumberInput(suggestion.plate);
    loadCarAndAttendanceStatus(suggestion.plate);
  };

  useEffect(() => {
    if (isEveningDepartureMode && morningArrivalRecordDetails) {
      const morningArrivalKmVal = morningArrivalRecordDetails.morningKm;
      const eveningDepartureKmVal = parseFloat(nightKm);

      if (
        morningArrivalKmVal !== null &&
        !isNaN(eveningDepartureKmVal) &&
        eveningDepartureKmVal >= morningArrivalKmVal
      ) {
        setKmDifference(eveningDepartureKmVal - morningArrivalKmVal);
      } else {
        setKmDifference(null);
      }
    } else {
      setKmDifference(null);
    }
  }, [nightKm, isEveningDepartureMode, morningArrivalRecordDetails]);

  useEffect(() => {
    if (
      !isEveningDepartureMode &&
      selectedCarDetails &&
      previousEveningKm !== null &&
      morningKm.trim() !== ""
    ) {
      const currentMorningKmVal = parseFloat(morningKm);
      if (
        !isNaN(currentMorningKmVal) &&
        currentMorningKmVal >= previousEveningKm
      ) {
        setOvernightKmDifference(currentMorningKmVal - previousEveningKm);
      } else {
        setOvernightKmDifference(null);
      }
    } else {
      setOvernightKmDifference(null);
    }
  }, [
    morningKm,
    previousEveningKm,
    isEveningDepartureMode,
    selectedCarDetails,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setIsSubmitting(true);

    if (!selectedCarDetails) {
      setFormMessage({
        type: "error",
        text: "Please select a valid car first.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEveningDepartureMode && morningArrivalRecordDetails) {
        const eveningDepartureKmVal = parseFloat(nightKm);
        const morningArrivalKmVal = morningArrivalRecordDetails.morningKm;

        if (morningArrivalKmVal === null) {
          setFormMessage({
            type: "error",
            text: "Morning arrival KM is missing.",
          });
          setIsSubmitting(false);
          return;
        }

        if (
          isNaN(eveningDepartureKmVal) ||
          eveningDepartureKmVal < morningArrivalKmVal
        ) {
          setFormMessage({
            type: "error",
            text: "Evening KM must be greater than or equal to Morning KM.",
          });
          setIsSubmitting(false);
          return;
        }

        const finalKmDifference = eveningDepartureKmVal - morningArrivalKmVal;
        if (isNaN(finalKmDifference) || finalKmDifference < 0) {
          setFormMessage({
            type: "error",
            text: "KM difference calculation failed.",
          });
          setIsSubmitting(false);
          return;
        }

        const departureRequest: EveningDepartureRequest = {
          eveningKm: eveningDepartureKmVal,
        };

        const recordedDeparture = await recordEveningDepartureAPI(
          morningArrivalRecordDetails.id,
          departureRequest,
          selectedCarDetails
        );
        const displayedKmDifference =
          recordedDeparture.kmDifference ?? finalKmDifference;

        setFormMessage({
          type: "success",
          text: `Evening departure recorded successfully! KM used today: ${displayedKmDifference} KM.`,
        });
        resetFormState();
      } else {
        const morningArrivalKmVal = parseFloat(morningKm);
        if (isNaN(morningArrivalKmVal) || morningArrivalKmVal < 0) {
          setFormMessage({
            type: "error",
            text: "Morning KM must be a valid positive number.",
          });
          setIsSubmitting(false);
          return;
        }
        if (
          selectedCarDetails.carType === "organization" &&
          previousEveningKm !== null &&
          morningArrivalKmVal < previousEveningKm
        ) {
          setFormMessage({
            type: "error",
            text: "Morning KM cannot be less than previous evening KM for organization cars.",
          });
          setIsSubmitting(false);
          return;
        }

        const arrivalRequest: MorningArrivalRequest = {
          plateNumber: selectedCarDetails.plateNumber,
          vehicleType: mapCarTypeToVehicleType(selectedCarDetails.carType),
          morningKm: morningArrivalKmVal,
          overnightKmDifference: overnightKmDifference,
        };

        await handleAttendanceSubmit(arrivalRequest);
        resetFormState();
      }
    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      setFormMessage({
        type: "error",
        text: error.message || "Failed to submit attendance.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendanceSubmit = async (payload: MorningArrivalRequest) => {
    try {
      const payloadWithTimeCheck = {
        ...payload,
        isMorning: isMorningAttendance(),
      };

      if (!payloadWithTimeCheck.isMorning) {
        const confirmed = window.confirm(
          "⚠️ You are not within the morning attendance time (7:00 - 15:00).\nDo you want to proceed?"
        );
        if (!confirmed) {
          setIsSubmitting(false);
          return;
        }
      }

      await recordMorningArrivalAPI(payloadWithTimeCheck, selectedCarDetails);
      setFormMessage({
        type: "success",
        text: "Morning arrival recorded successfully!",
      });
    } catch (err: any) {
      let errorMsg = "Failed to record attendance.";
      if (err?.response?.status === 500) {
        errorMsg = `Car ${payload.plateNumber} is already checked for today.`;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setFormMessage({ type: "error", text: errorMsg });
      throw err;
    }
  };

  const resetFormState = () => {
    setCarType("");
    setPlateNumberInput("");
  };

  const handleShowAllRecords = () => {
    router.push("/tms/admin/car-management/car-attendance/all-records");
  };

  const handleAddFuelEntry = () => {
    router.push("/tms/admin/car-management/car-attendance/fuel-entry");
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString + "T00:00:00").toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6 overflow-x-hidden bg-gray-50 min-h-screen">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2a6a90] via-[#3c8dbc] to-[#5ba5e8]">
            Car Attendance Management
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#3c8dbc]" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-[#3c8dbc]" />
              <span className="font-mono">{currentTime}</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isMorningAttendance()
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-yellow-50 border-yellow-200 text-yellow-600"
              }`}
            >
              {isMorningAttendance() ? (
                <span className="flex items-center gap-1">
                  <FiSun /> Morning Hours
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FiMoon /> Evening Hours
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddFuelEntry}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-[#3c8dbc]"
            title="Add Fuel"
          >
            <FiDroplet className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowAllRecords}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors text-gray-600"
            title="View Records"
          >
            <FiList className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6">
          <AnimatePresence>
            {formMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                  formMessage.type === "error"
                    ? "bg-red-50 border-red-200 text-red-600"
                    : formMessage.type === "warning"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                    : formMessage.type === "info"
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-green-50 border-green-200 text-green-600"
                }`}
              >
                {formMessage.type === "error" ? (
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                ) : formMessage.type === "success" ? (
                  <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium text-sm">{formMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Filter and Search Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-[#3c8dbc]" />
                  Car Type Filter
                </label>
                <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
                  {(["organization", "personal", ""] as const).map((type) => (
                    <button
                      key={type || "any"}
                      type="button"
                      onClick={() => {
                        setCarType(type);
                        if (plateNumberInput) setPlateNumberInput("");
                      }}
                      className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                        carType === type
                          ? "bg-[#3c8dbc] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-900 hover:bg-white"
                      }`}
                      disabled={!!selectedCarDetails || isFetchingDetails}
                    >
                      {type === "organization"
                        ? "Organization"
                        : type === "personal"
                        ? "Personal"
                        : "All Types"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="plateNumber"
                  className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
                >
                  <FiSearch className="w-4 h-4 text-[#3c8dbc]" />
                  Search Plate Number
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="plateNumber"
                    value={plateNumberInput}
                    onChange={(e) => setPlateNumberInput(e.target.value)}
                    placeholder="Start typing plate number..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent transition-all"
                    disabled={
                      isFetchingDetails || isSubmitting || isDayComplete
                    }
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#3c8dbc] transition-colors" />
                  {isFetchingSuggestions && (
                    <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3c8dbc] w-4 h-4 animate-spin" />
                  )}
                </div>

                <AnimatePresence>
                  {plateNumberInput.length > 0 &&
                    !isFetchingSuggestions &&
                    plateSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 mt-2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="p-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs font-bold text-[#3c8dbc] uppercase tracking-wider">
                            Matching Vehicles ({plateSuggestions.length})
                          </p>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {plateSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() =>
                                handlePlateSuggestionClick(suggestion)
                              }
                              className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                            >
                              <div>
                                <span className="font-semibold text-gray-800 group-hover:text-[#3c8dbc] transition-colors">
                                  {suggestion.plate}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 capitalize">
                                  ({suggestion.type})
                                </span>
                              </div>
                              <div
                                className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                  suggestion.type === "organization"
                                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                                    : "bg-green-100 text-green-600 border border-green-200"
                                }`}
                              >
                                {suggestion.type}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>

            {/* Loading State */}
            {isFetchingDetails && (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <FiLoader className="w-8 h-8 animate-spin mx-auto mb-3 text-[#3c8dbc]" />
                  <p className="text-gray-500 font-medium animate-pulse text-sm">
                    Retrieving vehicle data...
                  </p>
                </div>
              </div>
            )}

            {/* Selected Vehicle Details */}
            <AnimatePresence>
              {selectedCarDetails && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-3">
                        {isDayComplete ? (
                          <>
                            <FiCheckCircle className="text-green-500" />{" "}
                            Attendance Complete
                          </>
                        ) : isEveningDepartureMode ? (
                          <>
                            <FiMoon className="text-yellow-500" /> Evening
                            Departure
                          </>
                        ) : (
                          <>
                            <FiSun className="text-orange-500" /> Morning
                            Arrival
                          </>
                        )}
                        <span className="text-gray-400 font-normal">
                          | {selectedCarDetails.plateNumber}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                          <FiUsers className="w-4 h-4 text-[#3c8dbc]" />
                          <span className="font-medium text-gray-600">
                            {selectedCarDetails.driverName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                          <FiActivity className="w-4 h-4 text-[#3c8dbc]" />
                          <span className="font-medium text-gray-600">
                            {selectedCarDetails.kmPerLiter} km/l
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-lg text-xs font-bold capitalize border ${
                            selectedCarDetails.carType === "organization"
                              ? "bg-blue-100 border-blue-200 text-blue-600"
                              : "bg-green-100 border-green-200 text-green-600"
                          }`}
                        >
                          {selectedCarDetails.carType}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  <div className="space-y-3 relative z-10">
                    {isEveningDepartureMode && morningArrivalRecordDetails && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
                        <FiSun className="text-yellow-500 w-4 h-4" />
                        <p className="font-medium text-yellow-800 text-sm">
                          <span className="font-bold">Morning Record:</span>{" "}
                          {morningArrivalRecordDetails.morningKm} KM on{" "}
                          {formatDate(morningArrivalRecordDetails.date)}
                        </p>
                      </div>
                    )}

                    {!isEveningDepartureMode &&
                      !isDayComplete &&
                      previousEveningKm !== null && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                          <FiMoon className="text-blue-500 w-4 h-4" />
                          <div>
                            <p className="font-medium text-blue-800 text-sm">
                              <span className="font-bold">
                                Previous Evening KM:
                              </span>{" "}
                              {previousEveningKm}
                            </p>
                            {morningKm.trim() === "" && (
                              <p className="text-xs text-blue-600/70 mt-0.5">
                                Enter morning KM to calculate overnight usage
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {!isEveningDepartureMode &&
                      !isDayComplete &&
                      overnightKmDifference !== null && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                          <FiActivity className="text-emerald-500 w-4 h-4" />
                          <p className="font-medium text-emerald-800 text-sm">
                            <span className="font-bold">
                              Overnight KM Used:
                            </span>{" "}
                            {overnightKmDifference} KM
                          </p>
                        </div>
                      )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* KM Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  isEveningDepartureMode
                    ? "bg-gray-50 border-gray-200 opacity-50"
                    : "bg-white border-blue-200 shadow-md shadow-blue-50"
                }`}
              >
                <label
                  htmlFor="morningKm"
                  className="block text-base font-bold text-gray-700 mb-4 flex items-center gap-2"
                >
                  <div className="p-1.5 rounded-md bg-orange-100 border border-orange-200">
                    <FiSun className="text-orange-500 w-4 h-4" />
                  </div>
                  Morning Arrival KM
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="morningKm"
                    value={morningKm}
                    onChange={(e) => setMorningKm(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] transition-all font-mono"
                    min="0"
                    step="0.1"
                    required={!isDayComplete}
                    disabled={
                      !selectedCarDetails ||
                      isEveningDepartureMode ||
                      isSubmitting ||
                      isDayComplete
                    }
                    readOnly={isEveningDepartureMode || isDayComplete}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xs">
                    KM
                  </span>
                </div>
                {!isEveningDepartureMode && !isDayComplete && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Enter arrival reading
                  </p>
                )}
              </div>

              <div
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  !isEveningDepartureMode
                    ? "bg-gray-50 border-gray-200 opacity-50"
                    : "bg-white border-indigo-200 shadow-md shadow-indigo-50"
                }`}
              >
                <label
                  htmlFor="nightKm"
                  className="block text-base font-bold text-gray-700 mb-4 flex items-center gap-2"
                >
                  <div className="p-1.5 rounded-md bg-indigo-100 border border-indigo-200">
                    <FiMoon className="text-indigo-500 w-4 h-4" />
                  </div>
                  Evening Departure KM
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="nightKm"
                    value={nightKm}
                    onChange={(e) => setNightKm(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    min={morningKm || "0"}
                    step="0.1"
                    required={isEveningDepartureMode && !isDayComplete}
                    disabled={
                      !selectedCarDetails ||
                      !isEveningDepartureMode ||
                      !morningArrivalRecordDetails ||
                      isSubmitting ||
                      isDayComplete
                    }
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-xs">
                    KM
                  </span>
                </div>
                {isEveningDepartureMode && !isDayComplete && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Enter departure
                    reading
                  </p>
                )}
              </div>
            </div>

            {/* Daily KM Display */}
            <AnimatePresence>
              {isEveningDepartureMode && kmDifference !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gradient-to-r from-[#3c8dbc] to-cyan-600 rounded-xl p-6 shadow-lg relative overflow-hidden text-white"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-base font-bold text-white/90">
                        Daily Distance Covered
                      </p>
                      <p className="text-3xl font-black text-white mt-1 font-mono tracking-tight">
                        {kmDifference.toFixed(1)}{" "}
                        <span className="text-lg font-sans font-bold text-white/70">
                          KM
                        </span>
                      </p>
                      <p className="text-white/60 text-xs mt-1 font-medium uppercase tracking-wider">
                        Total usage for today
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <FiActivity className="text-white w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={
                !selectedCarDetails ||
                isFetchingDetails ||
                isSubmitting ||
                (isEveningDepartureMode && !morningArrivalRecordDetails) ||
                isDayComplete
              }
              className="w-full py-2.5 px-4 bg-[#3c8dbc] hover:bg-[#357ca5] text-white rounded-lg font-semibold text-base shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-2 h-2 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>
                    {isEveningDepartureMode
                      ? "Record Evening Departure"
                      : "Record Arrival"}
                  </span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 font-medium">
          Morning attendance hours:{" "}
          <span className="text-gray-700">7:00 AM - 3:00 PM</span> • Evening
          departure: <span className="text-gray-700">After 5:00 PM</span>
        </p>
      </div>
    </div>
  );
}
