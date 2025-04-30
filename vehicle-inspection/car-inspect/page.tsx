'use client';
import React, { useState, useEffect, useCallback } from 'react'; // Import React
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiChevronRight, FiInfo } from 'react-icons/fi';
// Consider using a toast library for better user feedback
// import { toast } from 'react-toastify';

// Enums (InspectionStatus, ServiceStatus, SeverityLevel) remain the same
enum InspectionStatus {
  Approved = 'Approved',
  Rejected = 'Rejected',
  ConditionallyApproved = 'ConditionallyApproved',
}

enum ServiceStatus {
  Ready = 'Ready',
  ReadyWithWarning = 'ReadyWithWarning',
  NotReady = 'NotReady',
}

enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  NONE = 'NONE',
}

// Define critical mechanical checks in one place
const CRITICAL_MECHANICAL_CHECKS: (keyof MechanicalInspection)[] = [
  'engineCondition', 'brakes', 'steering', 'suspension',
];

// API Base URL (Consider moving to .env.local)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// --- Types --- (CarType, Car, ItemCondition, MechanicalInspection, BodyInspection, InteriorInspection, InspectionResultState, InspectionPayload) remain the same
type CarType = 'personal' | 'organization' | 'rented';

interface Car {
  id: number;
  plateNumber: string;
  model: string;
  status: string;
  inspected: boolean;
  inspectionResult?: InspectionStatus; // Use Enum
  carType?: string;
  fuelType?: string;
  driverName?: string;
  driverAddress?: string;
  loadCapacity?: number;
  companyName?: string;
  vehiclesUserName?: string;
  rentalPeriod?: string;
  ownerName?: string;
  ownerPhone?: string;
}

type ItemCondition = {
  problem: boolean;
  severity: SeverityLevel; // Use Enum
  notes: string;
};

type MechanicalInspection = {
  engineCondition: boolean;
  enginePower: boolean;
  suspension: boolean;
  brakes: boolean;
  steering: boolean;
  gearbox: boolean;
  mileage: boolean;
  fuelGauge: boolean;
  tempGauge: boolean;
  oilGauge: boolean;
};

type BodyInspection = {
  bodyCollision: ItemCondition;
  bodyScratches: ItemCondition;
  paintCondition: ItemCondition;
  breakages: ItemCondition;
  cracks: ItemCondition;
};

type InteriorInspection = {
  engineExhaust: ItemCondition;
  seatComfort: ItemCondition;
  seatFabric: ItemCondition;
  floorMat: ItemCondition;
  rearViewMirror: ItemCondition;
  carTab: ItemCondition;
  mirrorAdjustment: ItemCondition;
  doorLock: ItemCondition;
  ventilationSystem: ItemCondition;
  dashboardDecoration: ItemCondition;
  seatBelt: ItemCondition;
  sunshade: ItemCondition;
  windowCurtain: ItemCondition;
  interiorRoof: ItemCondition;
  carIgnition: ItemCondition;
  fuelConsumption: ItemCondition;
  headlights: ItemCondition;
  rainWiper: ItemCondition;
  turnSignalLight: ItemCondition;
  brakeLight: ItemCondition;
  licensePlateLight: ItemCondition;
  clock: ItemCondition;
  rpm: ItemCondition;
  batteryStatus: ItemCondition;
  chargingIndicator: ItemCondition;
};

type InspectionResultState = {
  mechanical: MechanicalInspection;
  body: BodyInspection;
  interior: InteriorInspection;
  overallStatus: InspectionStatus; // Use Enum
  serviceStatus?: ServiceStatus; // Use Enum
  warningMessage?: string;
  warningDeadline?: string;
  rejectionReason?: string;
};

type InspectionPayload = {
  plateNumber: string | null;
  inspectorName: string;
  inspectionStatus: InspectionStatus; // Use Enum
  serviceStatus: ServiceStatus; // Use Enum
  bodyScore: number;
  interiorScore: number;
  notes: string;
  inspectionDate: string; // ISO string format
  mechanical: MechanicalInspection;
  body: BodyInspection;
  interior: InteriorInspection;
  warningMessage?: string;
  warningDeadline?: string; // Format 'yyyy-MM-dd'
  rejectionReason?: string;
};


// Helper function to create default ItemCondition
const createDefaultItemCondition = (): ItemCondition => ({
  problem: false,
  severity: SeverityLevel.NONE, // Use Enum
  notes: '',
});

// Helper to format labels from camelCase
const formatLabel = (key: string): string => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

// --- Props Interface for Phase 1 ---
interface Phase1Props {
    initialInspectorName: string;
    onNameFinalized: (name: string) => void;
    inspection: InspectionResultState;
    setInspection: React.Dispatch<React.SetStateAction<InspectionResultState>>;
    handleMechanicalCheck: (field: keyof MechanicalInspection) => void;
    plateNumber: string | null;
    setPhase: (phase: 1 | 2 | 3) => void;
    setShowFailAlert: (show: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    isLoading: boolean;
    router: ReturnType<typeof useRouter>; // Pass router for navigation
    checkMechanicalPass: () => boolean; // Still useful for messaging
}

// --- Props Interface for Checkbox --- (Moved before usage)
interface InspectionCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: () => void;
  itemCondition?: ItemCondition;
  onConditionChange?: (property: keyof ItemCondition, value: boolean | SeverityLevel | string) => void; // Updated value type
  isProblemOriented?: boolean;
}

