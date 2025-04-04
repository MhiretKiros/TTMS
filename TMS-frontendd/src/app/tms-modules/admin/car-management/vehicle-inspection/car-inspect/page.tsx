'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { updateCarInspectionStatus, storedInspectionResults, StoredInspectionResult } from '../page';

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

type BodyCondition = {
  problem: boolean;
  severity: 'low' | 'medium' | 'high' | 'none';
  notes: string;
};

type BodyInspection = {
  bodyCollision: BodyCondition;
  bodyScratches: BodyCondition;
  paintCondition: BodyCondition;
  breakages: BodyCondition;
  cracks: BodyCondition;
};

type InteriorInspection = {
  engineExhaust: boolean;
  seatComfort: boolean;
  seatFabric: boolean;
  floorMat: boolean;
  rearViewMirror: boolean;
  carTab: boolean;
  mirrorAdjustment: boolean;
  doorLock: boolean;
  ventilationSystem: boolean;
  dashboardDecoration: boolean;
  seatBelt: boolean;
  sunshade: boolean;
  windowCurtain: boolean;
  interiorRoof: boolean;
  carIgnition: boolean;
  fuelConsumption: boolean;
  headlights: boolean;
  rainWiper: boolean;
  turnSignalLight: boolean;
  brakeLight: boolean;
  licensePlateLight: boolean;
  clock: boolean;
  rpm: boolean;
  batteryStatus: boolean;
  chargingIndicator: boolean;
};

type InspectionResult = {
  mechanical: MechanicalInspection;
  body?: BodyInspection;
  interior?: InteriorInspection;
  overallStatus: 'Approved' | 'Rejected' | 'PendingBodyInspection' | 'PendingInteriorInspection';
};