// --- Reusable UI Components --- (PhaseContainer, PhaseHeader, SectionHeader, PhaseActions, InspectionCheckbox) remain the same
// Define them before they are used in Phase components or the main component

const PhaseContainer = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {children}
    </motion.div>
  );

const PhaseHeader = ({ plateNumber, phase }: { plateNumber: string | null, phase: 1 | 2 | 3 }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Vehicle Inspection - <span className="text-blue-600 font-mono">{plateNumber || 'N/A'}</span>
        </h2>
        <div className="flex items-center mt-1 text-sm text-gray-500">
          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${
              phase === 1 ? 'bg-blue-100 text-blue-800' :
              phase === 2 ? 'bg-indigo-100 text-indigo-800' :
              'bg-purple-100 text-purple-800'
            }`}>
            Phase {phase} of 3
          </span>
          <FiChevronRight className="mx-1 text-gray-400" />
          <span className="font-medium">
            {phase === 1 ? 'Mechanical' : phase === 2 ? 'Body Exterior' : 'Interior & Electrical'} Inspection
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-2 sm:mt-0 whitespace-nowrap">
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );

const SectionHeader = ({ title, score, status }: { title: string; score?: number; status?: string }) => (
    <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {score !== undefined && status !== undefined && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">{score}% Pass</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            score >= 90 ? 'bg-green-100 text-green-800' :
            score >= 75 ? 'bg-yellow-100 text-yellow-800' :
            score >= 60 ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        </div>
      )}
    </div>
  );

const PhaseActions = ({ phase, onBack, onNext, backLabel, nextLabel, isNextDisabled, isLoading }: {
    phase: 1 | 2 | 3;
    onBack?: () => void;
    onNext: () => Promise<void>;
    backLabel?: string;
    nextLabel: string;
    isNextDisabled: boolean;
    isLoading: boolean;
  }) => (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 gap-4">
       <div className="text-sm text-gray-500 text-center sm:text-left">
        {phase === 1 ? 'Ensure all mechanical systems are checked. Any failure prevents continuation.' : // Updated text
         phase === 2 ? 'Document any exterior body damage or wear.' :
         'Check all interior components and finalize the inspection.'}
      </div>
      <div className="flex space-x-3 w-full sm:w-auto justify-center">
        {onBack && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack} disabled={isLoading}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            {backLabel || 'Back'}
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext} disabled={isNextDisabled || isLoading}
          className={`px-5 py-2 text-white rounded-lg transition-all flex-1 sm:flex-none ${
            isNextDisabled || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}>
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : ( nextLabel )}
        </motion.button>
      </div>
    </div>
  );

const InspectionCheckbox = ({ label, checked, onChange, itemCondition, onConditionChange, isProblemOriented = false }: InspectionCheckboxProps) => {
    const isConditionMode = itemCondition !== undefined && onConditionChange !== undefined;
    const isOk = isConditionMode ? !itemCondition.problem : checked;

    const handleClick = useCallback(() => {
      if (isConditionMode) {
        onConditionChange?.('problem', !itemCondition.problem);
      } else {
        onChange?.();
      }
    }, [isConditionMode, itemCondition, onConditionChange, onChange]);

    const handleSeverityChange = useCallback((value: SeverityLevel) => {
        if (isConditionMode) onConditionChange?.('severity', value);
    }, [isConditionMode, onConditionChange]);

    const handleNotesChange = useCallback((value: string) => {
        if (isConditionMode) onConditionChange?.('notes', value);
    }, [isConditionMode, onConditionChange]);

    return (
      <div className="space-y-2 py-3 px-3 -mx-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
        <div className="flex items-start space-x-3 cursor-pointer group" onClick={handleClick}>
          <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border mt-0.5 transition-colors ${
            isOk ? 'border-green-400 bg-green-50 group-hover:border-green-500' : 'border-red-400 bg-red-50 group-hover:border-red-500'
          }`}>
            {isOk ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiX className="w-4 h-4 text-red-600" />}
          </div>
          <span className={`flex-1 text-sm ${ isOk ? 'text-gray-700' : 'text-red-700 font-medium' }`}>
            {label}
          </span>
        </div>

        {isConditionMode && itemCondition.problem && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }} className="pl-8 space-y-3 mt-2 overflow-hidden">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-medium text-gray-600">Severity:</label>
              <div className="flex space-x-1.5">
                {([SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.HIGH] as const).map((level) => (
                  <button key={level} type="button"
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      itemCondition.severity === level
                        ? level === SeverityLevel.LOW ? 'bg-yellow-500 text-white'
                          : level === SeverityLevel.MEDIUM ? 'bg-orange-500 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={(e) => { e.stopPropagation(); handleSeverityChange(level); }}>
                    {level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Notes:</label>
              <textarea
                className="w-full text-xs p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-vertical min-h-[40px]"
                rows={2} placeholder="Describe the issue..." value={itemCondition.notes}
                onChange={(e) => handleNotesChange(e.target.value)} onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  };


// --- Phase 1 Component - Wrapped with React.memo ---
const Phase1MechanicalInspection = React.memo(({
    initialInspectorName,
    onNameFinalized,
    inspection,
    setInspection,
    handleMechanicalCheck,
    plateNumber,
    setPhase,
    setShowFailAlert,
    setIsLoading,
    isLoading,
    router,
    checkMechanicalPass, // Keep this for potential specific messaging or button label
}: Phase1Props) => {
  const [localInspectorName, setLocalInspectorName] = useState(initialInspectorName);

  const criticalChecksMap = CRITICAL_MECHANICAL_CHECKS.reduce((acc, key) => {
      acc[key] = true;
      return acc;
  }, {} as Partial<Record<keyof MechanicalInspection, boolean>>);

  // --- MODIFIED SUBMIT HANDLER ---
  const handlePhase1SubmitInternal = useCallback(async () => {
    if (!localInspectorName.trim()) {
        alert("Please enter the inspector's name.");
        return;
    }
    onNameFinalized(localInspectorName);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay

    // Check if *ALL* mechanical items passed
    const allMechanicalItemsPassed = Object.values(inspection.mechanical).every(value => value === true);
    const criticalItemsPassed = checkMechanicalPass(); // Check critical status separately for messaging

    if (allMechanicalItemsPassed) {
      // --- ONLY if ALL items passed ---
      setPhase(2); // Proceed to Phase 2
    } else {
      // --- If ANY item failed ---
      // Determine the reason based on whether a critical item failed or not
      const reason = !criticalItemsPassed
        ? 'Failed one or more critical mechanical inspection items.'
        : 'Failed one or more non-critical mechanical inspection items.';

      setInspection(prev => ({
        ...prev,
        overallStatus: InspectionStatus.Rejected,
        serviceStatus: ServiceStatus.NotReady,
        rejectionReason: reason // Use the determined reason
      }));
      setShowFailAlert(true); // Show the failure modal, DO NOT proceed
    }
    setIsLoading(false);
  }, [
      localInspectorName,
      onNameFinalized,
      setIsLoading,
      checkMechanicalPass, // Still needed for reason determination
      setPhase,
      setInspection,
      setShowFailAlert,
      inspection.mechanical // Add inspection.mechanical as a dependency
  ]);
  // --- END OF MODIFIED SUBMIT HANDLER ---


  // --- Determine button label based on the new logic ---
  const allMechanicalItemsPassed = Object.values(inspection.mechanical).every(value => value === true);
  const criticalItemsPassed = checkMechanicalPass(); // Re-use the critical check result

  const nextButtonLabel = allMechanicalItemsPassed
    ? 'Continue to Body Inspection'
    : !criticalItemsPassed
      ? 'Submit as Failed (Critical Failure)'
      : 'Submit as Failed (Failure)'; // Simpler label if non-critical failed

  return (
    <PhaseContainer>
      <PhaseHeader plateNumber={plateNumber} phase={1} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {/* Column 1 */}
        <div className="space-y-4">
          <SectionHeader title="Engine & Drivetrain" />
          {(Object.keys(inspection.mechanical) as Array<keyof MechanicalInspection>)
            .filter(key => ['engineCondition', 'enginePower', 'gearbox', 'mileage'].includes(key))
            .map(key => (
              <InspectionCheckbox
                key={key}
                label={`${formatLabel(key)} ${criticalChecksMap[key] ? '*' : ''}`}
                checked={inspection.mechanical[key]}
                onChange={() => handleMechanicalCheck(key)}
              />
          ))}
        </div>
        {/* Column 2 */}
        <div className="space-y-4">
          <SectionHeader title="Chassis & Controls" />
           {(Object.keys(inspection.mechanical) as Array<keyof MechanicalInspection>)
            .filter(key => ['suspension', 'brakes', 'steering'].includes(key))
            .map(key => (
              <InspectionCheckbox
                key={key}
                label={`${formatLabel(key)} ${criticalChecksMap[key] ? '*' : ''}`}
                checked={inspection.mechanical[key]}
                onChange={() => handleMechanicalCheck(key)}
              />
          ))}
          <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50">
            <label className="text-sm font-medium text-gray-600 block mb-2">Gauges Functional:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1">
              {(Object.keys(inspection.mechanical) as Array<keyof MechanicalInspection>)
                .filter(key => ['fuelGauge', 'tempGauge', 'oilGauge'].includes(key))
                .map(key => (
                  <InspectionCheckbox
                    key={key}
                    label={formatLabel(key)}
                    checked={inspection.mechanical[key]}
                    onChange={() => handleMechanicalCheck(key)}
                  />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Inspector Name and Info Box */}
      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="inspectorName" className="block text-sm font-medium text-gray-700 mb-1">Inspector Name *</label>
          <input
            id="inspectorName"
            type="text"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
            value={localInspectorName}
            onChange={(e) => setLocalInspectorName(e.target.value)}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className="bg-blue-50 p-3 rounded-lg flex items-start border border-blue-100">
          <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Items marked with * are critical. Failure of any critical item will result in immediate rejection. Ensure all systems are checked thoroughly.
          </p>
        </div>
      </div>
      {/* --- UPDATED PhaseActions --- */}
      <PhaseActions
        phase={1}
        onBack={() => router.back()}
        backLabel="Cancel Inspection"
        onNext={handlePhase1SubmitInternal}
        nextLabel={nextButtonLabel} // Use the dynamically determined label
        isNextDisabled={!localInspectorName.trim()}
        isLoading={isLoading}
      />
    </PhaseContainer>
  );
});
Phase1MechanicalInspection.displayName = 'Phase1MechanicalInspection';


// --- Main CarInspectPage Component ---
export default function CarInspectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plateNumber = searchParams.get('plateNumber');
  const carTypeParam = searchParams.get('type') as CarType | null;

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [inspectorName, setInspectorName] = useState('');
  const [inspection, setInspection] = useState<InspectionResultState>({
    mechanical: {
      engineCondition: true, enginePower: true, suspension: true, brakes: true,
      steering: true, gearbox: true, mileage: true, fuelGauge: true,
      tempGauge: true, oilGauge: true,
    },
    body: {
      bodyCollision: createDefaultItemCondition(),
      bodyScratches: createDefaultItemCondition(),
      paintCondition: createDefaultItemCondition(),
      breakages: createDefaultItemCondition(),
      cracks: createDefaultItemCondition()
    },
    interior: {
      engineExhaust: createDefaultItemCondition(), seatComfort: createDefaultItemCondition(),
      seatFabric: createDefaultItemCondition(), floorMat: createDefaultItemCondition(),
      rearViewMirror: createDefaultItemCondition(), carTab: createDefaultItemCondition(),
      mirrorAdjustment: createDefaultItemCondition(), doorLock: createDefaultItemCondition(),
      ventilationSystem: createDefaultItemCondition(), dashboardDecoration: createDefaultItemCondition(),
      seatBelt: createDefaultItemCondition(), sunshade: createDefaultItemCondition(),
      windowCurtain: createDefaultItemCondition(), interiorRoof: createDefaultItemCondition(),
      carIgnition: createDefaultItemCondition(), fuelConsumption: createDefaultItemCondition(),
      headlights: createDefaultItemCondition(), rainWiper: createDefaultItemCondition(),
      turnSignalLight: createDefaultItemCondition(), brakeLight: createDefaultItemCondition(),
      licensePlateLight: createDefaultItemCondition(), clock: createDefaultItemCondition(),
      rpm: createDefaultItemCondition(), batteryStatus: createDefaultItemCondition(),
      chargingIndicator: createDefaultItemCondition(),
    },
    overallStatus: InspectionStatus.Rejected // Start as rejected
  });
  const [notes, setNotes] = useState('');
  const [showFailAlert, setShowFailAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---
  const handleMechanicalCheck = useCallback((field: keyof MechanicalInspection) => {
    setInspection(prev => ({
      ...prev,
      mechanical: { ...prev.mechanical, [field]: !prev.mechanical[field] }
    }));
  }, []);

  const handleItemConditionChange = useCallback((
    section: 'body' | 'interior',
    field: keyof BodyInspection | keyof InteriorInspection,
    property: keyof ItemCondition,
    value: boolean | SeverityLevel | string
  ) => {
    setInspection(prev => {
      const currentSection = prev[section];
      if (!currentSection || !(field in currentSection)) {
        console.error(`Field ${String(field)} not found in section ${section}`);
        return prev;
      }
      const currentItem = currentSection[field as keyof typeof currentSection] as ItemCondition;
      const resetOnProblemFalse = (property === 'problem' && value === false);
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: {
            ...currentItem,
            [property]: value,
            ...(resetOnProblemFalse && { severity: SeverityLevel.NONE, notes: '' })
          }
        }
      };
    });
  }, []);

  // --- Calculations ---
  const calculateScore = useCallback((section: 'body' | 'interior') => {
    const items = Object.values(inspection[section]) as ItemCondition[];
    const totalItems = items.length;
    if (totalItems === 0) return 100;
    const passedItems = items.filter(item => !item.problem).length;
    return Math.round((passedItems / totalItems) * 100);
  }, [inspection]);

  const calculateBodyScore = useCallback(() => calculateScore('body'), [calculateScore]);
  const calculateInteriorScore = useCallback(() => calculateScore('interior'), [calculateScore]);

  const getOverallStatusFromScore = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const getOverallBodyStatus = useCallback(() => getOverallStatusFromScore(calculateBodyScore()), [calculateBodyScore]);
  const getOverallInteriorStatus = useCallback(() => getOverallStatusFromScore(calculateInteriorScore()), [calculateInteriorScore]);

  // Checks if CRITICAL mechanical items passed
  const checkMechanicalPass = useCallback(() => {
    const { mechanical } = inspection;
    const anyCriticalFailed = CRITICAL_MECHANICAL_CHECKS.some(key => !mechanical[key]);
    if (anyCriticalFailed) {
      console.warn("CRITICAL Mechanical check failed.");
      return false;
    }
    return true;
  }, [inspection.mechanical]);

  // Checks if ALL body items passed (no problems)
  const checkBodyPass = useCallback(() => Object.values(inspection.body).every(item => !item.problem), [inspection.body]);
  // Checks if ALL interior items passed (no problems)
  const checkInteriorPass = useCallback(() => Object.values(inspection.interior).every(item => !item.problem), [inspection.interior]);

  // --- >>> MODIFIED: Function to Update Car Status <<< ---
  const updateCarStatusAfterInspection = useCallback(async (
    plate: string,
    inspectionId: number, // Pass the new inspection ID
    // Add serviceStatus parameter
    serviceStatus: ServiceStatus, // Pass the service status (Ready, NotReady, etc.)
    inspectionStatus: InspectionStatus // Keep inspectionStatus if backend needs it too, otherwise remove
  ) => {
    // Log which status is being sent for clarity
    console.log(`Attempting to update status for car ${plate} to Service Status: ${serviceStatus} (Inspection ID: ${inspectionId}, Result: ${inspectionStatus})`);

    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') {
      console.error('Cannot update car status: Authentication token missing.');
      // Consider a non-blocking warning
      // toast.warn('Warning: Could not update car status due to missing authentication.');
      return; // Exit the function
    }

    try {
      // *** Ensure this API endpoint expects the 'serviceStatus' in the 'status' field ***
      // *** The backend should handle setting 'inspected = true' and updating the car's operational status ***
      const response = await fetch(`${API_BASE_URL}/cars/update-inspection-status`, {
        method: 'POST', // Or 'PUT'
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: plate,
          latestInspectionId: inspectionId,
          // --- Send the SERVICE STATUS here ---
          status: serviceStatus,
          // Optionally, send inspectionResult if backend needs both:
          // inspectionResult: inspectionStatus,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to update car status (HTTP ${response.status})`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorData.error || errorMsg; } catch (e) { /* Ignore */ }
        console.warn(`Car Status Update Warning: ${errorMsg}`);
        // toast.warn(`Warning: Could not update the car status automatically. ${errorMsg}`);
      } else {
        const result = await response.json();
        console.log(`Car status updated successfully for ${plate}:`, result);
        // toast.success('Car status updated successfully.');
      }

    } catch (error: any) {
      console.error('Error calling updateCarStatusAfterInspection:', error);
      // toast.error('An error occurred while updating the car status.');
    }
    // Dependencies might need adjustment if you added/removed parameters
  }, []); // API_BASE_URL is constant, no other external deps if token logic is self-contained


  // --- API Submission (Modified Call) ---
  const submitInspectionToBackend = useCallback(async (payload: InspectionPayload) => {
    setIsLoading(true);
    console.log("Submitting Inspection Payload:", JSON.stringify(payload, null, 2));

    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') {
      console.error('No valid authentication token found.');
      alert('Authentication error. Please log in again.'); // Keep alert for critical auth errors
      setIsLoading(false);
      router.push('/login');
      return null;
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(`${API_BASE_URL}/inspections/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // ... (Keep existing detailed error handling for inspection creation) ...
        let errorMessage = `HTTP error! Status: ${response.status}`;
        let errorDetails = null;
        try {
          errorDetails = await response.json();
          errorMessage = errorDetails.message || errorDetails.error || JSON.stringify(errorDetails);
          if (response.status === 400 && errorDetails.errors && Array.isArray(errorDetails.errors)) {
             const validationMessages = errorDetails.errors.map((err: any) => `${err.field}: ${err.defaultMessage || err.message}`).join(', ');
             errorMessage = `Submission failed due to invalid data: ${validationMessages}`;
          } else if (response.status === 401 || response.status === 403) {
             errorMessage = "Authentication failed. Please log in again.";
             router.push('/login'); // Redirect on auth failure
          } else if (response.status >= 500) {
             errorMessage = `Server error (${response.status}). Please try again later.`;
          }
        } catch (jsonError) {
          errorMessage = `HTTP error! Status: ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Submission successful:', result);

      if (result && result.id && payload.plateNumber) { // Ensure ID and plateNumber exist
        alert('Inspection submitted successfully!'); // Keep alert for primary success

        // 2. Update the car's status - NOW WE WAIT for this to finish
        console.log("Waiting for car status update...");
        // --- MODIFIED CALL: Pass payload.serviceStatus ---
        await updateCarStatusAfterInspection(
            payload.plateNumber,
            result.id,
            payload.serviceStatus, // Pass the service status
            payload.inspectionStatus // Pass inspection status too (if needed by backend)
        );
        console.log("Car status update attempt finished.");

        // 3. Redirect to the results page AFTER status update attempt
        router.push(`/tms-modules/admin/car-management/vehicle-inspection/result?inspectionId=${result.id}`);
        return result; // Return the successful inspection result

      } else {
        console.warn("Submission successful, but missing ID or PlateNumber for status update:", result, payload.plateNumber);
        alert('Inspection submitted, but could not retrieve necessary info for car status update. Redirecting to list.'); // Keep alert for this edge case
        router.push('/tms-modules/admin/car-management/vehicle-inspection');
        return null;
      }

    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Submission failed: ${error.message || 'An unknown error occurred.'}`); // Keep alert for submission failure
      return null;
    } finally {
      setIsLoading(false);
    }
    // Added updateCarStatusAfterInspection to dependencies
  }, [router, updateCarStatusAfterInspection]); // Ensure updateCarStatusAfterInspection is in dependency array


  // --- Final Submission Logic ---
  const handleSubmit = useCallback(async () => {
    if (!inspectorName.trim()) {
        alert("Inspector name cannot be empty for final submission.");
        return;
    }

    // Check if ALL mechanical items passed (not just critical)
    const allMechPassed = Object.values(inspection.mechanical).every(value => value === true);
    const bodyPass = checkBodyPass();
    const interiorPass = checkInteriorPass();

    let finalOverallStatus: InspectionStatus = InspectionStatus.Rejected;
    let finalServiceStatus: ServiceStatus = ServiceStatus.NotReady;
    let finalWarningMessage: string | undefined = undefined;
    let finalWarningDeadline: string | undefined = undefined;
    // Use the reason set during Phase 1 failure if it exists, otherwise determine based on critical/non-critical
    let finalRejectionReason: string | undefined = inspection.rejectionReason;

    if (allMechPassed) { // Only proceed if ALL mechanical items passed
        if (bodyPass && interiorPass) {
            finalOverallStatus = InspectionStatus.Approved;
            finalServiceStatus = ServiceStatus.Ready;
            finalRejectionReason = undefined; // Clear any previous rejection reason
        } else {
            finalOverallStatus = InspectionStatus.ConditionallyApproved;
            finalServiceStatus = ServiceStatus.ReadyWithWarning;
            const issues = [];
            if (!bodyPass) issues.push('body exterior');
            if (!interiorPass) issues.push('interior/electrical');
            finalWarningMessage = `Minor issues found in: ${issues.join(', ')}. Requires attention within the specified deadline.`;
            const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            finalWarningDeadline = deadlineDate.toISOString().split('T')[0];
            finalRejectionReason = undefined; // Clear any previous rejection reason
        }
    } else {
        // If we reach here, it means a mechanical item failed (handled in Phase 1)
        finalOverallStatus = InspectionStatus.Rejected;
        finalServiceStatus = ServiceStatus.NotReady;
        // Ensure rejection reason is set (should have been set in Phase 1)
        if (!finalRejectionReason) {
            const criticalFailed = !checkMechanicalPass(); // Re-check if it was critical
            finalRejectionReason = criticalFailed
                ? 'Failed critical mechanical inspection items.'
                : 'Failed non-critical mechanical inspection items.';
        }
        finalWarningMessage = undefined;
        finalWarningDeadline = undefined;
    }

    const finalPayload: InspectionPayload = {
      plateNumber,
      inspectorName,
      inspectionStatus: finalOverallStatus,
      serviceStatus: finalServiceStatus, // Ensure serviceStatus is correctly determined
      bodyScore: calculateBodyScore(),
      interiorScore: calculateInteriorScore(),
      notes: notes,
      inspectionDate: new Date().toISOString(),
      mechanical: inspection.mechanical,
      body: inspection.body,
      interior: inspection.interior,
      ...(finalWarningMessage && { warningMessage: finalWarningMessage }),
      ...(finalWarningDeadline && { warningDeadline: finalWarningDeadline }),
      ...(finalRejectionReason && { rejectionReason: finalRejectionReason })
    };

    await submitInspectionToBackend(finalPayload);
  }, [
      inspectorName, plateNumber, checkMechanicalPass, checkBodyPass, checkInteriorPass,
      calculateBodyScore, calculateInteriorScore, notes, inspection, submitInspectionToBackend
      // Removed checkMechanicalPass from here as the primary check is now allMechPassed
  ]);


  // Handles confirming rejection from the modal (triggered in Phase 1)
  const handleFinalRejection = useCallback(async () => {
    setShowFailAlert(false);
    // The rejection reason should already be set in the inspection state by handlePhase1SubmitInternal
    const rejectionMsg = inspection.rejectionReason || 'Failed mechanical inspection items.';
    // Ensure state reflects rejection before submitting
    setInspection(prev => ({
      ...prev,
      overallStatus: InspectionStatus.Rejected,
      serviceStatus: ServiceStatus.NotReady, // Ensure service status is NotReady on rejection
      rejectionReason: rejectionMsg // Ensure it's set
    }));
    // Append rejection reason to notes if not already there
    setNotes(prevNotes => {
        const rejectionText = `REJECTED: ${rejectionMsg}`;
        return prevNotes.includes(rejectionText) ? prevNotes : (prevNotes ? `${prevNotes}\n\n${rejectionText}` : rejectionText);
    });
    // Call the main submit handler which will now use the Rejected status
    await handleSubmit();
  }, [inspection.rejectionReason, setInspection, setNotes, handleSubmit]);

  // --- Phase Transition Handlers ---
  const handlePhase2Submit = useCallback(async () => {
    // No specific checks needed here unless you add rules for body phase
    setIsLoading(true);
    setPhase(3);
    setIsLoading(false);
  }, [setIsLoading, setPhase]);

  const handlePhase3Submit = useCallback(async () => {
    // Final submission is handled by the main handleSubmit function
    await handleSubmit();
  }, [handleSubmit]);


  // --- Phase Specific Render Functions ---
  const Phase2BodyInspection = useCallback(() => {
    return (
        <PhaseContainer>
            <PhaseHeader plateNumber={plateNumber} phase={2} />
            <div className="space-y-5">
                <SectionHeader title="Exterior Body Condition" score={calculateBodyScore()} status={getOverallBodyStatus()} />
                <div className="space-y-1">
                {(Object.keys(inspection.body) as Array<keyof BodyInspection>).map((key) => (
                    <InspectionCheckbox key={key} label={formatLabel(key)} itemCondition={inspection.body[key]}
                    onConditionChange={(property, value) => handleItemConditionChange('body', key, property, value)}
                    isProblemOriented={true} />
                ))}
                </div>
                <div className="mt-4">
                <label htmlFor="bodyNotes" className="block text-sm font-medium text-gray-700 mb-1">Body Inspection Notes (Optional)</label>
                <textarea id="bodyNotes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="Document overall body condition observations..." />
                </div>
                {calculateBodyScore() < 90 && (
                <div className={`p-3 rounded-lg border ${ calculateBodyScore() >= 75 ? 'bg-yellow-50 border-yellow-200' : 'bg-orange-50 border-orange-200' }`}>
                    <div className="flex items-start">
                    <FiAlertTriangle className={`mt-0.5 mr-2 flex-shrink-0 ${ calculateBodyScore() >= 75 ? 'text-yellow-500' : 'text-orange-500' }`} />
                    <div>
                        <h4 className={`font-medium ${ calculateBodyScore() >= 75 ? 'text-yellow-800' : 'text-orange-800' }`}>Body Condition Advisory</h4>
                        <p className={`text-sm mt-1 ${ calculateBodyScore() >= 75 ? 'text-yellow-700' : 'text-orange-700' }`}>
                        This vehicle has body issues ({100 - calculateBodyScore()}% failed checks) that may require attention. Document severity and details.
                        </p>
                    </div>
                    </div>
                </div>
                )}
            </div>
            <PhaseActions
                phase={2}
                onBack={() => setPhase(1)}
                backLabel="Back to Mechanical"
                onNext={handlePhase2Submit}
                nextLabel="Continue to Interior Inspection"
                isNextDisabled={!inspectorName.trim()} // Still require inspector name
                isLoading={isLoading}
            />
        </PhaseContainer>
    );
  }, [plateNumber, calculateBodyScore, getOverallBodyStatus, inspection.body, handleItemConditionChange, notes, setNotes, setPhase, handlePhase2Submit, inspectorName, isLoading]);

  const Phase3InteriorInspection = useCallback(() => {
    const column1Keys: (keyof InteriorInspection)[] = ['seatComfort', 'seatFabric', 'floorMat', 'rearViewMirror', 'mirrorAdjustment', 'doorLock', 'ventilationSystem', 'interiorRoof', 'windowCurtain'];
    const column2Keys: (keyof InteriorInspection)[] = ['dashboardDecoration', 'seatBelt', 'sunshade', 'carIgnition', 'clock', 'rpm', 'carTab', 'engineExhaust', 'fuelConsumption'];
    const column3Keys: (keyof InteriorInspection)[] = ['headlights', 'rainWiper', 'turnSignalLight', 'brakeLight', 'licensePlateLight', 'batteryStatus', 'chargingIndicator'];

    return (
        <PhaseContainer>
            <PhaseHeader plateNumber={plateNumber} phase={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mb-6">
                {/* Column 1 */}
                <div className="space-y-4">
                    <SectionHeader title="Seating & Cabin" score={calculateInteriorScore()} status={getOverallInteriorStatus()} />
                    <div className="space-y-1">
                        {column1Keys.map(key => (
                            <InspectionCheckbox key={key} label={formatLabel(key)} itemCondition={inspection.interior[key]}
                                onConditionChange={(p, v) => handleItemConditionChange('interior', key, p, v)} isProblemOriented={true} />
                        ))}
                    </div>
                </div>
                {/* Column 2 */}
                <div className="space-y-4">
                    <SectionHeader title="Dashboard & Controls" />
                    <div className="space-y-1">
                        {column2Keys.map(key => (
                            <InspectionCheckbox key={key} label={formatLabel(key)} itemCondition={inspection.interior[key]}
                                onConditionChange={(p, v) => handleItemConditionChange('interior', key, p, v)} isProblemOriented={true} />
                        ))}
                    </div>
                </div>
                {/* Column 3 */}
                <div className="space-y-4">
                    <SectionHeader title="Lights & Electrical" />
                    <div className="space-y-1">
                        {column3Keys.map(key => (
                            <InspectionCheckbox key={key} label={formatLabel(key)} itemCondition={inspection.interior[key]}
                                onConditionChange={(p, v) => handleItemConditionChange('interior', key, p, v)} isProblemOriented={true} />
                        ))}
                    </div>
                </div>
            </div>
            {/* Final Notes and Advisory */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="finalNotes" className="block text-sm font-medium text-gray-700 mb-1">Final Inspection Notes & Summary</label>
                    <textarea id="finalNotes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                        placeholder="Summarize the vehicle's overall condition..." />
                </div>
                {calculateInteriorScore() < 90 && (
                    <div className={`p-3 rounded-lg border ${ calculateInteriorScore() >= 75 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200' }`}>
                        <div className="flex items-start">
                            <FiAlertTriangle className={`mt-0.5 mr-2 flex-shrink-0 ${ calculateInteriorScore() >= 75 ? 'text-yellow-500' : 'text-red-500' }`} />
                            <div>
                                <h4 className={`font-medium ${ calculateInteriorScore() >= 75 ? 'text-yellow-800' : 'text-red-800' }`}>
                                    {calculateInteriorScore() >= 75 ? 'Interior Advisory' : 'Interior Warning'}
                                </h4>
                                <p className={`text-sm mt-1 ${ calculateInteriorScore() >= 75 ? 'text-yellow-700' : 'text-red-700' }`}>
                                    {calculateInteriorScore() >= 75 ? `Some interior components (${100 - calculateInteriorScore()}% failed checks) require attention.` : `Multiple interior issues (${100 - calculateInteriorScore()}% failed checks) require attention.`} Document severity and details.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <PhaseActions
                phase={3}
                onBack={() => setPhase(2)}
                backLabel="Back to Body"
                onNext={handlePhase3Submit}
                nextLabel="Complete & Submit Inspection"
                isNextDisabled={!inspectorName.trim()} // Still require inspector name
                isLoading={isLoading}
            />
        </PhaseContainer>
    );
  }, [plateNumber, calculateInteriorScore, getOverallInteriorStatus, inspection.interior, handleItemConditionChange, notes, setNotes, setPhase, handlePhase3Submit, inspectorName, isLoading]);


  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Vehicle Inspection System</h1>
            <p className="text-gray-600 mt-1">Step-by-step assessment for vehicle readiness.</p>
          </div>
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
             <motion.div key={`indicator-${phase}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`h-2.5 w-2.5 rounded-full ${ phase === 1 ? 'bg-blue-500' : phase === 2 ? 'bg-indigo-500' : 'bg-purple-500' }`} />
            <span className="text-sm font-medium text-gray-700">
              {phase === 1 ? 'Phase 1: Mechanical' : phase === 2 ? 'Phase 2: Body Exterior' : 'Phase 3: Interior & Electrical'}
            </span>
          </div>
        </motion.div>

        {/* Animated Phase Content */}
        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div key="phase1-motion">
              <Phase1MechanicalInspection
                initialInspectorName={inspectorName}
                onNameFinalized={setInspectorName}
                inspection={inspection}
                setInspection={setInspection}
                handleMechanicalCheck={handleMechanicalCheck}
                plateNumber={plateNumber}
                setPhase={setPhase}
                setShowFailAlert={setShowFailAlert}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
                router={router}
                checkMechanicalPass={checkMechanicalPass} // Pass the critical check function
              />
            </motion.div>
          )}
          {phase === 2 && (
             <motion.div key="phase2-motion">
               <Phase2BodyInspection />
             </motion.div>
          )}
          {phase === 3 && (
             <motion.div key="phase3-motion">
               <Phase3InteriorInspection />
             </motion.div>
          )}
        </AnimatePresence>

        {/* Failure Modal */}
        <AnimatePresence>
          {showFailAlert && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
              onClick={() => !isLoading && setShowFailAlert(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">Inspection Failed</h3>
                  <div className="mt-2 px-2 text-sm text-gray-500">
                    {/* Updated message to be more general */}
                    <p>The vehicle did not pass the mechanical inspection and cannot be approved.</p>
                    {/* Display the specific reason set in the state */}
                    {inspection.rejectionReason && ( <p className="mt-2 font-medium text-red-700">Reason: {inspection.rejectionReason}</p> )}
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button type="button" disabled={isLoading} onClick={() => setShowFailAlert(false)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="button" disabled={isLoading} onClick={handleFinalRejection}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm transition-colors disabled:opacity-50 disabled:bg-red-400">
                    {isLoading ? 'Submitting...' : 'Confirm Rejection & Submit'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading Overlay */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-[60]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