export default function CarInspectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plateNumber = searchParams.get('plateNumber');

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [inspection, setInspection] = useState<InspectionResult>({
    mechanical: {
      engineCondition: false,
      enginePower: false,
      suspension: false,
      brakes: false,
      steering: false,
      gearbox: false,
      mileage: false,
      fuelGauge: false,
      tempGauge: false,
      oilGauge: false,
    },
    body: {
      bodyCollision: { problem: false, severity: 'none', notes: '' },
      bodyScratches: { problem: false, severity: 'none', notes: '' },
      paintCondition: { problem: false, severity: 'none', notes: '' },
      breakages: { problem: false, severity: 'none', notes: '' },
      cracks: { problem: false, severity: 'none', notes: '' }
    },
    interior: {
      engineExhaust: false,
      seatComfort: false,
      seatFabric: false,
      floorMat: false,
      rearViewMirror: false,
      carTab: false,
      mirrorAdjustment: false,
      doorLock: false,
      ventilationSystem: false,
      dashboardDecoration: false,
      seatBelt: false,
      sunshade: false,
      windowCurtain: false,
      interiorRoof: false,
      carIgnition: false,
      fuelConsumption: false,
      headlights: false,
      rainWiper: false,
      turnSignalLight: false,
      brakeLight: false,
      licensePlateLight: false,
      clock: false,
      rpm: false,
      batteryStatus: false,
      chargingIndicator: false,
    },
    overallStatus: 'Rejected'
  });
  const [notes, setNotes] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [showFailAlert, setShowFailAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMechanicalCheck = (field: keyof MechanicalInspection) => {
    const newValue = !inspection.mechanical[field];
    setInspection(prev => ({
      ...prev,
      mechanical: { ...prev.mechanical, [field]: newValue }
    }));
  };

  const handleBodyConditionChange = (
    field: keyof BodyInspection,
    property: keyof BodyCondition,
    value: any
  ) => {
    setInspection(prev => ({
      ...prev,
      body: {
        ...prev.body!,
        [field]: {
          ...prev.body![field],
          [property]: value
        }
      }
    }));
  };

  const handleInteriorCheck = (field: keyof InteriorInspection) => {
    setInspection(prev => ({
      ...prev,
      interior: {
        ...prev.interior!,
        [field]: !prev.interior![field]
      }
    }));
  };

  const calculateBodyScore = () => {
    if (!inspection.body) return 0;

    const totalItems = 5;
    let passedItems = 0;

    if (!inspection.body.bodyCollision.problem) passedItems++;
    if (!inspection.body.bodyScratches.problem) passedItems++;
    if (!inspection.body.breakages.problem) passedItems++;
    if (!inspection.body.cracks.problem) passedItems++;
    if (!inspection.body.paintCondition.problem) passedItems++;

    return Math.round((passedItems / totalItems) * 100);
  };

  const calculateInteriorScore = () => {
    if (!inspection.interior) return 0;

    const totalItems = Object.keys(inspection.interior).length;
    const passedItems = Object.values(inspection.interior).filter(val => val).length;

    return Math.round((passedItems / totalItems) * 100);
  };

  const getOverallBodyStatus = () => {
    const score = calculateBodyScore();
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getOverallInteriorStatus = () => {
    const score = calculateInteriorScore();
    if (score === 100) return 'Perfect';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };
  const checkMechanicalPass = () => {
    const { mechanical } = inspection;
    return (
      mechanical.engineCondition &&
      mechanical.enginePower &&
      mechanical.brakes &&
      mechanical.steering &&
      mechanical.suspension &&
      mechanical.gearbox &&
      mechanical.mileage &&
      mechanical.fuelGauge &&
      mechanical.tempGauge &&
      mechanical.oilGauge
    );
  };

  const checkBodyPass = () => {
    if (!inspection.body) return false;
    return (
      !inspection.body.bodyCollision.problem &&
      !inspection.body.bodyScratches.problem &&
      !inspection.body.breakages.problem &&
      !inspection.body.cracks.problem &&
      !inspection.body.paintCondition.problem
    );
  };

  const checkInteriorPass = () => {
    if (!inspection.interior) return false;
    return Object.values(inspection.interior).every(val => val === true);
  };

  const handlePhase1Submit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mechanicalPass = checkMechanicalPass();
    if (mechanicalPass) {
      setPhase(2);
      setInspection(prev => ({ ...prev, overallStatus: 'PendingBodyInspection' }));
    } else {
      setInspection(prev => ({ 
        ...prev, 
        overallStatus: 'Rejected',
        serviceStatus: 'NotReady',
        rejectionReason: 'Failed mechanical inspection'
      }));
      setShowFailAlert(true);
    }
    setIsLoading(false);
  };

  const handlePhase2Submit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const bodyPass = checkBodyPass();
    if (bodyPass) {
      setPhase(3);
      setInspection(prev => ({ ...prev, overallStatus: 'PendingInteriorInspection' }));
    } else {
      setInspection(prev => ({ 
        ...prev, 
        overallStatus: 'ConditionallyApproved',
        serviceStatus: 'ReadyWithWarning',
        warningMessage: 'Body issues must be fixed within 1 month',
        warningDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      setPhase(3); // Still continue to interior inspection
    }
    setIsLoading(false);
  };

  const handlePhase3Submit = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const interiorPass = checkInteriorPass();
    if (interiorPass) {
      if (inspection.overallStatus === 'ConditionallyApproved') {
        // Body issues exist but interior passed
        setInspection(prev => ({ 
          ...prev, 
          overallStatus: 'ConditionallyApproved',
          serviceStatus: 'ReadyWithWarning'
        }));
      } else {
        // Fully passed
        setInspection(prev => ({ 
          ...prev, 
          overallStatus: 'Approved',
          serviceStatus: 'Ready'
        }));
      }
    } else {
      if (inspection.overallStatus === 'ConditionallyApproved') {
        // Both body and interior issues
        setInspection(prev => ({ 
          ...prev, 
          overallStatus: 'ConditionallyApproved',
          serviceStatus: 'ReadyWithWarning',
          warningMessage: 'Body and interior issues must be addressed',
          warningDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
      } else {
        // Only interior issues
        setInspection(prev => ({ 
          ...prev, 
          overallStatus: 'ConditionallyApproved',
          serviceStatus: 'ReadyWithWarning',
          warningMessage: 'Interior issues must be fixed before next inspection',
          warningDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
    }
    
    handleSubmit();
    setIsLoading(false);
  };

  const handleSubmit = () => {
    const finalResult = {
      plateNumber,
      inspectorName,
      inspection: { ...inspection },
      notes,
      status: inspection.overallStatus,
      bodyScore: calculateBodyScore(),
      interiorScore: calculateInteriorScore(),
      serviceStatus: inspection.serviceStatus,
      ...(inspection.warningMessage && { warningMessage: inspection.warningMessage }),
      ...(inspection.warningDeadline && { warningDeadline: inspection.warningDeadline })
    };

    // Update the inspection status in the system
    updateCarInspectionStatus(plateNumber!, true, inspection.overallStatus);

    // Redirect to results page with all parameters
    const queryParams = new URLSearchParams();
    Object.entries(finalResult).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    router.push(`/tms-modules/admin/car-management/vehicle-inspection/result?${queryParams.toString()}`);
  };

  const Phase1MechanicalInspection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Vehicle: <span className="text-blue-600">{plateNumber}</span>
        </h2>
        <div className="text-sm text-gray-500">
          Inspection Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Engine & Drivetrain</h3>
          <InspectionCheckbox
            label="1. Engine Condition - No leaks or unusual noises"
            checked={inspection.mechanical.engineCondition}
            onChange={() => handleMechanicalCheck('engineCondition')}
          />
          <InspectionCheckbox
            label="2. Engine Power - Normal performance"
            checked={inspection.mechanical.enginePower}
            onChange={() => handleMechanicalCheck('enginePower')}
          />
          <InspectionCheckbox
            label="6. Gearbox Condition - Smooth operation"
            checked={inspection.mechanical.gearbox}
            onChange={() => handleMechanicalCheck('gearbox')}
          />
          <InspectionCheckbox
            label="7. Mileage - Matches service records"
            checked={inspection.mechanical.mileage}
            onChange={() => handleMechanicalCheck('mileage')}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Chassis & Controls</h3>
          <InspectionCheckbox
            label="3. Suspension Condition - No excessive play"
            checked={inspection.mechanical.suspension}
            onChange={() => handleMechanicalCheck('suspension')}
          />
          <InspectionCheckbox
            label="4. Brake Condition - Proper stopping power"
            checked={inspection.mechanical.brakes}
            onChange={() => handleMechanicalCheck('brakes')}
          />
          <InspectionCheckbox
            label="5. Steering Condition - Responsive and aligned"
            checked={inspection.mechanical.steering}
            onChange={() => handleMechanicalCheck('steering')}
          />
          <InspectionCheckbox
            label="8. Fuel Gauge - Accurate reading"
            checked={inspection.mechanical.fuelGauge}
            onChange={() => handleMechanicalCheck('fuelGauge')}
          />
          <InspectionCheckbox
            label="9. Temperature Gauge - Normal operating range"
            checked={inspection.mechanical.tempGauge}
            onChange={() => handleMechanicalCheck('tempGauge')}
          />
          <InspectionCheckbox
            label="10. Oil Gauge - Proper pressure reading"
            checked={inspection.mechanical.oilGauge}
            onChange={() => handleMechanicalCheck('oilGauge')}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Inspector Name *</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={inspectorName}
          onChange={(e) => setInspectorName(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
  onClick={handlePhase1Submit}
  disabled={!inspectorName || isLoading}
  className={`px-6 py-2 text-white rounded-lg ${!inspectorName || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
    }`}
>
  {isLoading ? 'Loading...' : checkMechanicalPass() ? 'Continue to Body Inspection' : 'Complete Inspection'}
</button>
      </div>
    </div>
  );

  const Phase2BodyInspection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Vehicle: <span className="text-blue-600">{plateNumber}</span>
        </h2>
        <div className="text-sm text-gray-500">
          Inspection Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="font-medium text-lg border-b pb-2">
          Exterior Body Condition - Score: {calculateBodyScore()}% ({getOverallBodyStatus()})
        </h3>

        <InspectionCheckbox
          label="Body Collision Damage"
          checked={inspection.body?.bodyCollision.problem || false}
          onChange={() => handleBodyConditionChange('bodyCollision', 'problem', !inspection.body?.bodyCollision.problem)}
          warning
          showSeverity={inspection.body?.bodyCollision.problem}
          severity={inspection.body?.bodyCollision.severity}
          onSeverityChange={(value) => handleBodyConditionChange('bodyCollision', 'severity', value)}
          notes={inspection.body?.bodyCollision.notes}
          onNotesChange={(value) => handleBodyConditionChange('bodyCollision', 'notes', value)}
        />

        <InspectionCheckbox
          label="Significant Body Scratches"
          checked={inspection.body?.bodyScratches.problem || false}
          onChange={() => handleBodyConditionChange('bodyScratches', 'problem', !inspection.body?.bodyScratches.problem)}
          warning
          showSeverity={inspection.body?.bodyScratches.problem}
          severity={inspection.body?.bodyScratches.severity}
          onSeverityChange={(value) => handleBodyConditionChange('bodyScratches', 'severity', value)}
          notes={inspection.body?.bodyScratches.notes}
          onNotesChange={(value) => handleBodyConditionChange('bodyScratches', 'notes', value)}
        />

        <InspectionCheckbox
          label="Paint in Good Condition"
          checked={!inspection.body?.paintCondition.problem || false}
          onChange={() => handleBodyConditionChange('paintCondition', 'problem', !inspection.body?.paintCondition.problem)}
          showSeverity={inspection.body?.paintCondition.problem}
          severity={inspection.body?.paintCondition.severity}
          onSeverityChange={(value) => handleBodyConditionChange('paintCondition', 'severity', value)}
          notes={inspection.body?.paintCondition.notes}
          onNotesChange={(value) => handleBodyConditionChange('paintCondition', 'notes', value)}
        />

        <InspectionCheckbox
          label="Breakages in Body Panels"
          checked={inspection.body?.breakages.problem || false}
          onChange={() => handleBodyConditionChange('breakages', 'problem', !inspection.body?.breakages.problem)}
          warning
          showSeverity={inspection.body?.breakages.problem}
          severity={inspection.body?.breakages.severity}
          onSeverityChange={(value) => handleBodyConditionChange('breakages', 'severity', value)}
          notes={inspection.body?.breakages.notes}
          onNotesChange={(value) => handleBodyConditionChange('breakages', 'notes', value)}
        />

        <InspectionCheckbox
          label="Cracks in Windshield/Windows"
          checked={inspection.body?.cracks.problem || false}
          onChange={() => handleBodyConditionChange('cracks', 'problem', !inspection.body?.cracks.problem)}
          warning
          showSeverity={inspection.body?.cracks.problem}
          severity={inspection.body?.cracks.severity}
          onSeverityChange={(value) => handleBodyConditionChange('cracks', 'severity', value)}
          notes={inspection.body?.cracks.notes}
          onNotesChange={(value) => handleBodyConditionChange('cracks', 'notes', value)}
        />
      </div>

      <div className={`mb-6 p-4 rounded-lg ${calculateBodyScore() >= 60 ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
        <h4 className="font-bold mb-2">Body Condition Summary:</h4>
        <p>Overall Score: {calculateBodyScore()}%</p>
        <p>Status: {getOverallBodyStatus()}</p>
        {calculateBodyScore() < 80 && (
          <p className="text-red-600 mt-2">
            Note: This vehicle has some body condition issues that may require attention.
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Inspection Notes</label>
        <textarea
          className="w-full p-3 border rounded-lg"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional observations..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setPhase(1)}
          className="px-6 py-2 bg-gray-300 rounded-lg"
        >
          Back to Mechanical
        </button>
        <button
          onClick={handlePhase2Submit}
          disabled={!inspectorName || isLoading}
          className={`px-6 py-2 text-white rounded-lg ${!inspectorName || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {isLoading ? 'Loading...' : 'Continue to Interior Inspection'}
        </button>
      </div>
    </div>
  );

  const Phase3InteriorInspection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Vehicle: <span className="text-blue-600">{plateNumber}</span>
        </h2>
        <div className="text-sm text-gray-500">
          Inspection Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Seating & Interior</h3>
          <InspectionCheckbox
            label="1. Seat Comfort - No significant wear"
            checked={inspection.interior?.seatComfort || false}
            onChange={() => handleInteriorCheck('seatComfort')}
          />
          <InspectionCheckbox
            label="2. Seat Fabric - No major stains/tears"
            checked={inspection.interior?.seatFabric || false}
            onChange={() => handleInteriorCheck('seatFabric')}
          />
          <InspectionCheckbox
            label="3. Floor Mat - Clean and intact"
            checked={inspection.interior?.floorMat || false}
            onChange={() => handleInteriorCheck('floorMat')}
          />
          <InspectionCheckbox
            label="4. Rear View Mirror - Properly mounted"
            checked={inspection.interior?.rearViewMirror || false}
            onChange={() => handleInteriorCheck('rearViewMirror')}
          />
          <InspectionCheckbox
            label="5. Mirror Adjustment - Functional"
            checked={inspection.interior?.mirrorAdjustment || false}
            onChange={() => handleInteriorCheck('mirrorAdjustment')}
          />
          <InspectionCheckbox
            label="6. Door Lock - All functional"
            checked={inspection.interior?.doorLock || false}
            onChange={() => handleInteriorCheck('doorLock')}
          />
          <InspectionCheckbox
            label="7. Ventilation System - Working properly"
            checked={inspection.interior?.ventilationSystem || false}
            onChange={() => handleInteriorCheck('ventilationSystem')}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Dashboard & Controls</h3>
          <InspectionCheckbox
            label="8. Dashboard Decoration - No damage"
            checked={inspection.interior?.dashboardDecoration || false}
            onChange={() => handleInteriorCheck('dashboardDecoration')}
          />
          <InspectionCheckbox
            label="9. Seat Belt - All functional"
            checked={inspection.interior?.seatBelt || false}
            onChange={() => handleInteriorCheck('seatBelt')}
          />
          <InspectionCheckbox
            label="10. Sunshade - Functional"
            checked={inspection.interior?.sunshade || false}
            onChange={() => handleInteriorCheck('sunshade')}
          />
          <InspectionCheckbox
            label="11. Window Curtain - Functional"
            checked={inspection.interior?.windowCurtain || false}
            onChange={() => handleInteriorCheck('windowCurtain')}
          />
          <InspectionCheckbox
            label="12. Interior Roof - No damage"
            checked={inspection.interior?.interiorRoof || false}
            onChange={() => handleInteriorCheck('interiorRoof')}
          />
          <InspectionCheckbox
            label="13. Car Ignition - Starts smoothly"
            checked={inspection.interior?.carIgnition || false}
            onChange={() => handleInteriorCheck('carIgnition')}
          />
          <InspectionCheckbox
            label="14. Fuel Consumption - Normal"
            checked={inspection.interior?.fuelConsumption || false}
            onChange={() => handleInteriorCheck('fuelConsumption')}
          />
        </div>
        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Lights & Gauges</h3>
          <InspectionCheckbox
            label="15. Headlights - Working properly"
            checked={inspection.interior?.headlights || false}
            onChange={() => handleInteriorCheck('headlights')}
          />
          <InspectionCheckbox
            label="16. Rain Wiper - Working properly"
            checked={inspection.interior?.rainWiper || false}
            onChange={() => handleInteriorCheck('rainWiper')}
          />
          <InspectionCheckbox
            label="17. Turn Signal Light - Working properly"
            checked={inspection.interior?.turnSignalLight || false}
            onChange={() => handleInteriorCheck('turnSignalLight')}
          />
          <InspectionCheckbox
            label="18. Brake Light - Working properly"
            checked={inspection.interior?.brakeLight || false}
            onChange={() => handleInteriorCheck('brakeLight')}
          />
          <InspectionCheckbox
            label="19. License Plate Light - Working properly"
            checked={inspection.interior?.licensePlateLight || false}
            onChange={() => handleInteriorCheck('licensePlateLight')}
          />
          <InspectionCheckbox
            label="20. Clock - Working properly"
            checked={inspection.interior?.clock || false}
            onChange={() => handleInteriorCheck('clock')}
          />
          <InspectionCheckbox
            label="21. RPM - Working properly"
            checked={inspection.interior?.rpm || false}
            onChange={() => handleInteriorCheck('rpm')}
          />
          <InspectionCheckbox
            label="22. Battery Status - Working properly"
            checked={inspection.interior?.batteryStatus || false}
            onChange={() => handleInteriorCheck('batteryStatus')}
          />
          <InspectionCheckbox
            label="23. Charging Indicator - Working properly"
            checked={inspection.interior?.chargingIndicator || false}
            onChange={() => handleInteriorCheck('chargingIndicator')}
          />
        </div>
      </div>

      <div className={`mb-6 p-4 rounded-lg ${calculateInteriorScore() >= 60 ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
        <h4 className="font-bold mb-2">Interior Condition Summary:</h4>
        <p>Overall Score: {calculateInteriorScore()}%</p>
        <p>Status: {getOverallInteriorStatus()}</p>
        {calculateInteriorScore() < 80 && (
          <p className="text-red-600 mt-2">
            Note: This vehicle has some interior condition issues that may require attention.
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Inspection Notes</label>
        <textarea
          className="w-full p-3 border rounded-lg"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional observations..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setPhase(2)}
          className="px-6 py-2 bg-gray-300 rounded-lg"
        >
          Back to Body
        </button>
        <button
          onClick={handleSubmit}
          disabled={!inspectorName || isLoading}
          className={`px-6 py-2 text-white rounded-lg ${!inspectorName || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {isLoading ? 'Loading...' : 'Complete Inspection'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      <h1 className="text-3xl font-bold mb-8 text-teal-600">Car Inspection</h1>

      {/* Fail Alert Modal */}
      {showFailAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="bg-red-700 text-white p-8 w-[600px] rounded-lg shadow-2xl border-4 border-black animate-pulse">
            <h2 className="text-5xl font-extrabold mb-6 text-center">❌</h2>
            <p className="text-2xl font-semibold text-center">
              The car has failed the inspection.
            </p>
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-white text-red-700 font-bold rounded-lg hover:bg-gray-300 transition duration-300"
                onClick={handleFinalRejection}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-teal-600"></div>
        </div>
      )}

      {phase === 1 && <Phase1MechanicalInspection />}
      {phase === 2 && <Phase2BodyInspection />}
      {phase === 3 && <Phase3InteriorInspection />}
    </div>
  );
}

type InspectionCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
  warning?: boolean;
  showSeverity?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'none';
  onSeverityChange?: (value: 'low' | 'medium' | 'high' | 'none') => void;
  notes?: string;
  onNotesChange?: (value: string) => void;
};

function InspectionCheckbox({
  label,
  checked,
  onChange,
  warning,
  showSeverity,
  severity,
  onSeverityChange,
  notes,
  onNotesChange
}: InspectionCheckboxProps) {
  return (
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        className={`form-checkbox h-5 w-5 text-blue-600 ${warning ? 'border-red-500' : 'border-gray-300'}`}
        checked={checked}
        onChange={onChange}
      />
      <label className={`text-gray-700 ${warning ? 'text-red-600' : ''}`}>
        {label}
      </label>
      {showSeverity && (
        <div className="ml-4">
          <select
            className="border rounded p-1"
            value={severity}
            onChange={(e) => onSeverityChange && onSeverityChange(e.target.value as 'low' | 'medium' | 'high' | 'none')}
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      )}
      {showSeverity && (
        <div className="ml-4 w-full">
          <textarea
            className="w-full p-1 border rounded"
            placeholder="Notes"
            value={notes}
            onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
